const db = require('./db');
async function run() {
    try {
        const res = await db.query("SELECT * FROM subjects WHERE subject_code = 'CCS336'");
        console.log(res.rows.length > 0 ? 'Exists' : 'Missing');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
