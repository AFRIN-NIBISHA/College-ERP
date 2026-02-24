const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function check() {
    try {
        await client.connect();
        const res = await client.query("SELECT id, staff_id, name, department FROM staff WHERE staff_id ILIKE '%ECE%' OR name ILIKE '%Abisha%'");
        console.log("STAFF_LIST_START");
        res.rows.forEach(r => console.log(`ID:${r.id}|SID:${r.staff_id}|NAME:${r.name}|DEPT:${r.department}`));
        console.log("STAFF_LIST_END");
    } catch (err) { console.error(err); }
    finally { await client.end(); }
}
check();
