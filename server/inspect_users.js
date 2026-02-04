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

async function inspectUsers() {
    try {
        console.log("--- Unique Roles in Users Table ---");
        const roles = await pool.query("SELECT DISTINCT role FROM users");
        console.table(roles.rows);

        console.log("\n--- Sample Users ---");
        const users = await pool.query("SELECT id, username, role FROM users LIMIT 10");
        console.table(users.rows);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

inspectUsers();
