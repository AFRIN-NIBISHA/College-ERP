const db = require('./db');
async function run() {
    try {
        const studentRes = await db.query("SELECT id, name, roll_no FROM students WHERE name ILIKE '%AFRIN%'");
        if (studentRes.rows.length === 0) {
            console.log("Student not found");
            return;
        }
        const s = studentRes.rows[0];
        console.log(`Checking No Due for ${s.name} (${s.roll_no}, ID: ${s.id})`);

        const res = await db.query("SELECT * FROM no_dues WHERE student_id = $1", [s.id]);
        if (res.rows.length === 0) {
            console.log("No Due request found in DB");
            return;
        }
        console.log("No Due Record:", JSON.stringify(res.rows[0], null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
