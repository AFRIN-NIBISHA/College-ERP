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
        console.log("Updating Class Details...");
        const classes = [
            { year: 2, section: 'A', incharge: 'Mrs. R. Binisha', rep: 'Amita Jerine' },
            { year: 2, section: 'B', incharge: 'Mrs. SINDHU', rep: 'Narmatha' },
            { year: 3, section: 'A', incharge: 'Mrs. RAJA KALA P', rep: 'Asha Lidia' },
            { year: 3, section: 'B', incharge: 'Mrs. MONISHA RAJU', rep: 'Sajina' }
        ];

        for (const c of classes) {
            const staffRes = await pool.query("SELECT id FROM staff WHERE name ILIKE $1", [`%${c.incharge.split(' ').pop()}%`]);
            if (staffRes.rows.length > 0) {
                await pool.query("INSERT INTO class_details (year, section, staff_id, rep_name) VALUES ($1, $2, $3, $4) ON CONFLICT (year, section) DO UPDATE SET staff_id = EXCLUDED.staff_id, rep_name = EXCLUDED.rep_name", [c.year, c.section, staffRes.rows[0].id, c.rep]);
            }
        }
        console.log("Chunk 2 Done.");
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
run();
