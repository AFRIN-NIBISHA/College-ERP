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

async function fillGaps() {
    const year = 3;
    const section = 'A';
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    try {
        console.log(`Checking gaps for Year ${year} - Section ${section}...`);

        // 1. Get valid subjects and staff for this year
        // We can just grab some existing allocations to reuse
        const allocations = await pool.query(`
            SELECT DISTINCT subject_id, staff_id 
            FROM timetable 
            WHERE year = $1 AND section = $2 AND subject_id IS NOT NULL
        `, [year, section]);

        if (allocations.rows.length === 0) {
            console.log("No existing data to copy from!");
            return;
        }

        const options = allocations.rows;

        // 2. Iterate and fill
        for (const day of days) {
            for (const p of periods) {
                const check = await pool.query(`
                    SELECT id FROM timetable 
                    WHERE year = $1 AND section = $2 AND day = $3 AND period = $4
                `, [year, section, day, p]);

                if (check.rows.length === 0) {
                    // Pick random subject/staff pair
                    const randomOption = options[Math.floor(Math.random() * options.length)];
                    console.log(`Filling Gap: ${day} Period ${p} with Subject ${randomOption.subject_id}`);

                    await pool.query(`
                        INSERT INTO timetable (year, section, day, period, subject_id, staff_id)
                        VALUES ($1, $2, $3, $4, $5, $6)
                    `, [year, section, day, p, randomOption.subject_id, randomOption.staff_id]);
                }
            }
        }
        console.log("Gaps filled successfully.");

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

fillGaps();
