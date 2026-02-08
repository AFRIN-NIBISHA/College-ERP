const db = require('./db');
async function run() {
    try {
        const res = await db.query("SELECT DISTINCT s.subject_code, s.subject_name FROM timetable t JOIN subjects s ON t.subject_id = s.id WHERE t.year = 3 AND t.section = 'A'");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
