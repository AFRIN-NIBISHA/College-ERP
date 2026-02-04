const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        }
        : {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME
        }
);

async function fillAggressive() {
    const year = 3;
    const section = 'A';
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    try {
        console.log(`Aggressively filling gaps for Year ${year} - Section ${section}...`);

        // Get Valid Subjects for this class to pick from
        const subRes = await pool.query(`
            SELECT DISTINCT subject_id, staff_id 
            FROM timetable 
            WHERE year = $1 AND section = $2 AND subject_id IS NOT NULL
        `, [year, section]);

        if (subRes.rows.length === 0) {
            console.log("No valid entries to copy from!");
            return;
        }
        const options = subRes.rows;

        for (const day of days) {
            for (const p of periods) {
                // 1. Check if row exists
                const check = await pool.query(`
                    SELECT id, subject_id FROM timetable 
                    WHERE year = $1 AND section = $2 AND day = $3 AND period = $4
                `, [year, section, day, p]);

                let shouldUpdate = false;
                let shouldInsert = false;

                if (check.rows.length === 0) {
                    shouldInsert = true;
                } else if (check.rows[0].subject_id === null) {
                    shouldUpdate = true; // Exists but empty
                }

                if (shouldInsert || shouldUpdate) {
                    const random = options[Math.floor(Math.random() * options.length)];
                    console.log(`Fixing ${day} Period ${p} -> Subject ${random.subject_id}`);

                    if (shouldInsert) {
                        await pool.query(`
                            INSERT INTO timetable (year, section, day, period, subject_id, staff_id)
                            VALUES ($1, $2, $3, $4, $5, $6)
                        `, [year, section, day, p, random.subject_id, random.staff_id]);
                    } else {
                        await pool.query(`
                            UPDATE timetable 
                            SET subject_id = $1, staff_id = $2
                            WHERE id = $3
                        `, [random.subject_id, random.staff_id, check.rows[0].id]);
                    }
                }
            }
        }
        console.log("Done.");

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

fillAggressive();
