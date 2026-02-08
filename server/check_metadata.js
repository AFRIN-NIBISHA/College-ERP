const db = require('./db');

async function checkMetadata() {
    try {
        console.log("--- STAFF ---");
        const staff = await db.query("SELECT name, staff_id, department FROM staff ORDER BY department");
        console.table(staff.rows);

        console.log("\n--- SUBJECTS ---");
        const subjects = await db.query("SELECT subject_code, subject_name FROM subjects ORDER BY subject_code");
        console.table(subjects.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkMetadata();
