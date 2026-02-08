const db = require('./db');
async function run() {
    try {
        const studentRes = await db.query("SELECT id FROM students WHERE roll_no = '960623104004'");
        const sid = studentRes.rows[0].id;
        const res = await db.query("SELECT * FROM no_dues WHERE student_id = $1", [sid]);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
