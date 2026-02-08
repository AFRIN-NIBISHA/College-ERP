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

async function testCasting() {
    try {
        console.log("Testing student DOB query with a name string...");
        const res = await pool.query("SELECT * FROM students WHERE roll_no = $1 AND dob = $2", ['ANY_ROLL', 'Mr. EDWIN ALBERT']);
        console.log("Result:", res.rows);
    } catch (err) {
        console.error("Postgres Error Type:", err.name);
        console.error("Postgres Error Message:", err.message);
    } finally {
        pool.end();
    }
}

testCasting();
