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

async function findEdwin() {
    try {
        console.log("Searching for staff with name containing 'Edwin'...");
        const res = await pool.query("SELECT * FROM staff WHERE name ILIKE '%Edwin%'");
        console.log("Found:", res.rows);

        console.log("\nSearching for staff with staff_id '9606cse001'...");
        const res2 = await pool.query("SELECT * FROM staff WHERE staff_id = '9606cse001'");
        console.log("Found by ID:", res2.rows);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

findEdwin();
