const pg = require('pg');
const pool = new pg.Pool({ user: 'postgres', password: 'Nibisha2006', host: 'localhost', port: 5432, database: 'college_erp' });

async function check() {
    try {
        const res = await pool.query(`
            SELECT DISTINCT 
                COALESCE(s.subject_name, t.subject_name_text) as subject_name, 
                COALESCE(s.subject_code, t.subject_code_text) as subject_code, 
                COALESCE(s.semester, 0) as semester 
            FROM timetable t 
            LEFT JOIN subjects s ON t.subject_id = s.id 
            WHERE t.year = 3 AND t.section = 'A'
        `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
check();
