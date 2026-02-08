const db = require('./db');
async function run() {
    try {
        const res = await db.query("SELECT DISTINCT s.subject_code, s.subject_name FROM timetable t JOIN subjects s ON t.subject_id = s.id WHERE t.year = 3 AND t.section = 'A'");
        const list = res.rows.map(s => `${s.subject_code}: ${s.subject_name}`);
        console.log(list.join('\n'));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
