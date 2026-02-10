const pg = require('pg');
const pool = new pg.Pool({ user: 'postgres', password: 'Nibisha2006', host: 'localhost', port: 5432, database: 'college_erp' });

async function check() {
    try {
        const res = await pool.query("SELECT * FROM users WHERE username = '9606cse008'");
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
check();
