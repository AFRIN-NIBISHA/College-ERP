const pg = require('pg');
const pool = new pg.Pool({ user: 'postgres', password: 'Nibisha2006', host: 'localhost', port: 5432, database: 'college_erp' });

async function check() {
    try {
        const res = await pool.query("SELECT * FROM students WHERE roll_no ILIKE '%008%'");
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
check();
