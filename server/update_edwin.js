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

async function updateStaff() {
    try {
        console.log("Updating Dr. Edwin to match user screenshot...");
        const res = await pool.query(
            "UPDATE staff SET staff_id = $1, name = $2 WHERE staff_id = $3 RETURNING *",
            ['9606cse001', 'Mr. Edwin Albert', 'CSE001']
        );
        if (res.rows.length > 0) {
            console.log("Success:", res.rows[0]);
        } else {
            console.log("Could not find staff with ID 'CSE001'");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

updateStaff();
