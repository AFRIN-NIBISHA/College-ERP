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

async function checkUsers() {
    try {
        console.log("--- Checking Users in DB ---");
        const res = await pool.query("SELECT id, username, password, role FROM users");
        console.table(res.rows);

        console.log("\n--- Testing Login Logic ---");
        const testUser = 'RandomUserXYZ';
        const res2 = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [testUser]);
        console.log(`Searching for '${testUser}': Found ${res2.rows.length} rows.`);

        pool.end();
    } catch (err) {
        console.error(err);
    }
}

checkUsers();
