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

async function debugLogin() {
    const phone = '7806811228';
    const roles = ['staff', 'office'];

    try {
        console.log(`Checking for phone: ${phone}`);

        // 1. naive check
        const allMatches = await pool.query("SELECT * FROM staff WHERE phone = $1", [phone]);
        console.log("Raw Staff matches for phone:", allMatches.rows);

        if (allMatches.rows.length > 0) {
            for (const s of allMatches.rows) {
                console.log(`\n-- Checking User for Staff ID ${s.id} (User ID ${s.user_id}) --`);
                const u = await pool.query("SELECT * FROM users WHERE id = $1", [s.user_id]);
                console.log("User:", u.rows[0]);
            }
        }

        // 2. Simulate the actual API query
        for (const role of roles) {
            console.log(`\n--- Simulating API Query for Role: ${role} ---`);
            const query = `
            SELECT u.id, u.username, u.role, u.is_setup
            FROM users u
            JOIN staff s ON u.id = s.user_id
            WHERE s.phone = $1 AND u.role = $2
        `;
            try {
                const res = await pool.query(query, [phone, role]);
                console.log(`Query Result for ${role}:`, res.rows);
            } catch (qErr) {
                console.error(`Query Failed for ${role}:`, qErr.message);
            }
        }

    } catch (err) {
        console.error("Global Error:", err);
    } finally {
        pool.end();
    }
}

debugLogin();
