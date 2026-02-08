const db = require('./db');
async function run() {
    try {
        const subjects = await db.query(`
            SELECT DISTINCT s.subject_code, s.subject_name, st.name as staff_name, u.username as staff_username
            FROM timetable t
            JOIN subjects s ON t.subject_id = s.id
            JOIN staff st ON t.staff_id = st.id
            LEFT JOIN users u ON st.user_id = u.id
            WHERE t.year = 3 AND t.section = 'A'
        `);
        console.table(subjects.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
