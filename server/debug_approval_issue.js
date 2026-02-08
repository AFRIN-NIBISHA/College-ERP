const db = require('./db');
async function run() {
    try {
        const studentRes = await db.query("SELECT id FROM students WHERE roll_no = '960623104004'");
        if (studentRes.rows.length === 0) {
            console.log("Student not found");
            return;
        }
        const sid = studentRes.rows[0].id;
        const ndRes = await db.query("SELECT * FROM no_dues WHERE student_id = $1", [sid]);
        console.log("No Due Record:", JSON.stringify(ndRes.rows, null, 2));

        const userRes = await db.query("SELECT s.id, s.name, u.role FROM staff s JOIN users u ON s.user_id = u.id WHERE u.username = '9606cse002'");
        console.log("Current Staff:", JSON.stringify(userRes.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
