const { query } = require('../config/db');

// @route   GET /api/anime
// @desc    Get anime list with filter, search, sort & pagination
const getAnimeList = async (req, res, next) => {
    try {
        const { type, genre, q, sort = 'recent', limit = 24, page = 1 } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        let sql = `SELECT id, title, native_title, type, genre, synopsis, studio, status, 
                          poster_url, backdrop_url, rating, views, created_at 
                   FROM anime WHERE 1=1`;
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
            sql += ` AND LOWER(type) LIKE $${paramIdx++}`;
            params.push(`%${mappedType.toLowerCase()}%`);
        }

        if (genre && genre.toLowerCase() !== 'all') {
            sql += ` AND LOWER(genre) LIKE $${paramIdx++}`;
            params.push(`%${genre.toLowerCase()}%`);
        }

        if (q) {
            sql += ` AND (LOWER(title) LIKE $${paramIdx} OR LOWER(native_title) LIKE $${paramIdx})`;
            paramIdx++;
            params.push(`%${q.toLowerCase()}%`);
        }

        // Sorting
        if (sort === 'rating') {
            sql += ` ORDER BY rating DESC`;
        } else if (sort === 'views') {
            sql += ` ORDER BY views DESC`;
        } else if (sort === 'title') {
            sql += ` ORDER BY title ASC`;
        } else {
            sql += ` ORDER BY created_at DESC`;
        }

        sql += ` LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
        params.push(parseInt(limit, 10), offset);

        const result = await query(sql, params);
        const countRes = await query('SELECT COUNT(*) FROM anime');

        res.json({
            success: true,
            total: parseInt(countRes.rows[0].count, 10),
            page: parseInt(page, 10),
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        next(err);
    }
};

// @route   GET /api/anime/:id
// @desc    Get single anime details with episodes and reviews
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
        const { title, native_title, type, genre, synopsis, studio, status, release_date, poster_url, backdrop_url } = req.body;

        if (!title || !genre || !poster_url) {
            return res.status(400).json({ success: false, message: 'Title, genre, and poster URL are required.' });
        }

        const result = await query(
            `INSERT INTO anime (title, native_title, type, genre, synopsis, studio, status, release_date, poster_url, backdrop_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [title, native_title, type || 'TV Series', genre, synopsis, studio, status || 'Airing', release_date, poster_url, backdrop_url]
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

module.exports = {
    getAnimeList,
    getAnimeById,
    createAnime
};
