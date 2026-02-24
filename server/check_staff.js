const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function fixStaff() {
    try {
        await client.connect();
        // Check if exists
        const check = await client.query("SELECT * FROM staff WHERE staff_id = '9606ECE001'");
        if (check.rows.length === 0) {
            await client.query("INSERT INTO staff (staff_id, name, department) VALUES ('9606ECE001', 'Mrs. ABISHA MANO', 'ECE')");
            console.log("Staff record created: 9606ECE001 | Mrs. ABISHA MANO");
        } else {
            await client.query("UPDATE staff SET name = 'Mrs. ABISHA MANO', department = 'ECE' WHERE staff_id = '9606ECE001'");
            console.log("Staff record updated: 9606ECE001");
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

fixStaff();
