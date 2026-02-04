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

async function debugRequestsLink() {
    try {
        console.log("--- Latest No Due Requests ---");
        const requests = await pool.query("SELECT * FROM no_dues ORDER BY created_at DESC LIMIT 5");
        console.table(requests.rows);

        if (requests.rows.length > 0) {
            const studentId = requests.rows[0].student_id;
            console.log(`\n--- Checking Student ID: ${studentId} ---`);
            const student = await pool.query("SELECT id, name, user_id, year, section FROM students WHERE id = $1", [studentId]);
            console.table(student.rows);

            if (student.rows.length > 0) {
                const userId = student.rows[0].user_id;
                console.log(`\n--- Linked User ID: ${userId} ---`);
                const user = await pool.query("SELECT id, username, role FROM users WHERE id = $1", [userId]);
                console.table(user.rows);
            }
        }

        console.log("\n--- Checking for Orphan Requests (No Student) ---");
        const orphans = await pool.query("SELECT * FROM no_dues WHERE student_id IS NULL");
        console.log(`Orphans found: ${orphans.rows.length}`);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

debugRequestsLink();
