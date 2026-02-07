const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function run() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'class_details'");
        console.log("CLASS_DETAILS COLUMNS:");
        console.table(res.rows);

        const res2 = await pool.query("SELECT * FROM class_details LIMIT 5");
        console.log("\nCLASS_DETAILS SAMPLE:");
        console.table(res2.rows);

        const res3 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'no_due_approvals'");
        console.log("\nNO_DUE_APPROVALS COLUMNS (if exists):");
        console.table(res3.rows);

    } catch (err) {
        console.error(err.message);
    } finally {
        pool.end();
    }
}
run();
