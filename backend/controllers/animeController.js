const { query } = require('../config/db');

// @route   GET /api/anime
// @desc    Get anime list with filter, search, sort & pagination
const getAnimeList = async (req, res, next) => {
    try {
        const { type, genre, q, search, sort = 'recent' } = req.query;
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 100);
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const offset = (page - 1) * limit;

        let whereSql = ' WHERE 1=1';
        const params = [];
        let paramIdx = 1;

        if (type && type.toLowerCase() !== 'all') {
            const typeMap = {
                'movies': 'Movie',
                'movie': 'Movie',
                'tv': 'TV Series',
                'live': 'Live Action'
            };
            const mappedType = typeMap[type.toLowerCase()] || type;
            whereSql += ` AND LOWER(type) LIKE $${paramIdx++}`;
            params.push(`%${mappedType.toLowerCase()}%`);
        }

        if (genre && genre.toLowerCase() !== 'all') {
            whereSql += ` AND LOWER(genre) LIKE $${paramIdx++}`;
            params.push(`%${genre.toLowerCase()}%`);
        }

        const searchTerm = q || search;
        if (searchTerm) {
            whereSql += ` AND (LOWER(title) LIKE $${paramIdx} OR LOWER(native_title) LIKE $${paramIdx} OR LOWER(genre) LIKE $${paramIdx})`;
            paramIdx++;
            params.push(`%${searchTerm.toLowerCase()}%`);
        }

        // Count with the same filters as the data query
        const countRes = await query(`SELECT COUNT(*) FROM anime${whereSql}`, [...params]);

        // Sorting
        let orderSql = ' ORDER BY created_at DESC';
        if (sort === 'rating') {
            orderSql = ' ORDER BY rating DESC';
        } else if (sort === 'views') {
            orderSql = ' ORDER BY views DESC';
        } else if (sort === 'title') {
            orderSql = ' ORDER BY title ASC';
        }

        const sql = `SELECT id, title, native_title, type, genre, synopsis, studio, status, 
                            poster_url, backdrop_url, rating, views, created_at 
                     FROM anime${whereSql}${orderSql} LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
        const dataParams = [...params, limit, offset];

        const result = await query(sql, dataParams);

        res.json({
            success: true,
            total: parseInt(countRes.rows[0].count, 10),
            page,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        next(err);
    }
};

// @route   GET /api/anime/:id
// @desc    Get single anime details by ID with episodes & reviews
const getAnimeById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const animeRes = await query(
            `SELECT id, title, native_title, type, genre, synopsis, studio, status, 
                    release_date, poster_url, backdrop_url, rating, views, created_at 
             FROM anime WHERE id = $1`,
            [id]
        );

        if (animeRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Anime not found.' });
        }

        const anime = animeRes.rows[0];

        // Increment view count
        await query('UPDATE anime SET views = views + 1 WHERE id = $1', [id]);

        // Get episodes
        const episodesRes = await query(
            `SELECT id, episode_number, title, video_url, duration_minutes 
             FROM episodes WHERE anime_id = $1 ORDER BY episode_number ASC`,
            [id]
        );

        // Get reviews
        const reviewsRes = await query(
            `SELECT r.id, r.comment, r.rating, r.created_at, 
                    u.username, u.avatar_url 
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.anime_id = $1
             ORDER BY r.created_at DESC`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...anime,
                views: anime.views + 1,
                episodes: episodesRes.rows,
                reviews: reviewsRes.rows
            }
        });
    } catch (err) {
        next(err);
    }
};

// @route   POST /api/anime
// @desc    Create new anime (Admin only)
const createAnime = async (req, res, next) => {
    try {
        const { title, native_title, type, genre, synopsis, studio, status, rating, poster_url, backdrop_url } = req.body;

        if (!title || !genre || !poster_url) {
            return res.status(400).json({ success: false, message: 'Title, genre, and poster URL are required.' });
        }

        const result = await query(
            `INSERT INTO anime (title, native_title, type, genre, synopsis, studio, status, rating, poster_url, backdrop_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [title, native_title, type || 'TV Series', genre, synopsis, studio, status || 'Airing', rating ? parseFloat(rating) : 8.5, poster_url, backdrop_url || poster_url]
        );

        res.status(201).json({
            success: true,
            message: 'Anime added successfully!',
            data: result.rows[0]
        });
    } catch (err) {
        next(err);
    }
};

// @route   DELETE /api/anime/:id
// @desc    Delete anime (Admin only)
const deleteAnime = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM anime WHERE id = $1 RETURNING id, title', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Anime not found.' });
        }
        res.json({
            success: true,
            message: `Anime "${result.rows[0].title}" deleted successfully.`
        });
    } catch (err) {
        next(err);
    }
};

// @route   GET /api/anime/admin/stats
// @desc    Get system overview stats for Admin Dashboard (Admin only)
const getAdminStats = async (req, res, next) => {
    try {
        const animeCount = await query('SELECT COUNT(*) FROM anime');
        const userCount = await query('SELECT COUNT(*) FROM users');
        const reviewCount = await query('SELECT COUNT(*) FROM reviews');
        const messageCount = await query('SELECT COUNT(*) FROM contact_messages');
        const viewsCount = await query('SELECT COALESCE(SUM(views), 0) AS total_views FROM anime');

        res.json({
            success: true,
            stats: {
                totalAnime: parseInt(animeCount.rows[0].count, 10),
                totalUsers: parseInt(userCount.rows[0].count, 10),
                totalReviews: parseInt(reviewCount.rows[0].count, 10),
                totalMessages: parseInt(messageCount.rows[0].count, 10),
                totalViews: parseInt(viewsCount.rows[0].total_views, 10)
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAnimeList,
    getAnimeById,
    createAnime,
    deleteAnime,
    getAdminStats
};
