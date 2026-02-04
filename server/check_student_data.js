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

async function checkStudent() {
    try {
        const res = await pool.query("SELECT id, name, roll_no, year, section FROM students WHERE name ILIKE '%Afrin%'");
        console.log(JSON.stringify(res.rows, null, 2));
        pool.end();
    } catch (err) {
        console.error(err);
    }
}

checkStudent();
