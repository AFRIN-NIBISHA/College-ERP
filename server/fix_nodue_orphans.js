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

async function fixAndDebug() {
    try {
        console.log("--- Cleaning up NULL student_id requests ---");
        const del = await pool.query("DELETE FROM no_dues WHERE student_id IS NULL");
        console.log(`Deleted ${del.rowCount} orphan rows.`);

        console.log("\n--- Checking Student Profiles Linking ---");
        // Get all users with role 'student'
        const users = await pool.query("SELECT id, username FROM users WHERE role = 'student'");
        console.log(`Found ${users.rows.length} STUDENT users.`);

        for (const u of users.rows) {
            const s = await pool.query("SELECT id, name, roll_no FROM students WHERE user_id = $1", [u.id]);
            if (s.rows.length === 0) {
                console.error(`WARNING: User ${u.username} (ID: ${u.id}) has NO Linked Student Profile!`);
            } else {
                console.log(`OK: User ${u.username} -> Student ${s.rows[0].name} (ID: ${s.rows[0].id})`);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

fixAndDebug();
