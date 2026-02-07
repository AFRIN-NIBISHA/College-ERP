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
        const classDetails = await pool.query("SELECT * FROM class_details");
        console.log("CLASS_DETAILS:", JSON.stringify(classDetails.rows, null, 2));

        const staffColumns = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'staff'");
        console.log("STAFF COLUMNS:", JSON.stringify(staffColumns.rows, null, 2));

        const nda = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'no_due_approvals'");
        if (nda.rows.length > 0) {
            const ndaColumns = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'no_due_approvals'");
            console.log("NO_DUE_APPROVALS COLUMNS:", JSON.stringify(ndaColumns.rows, null, 2));
        } else {
            console.log("NO_DUE_APPROVALS table does not exist.");
        }

    } catch (err) {
        console.error(err.message);
    } finally {
        pool.end();
    }
}
run();
