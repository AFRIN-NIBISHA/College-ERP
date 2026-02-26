const db = require('./db');
async function run() {
    try {
        const student = await db.query("SELECT id FROM students WHERE roll_no = '960623104004'");
        if (student.rows.length > 0) {
            const id = student.rows[0].id;
            const feeRecords = await db.query("SELECT id, academic_year, scholarship_type, scholarship_details FROM fees WHERE student_id = $1", [id]);
            console.log("ALL_FEE_RECORDS:", JSON.stringify(feeRecords.rows));

            const currentYearRes = await db.query("SELECT value FROM settings WHERE key = 'current_academic_year'");
            console.log("CURRENT_ACADEMIC_YEAR_SETTING:", currentYearRes.rows[0]?.value);
        }
    } catch (e) { console.error(e); }
    process.exit(0);
}
run();
