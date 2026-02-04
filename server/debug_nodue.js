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

async function checkDebug() {
    try {
        console.log("--- Checking no_dues Columns ---");
        const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'no_dues'");
        console.log(cols.rows.map(r => r.column_name));

        console.log("\n--- Checking Office Users ---");
        const users = await pool.query("SELECT id, username, role FROM users WHERE role = 'office'");
        console.log(users.rows);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkDebug();
