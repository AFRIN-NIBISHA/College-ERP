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
        const rollNo = '960623104004';
        console.log(`Checking student: ${rollNo}`);
        const res = await pool.query("SELECT id, roll_no, name, year FROM students WHERE roll_no = $1", [rollNo]);
        console.log("Result:", res.rows);

        if (res.rows.length === 0) {
            console.log("No student found. Listing first 5 students:");
            const all = await pool.query("SELECT roll_no, name, year FROM students LIMIT 5");
            console.log(all.rows);
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

checkStudent();
