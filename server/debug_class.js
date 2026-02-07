const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function debug() {
    try {
        const year = 2;
        const section = 'A';
        const res = await pool.query("SELECT * FROM class_details WHERE year = $1 AND section = $2", [year, section]);
        console.log("Class Details:", res.rows);

        const joinRes = await pool.query(
            `SELECT cd.*, s.name as in_charge_name 
             FROM class_details cd
             LEFT JOIN staff s ON cd.staff_id = s.id
             WHERE cd.year = $1 AND cd.section = $2`,
            [year, section]
        );
        console.log("Join Result:", joinRes.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

debug();
