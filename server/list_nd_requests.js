const db = require('./db');
async function run() {
    try {
        const res = await db.query("SELECT nd.id, nd.student_id, s.name, s.roll_no FROM no_dues nd JOIN students s ON nd.student_id = s.id");
        process.stdout.write(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
