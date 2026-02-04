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

async function debugTimetable() {
    try {
        console.log("--- Subjects ---");
        const subjects = await pool.query("SELECT id, subject_code, subject_name FROM subjects");
        console.table(subjects.rows);
        const subjectIds = subjects.rows.map(s => s.id);

        console.log("\n--- Timetable Entries (Sample) ---");
        // Check for entries where subject_id is not in subjects
        const invalidEntries = await pool.query(`
            SELECT t.id, t.day, t.period, t.subject_id, t.year, t.section 
            FROM timetable t 
            LEFT JOIN subjects s ON t.subject_id = s.id 
            WHERE s.id IS NULL AND t.subject_id IS NOT NULL
        `);
        console.log(`Found ${invalidEntries.rows.length} invalid timetable entries (orphan subject_id).`);
        if (invalidEntries.rows.length > 0) {
            console.table(invalidEntries.rows.slice(0, 10)); // Show stats
        }

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

debugTimetable();
