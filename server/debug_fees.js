const db = require('./db');
async function run() {
    try {
        const student = await db.query("SELECT id FROM students WHERE roll_no = '960623104004'");
        if (student.rows.length > 0) {
            const id = student.rows[0].id;
            const feeData = await db.query("SELECT * FROM fees WHERE student_id = $1", [id]);
            console.log("FEE_DATA:", JSON.stringify(feeData.rows));
        } else {
            console.log("STUDENT_NOT_FOUND");
        }
    } catch (e) {
        console.error("ERROR:", e.message);
    }
    process.exit(0);
}
run();
