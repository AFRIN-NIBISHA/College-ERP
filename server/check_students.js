const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'college_erp',
    password: process.env.DB_PASSWORD || 'NibiGeo',
    port: process.env.DB_PORT || 5432,
});

async function check() {
    try {
        const res = await pool.query("SELECT * FROM students");
        console.log("Total Students:", res.rowCount);
        console.log("Students:", res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

check();
