const db = require('./db');
async function run() {
    try {
        const res = await db.query("SELECT nd.*, s.name, s.roll_no FROM no_dues nd JOIN students s ON nd.student_id = s.id WHERE s.roll_no = '960623104004'");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
