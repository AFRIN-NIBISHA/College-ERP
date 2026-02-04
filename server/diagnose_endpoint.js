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

async function diagnose() {
    try {
        console.log("--- Checking 'users' table columns ---");
        const userCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        const columns = userCols.rows.map(r => r.column_name);
        console.log("Users Columns:", columns);

        if (!columns.includes('is_setup')) {
            console.error("CRITICAL: 'is_setup' column MISSING in users table!");
            // Try to fix it here
            await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_setup BOOLEAN DEFAULT FALSE");
            console.log("Attempted to add 'is_setup' column.");
        } else {
            console.log("OK: 'is_setup' column exists.");
        }

        console.log("\n--- Testing the exact Login Query ---");
        const phone = '7806811228';
        const role = 'staff';
        const query = `
            SELECT u.id, u.username, u.role, u.is_setup
            FROM users u
            JOIN staff s ON u.id = s.user_id
            WHERE s.phone = $1 AND u.role = $2
        `;

        try {
            const res = await pool.query(query, [phone, role]);
            console.log("Query executed successfully.");
            console.log("Rows found:", res.rows.length);
        } catch (e) {
            console.error("Query Execution FAILED:", e.message);
        }

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

diagnose();
