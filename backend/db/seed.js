const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool, query } = require('../config/db');

async function seedDatabase() {
    console.log('🌱 Starting database migration and seed...');

    try {
        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log('✅ Tables created or verified successfully');

        // Check if admin user already exists
        const userCheck = await query('SELECT id FROM users WHERE email = $1', ['admin@animehub.com']);
        let adminId;

        if (userCheck.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const userRes = await query(
                `INSERT INTO users (username, email, password_hash, role)
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                ['Admin Theara', 'admin@animehub.com', hashedPassword, 'admin']
            );
            adminId = userRes.rows[0].id;
            console.log('👤 Admin user created: admin@animehub.com / admin123');
        } else {
            adminId = userCheck.rows[0].id;
        }

        // Check if anime already exists
        const animeCheck = await query('SELECT COUNT(*) FROM anime');
        if (parseInt(animeCheck.rows[0].count, 10) === 0) {
            const initialAnime = [
                {
                    title: 'Fate / Stay Night: Unlimited Blade Works',
                    native_title: 'フェイト／ステイナイト, Feito／sutei naito',
                    type: 'TV Series',
                    genre: 'Action, Adventure, Fantasy, Magic',
                    synopsis: 'Every human inhabiting the world of Alcia is branded by a "Count" or a number written on their body. For Hina’s mother, her total drops to 0 and she’s pulled into the Abyss, never to be seen again.',
                    studio: 'ufotable',
                    status: 'Completed',
                    release_date: 'Oct 02, 2014',
                    poster_url: 'img/trending/trend-1.jpg',
                    backdrop_url: 'img/hero/hero-1.jpg',
                    rating: 8.50,
                    views: 131541,
                },
                {
                    title: 'Gintama Movie 2: Kanketsu-hen - Yorozuya yo Eien',
                    native_title: '劇場版 銀魂 完結篇 万事屋よ永遠なれ',
                    type: 'Movie',
                    genre: 'Action, Comedy, Sci-Fi',
                    synopsis: 'Gintoki finds himself transported into a dark future where Edo has been decimated by a mysterious disease, and he is presumed dead.',
                    studio: 'Sunrise',
                    status: 'Completed',
                    release_date: 'Jul 06, 2013',
                    poster_url: 'img/trending/trend-2.jpg',
                    backdrop_url: 'img/hero/hero-1.jpg',
                    rating: 8.90,
                    views: 94520,
                },
                {
                    title: 'Shingeki no Kyojin Season 3 Part 2',
                    native_title: '進撃の巨人 Season 3 Part 2',
                    type: 'TV Series',
                    genre: 'Action, Drama, Fantasy, Mystery',
                    synopsis: 'Seeking to restore humanity’s diminishing hope, the Scout Regiment embarks on a mission to retake Wall Maria and recover the secrets in the basement.',
                    studio: 'Wit Studio',
                    status: 'Completed',
                    release_date: 'Apr 29, 2019',
                    poster_url: 'img/trending/trend-3.jpg',
                    backdrop_url: 'img/hero/hero-1.jpg',
                    rating: 9.10,
                    views: 245100,
                },
                {
                    title: 'Fullmetal Alchemist: Brotherhood',
                    native_title: '鋼の錬金術師 FULLMETAL ALCHEMIST',
                    type: 'TV Series',
                    genre: 'Action, Adventure, Drama, Fantasy',
                    synopsis: 'After a horrific alchemy experiment goes wrong, brothers Edward and Alphonse Elric search for the Philosopher’s Stone to restore their bodies.',
                    studio: 'Bones',
                    status: 'Completed',
                    release_date: 'Apr 05, 2009',
                    poster_url: 'img/trending/trend-4.jpg',
                    backdrop_url: 'img/hero/hero-1.jpg',
                    rating: 9.20,
                    views: 310450,
                },
                {
                    title: 'Fate/stay night Movie: Heaven\'s Feel - II. Lost Butterfly',
                    native_title: '劇場版 Fate/stay night [Heaven\'s Feel] II. lost butterfly',
                    type: 'Movie',
                    genre: 'Action, Fantasy, Supernatural',
                    synopsis: 'The Fifth Holy Grail War continues as Shirou and Sakura find their bond tested by dark supernatural secrets.',
                    studio: 'ufotable',
                    status: 'Completed',
                    release_date: 'Jan 12, 2019',
                    poster_url: 'img/recent/recent-2.jpg',
                    backdrop_url: 'img/hero/hero-1.jpg',
                    rating: 8.70,
                    views: 180200,
                },
                {
                    title: 'Sen to Chihiro no Kamikakushi (Spirited Away)',
                    native_title: '千と千尋の神隠し',
                    type: 'Movie',
                    genre: 'Adventure, Drama, Family, Fantasy',
                    synopsis: 'A young girl enters an otherworldly spirit realm to free her cursed parents and must work in a bathhouse for spirits.',
                    studio: 'Studio Ghibli',
                    status: 'Completed',
                    release_date: 'Jul 20, 2001',
                    poster_url: 'img/popular/popular-1.jpg',
                    backdrop_url: 'img/hero/hero-1.jpg',
                    rating: 8.80,
                    views: 450120,
                }
            ];

            for (const item of initialAnime) {
                const animeRes = await query(
                    `INSERT INTO anime (title, native_title, type, genre, synopsis, studio, status, release_date, poster_url, backdrop_url, rating, views)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
                    [item.title, item.native_title, item.type, item.genre, item.synopsis, item.studio, item.status, item.release_date, item.poster_url, item.backdrop_url, item.rating, item.views]
                );

                const animeId = animeRes.rows[0].id;

                // Seed sample episodes for the anime
                for (let i = 1; i <= 12; i++) {
                    const epNumStr = i < 10 ? `0${i}` : `${i}`;
                    await query(
                        `INSERT INTO episodes (anime_id, episode_number, title, video_url, duration_minutes)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [animeId, i, `Episode ${epNumStr}`, 'videos/1.mp4', 24]
                    );
                }

                // Seed sample review
                await query(
                    `INSERT INTO reviews (anime_id, user_id, comment, rating)
                     VALUES ($1, $2, $3, $4)`,
                    [animeId, adminId, 'Masterpiece animation with incredible storytelling and soundtrack!', 9]
                );
            }

            console.log(`🎬 Seeded ${initialAnime.length} anime titles with episodes and reviews`);
        } else {
            console.log('ℹ️ Anime catalog already populated');
        }

        console.log('🎉 Seed process finished successfully!');
    } catch (err) {
        console.error('❌ Database seed error:', err);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
