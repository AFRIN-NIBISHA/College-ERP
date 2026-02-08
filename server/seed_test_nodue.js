const db = require('./db');
async function run() {
    try {
        console.log("Seeding test data...");
        // 1. Create Student
        const sRes = await db.query(
            "INSERT INTO students (name, roll_no, year, section, department) VALUES ('Test Student', 'TEST001', 3, 'A', 'CSE') RETURNING id"
        );
        const sid = sRes.rows[0].id;

        // 2. Create No Due Request
        const ndRes = await db.query(
            "INSERT INTO no_dues (student_id, semester, office_status) VALUES ($1, 6, 'Approved') RETURNING id",
            [sid]
        );
        const ndid = ndRes.rows[0].id;

        console.log(`Test Student ID: ${sid}`);
        console.log(`Test No Due ID: ${ndid}`);
        console.log("Office Approved. Ready for subject approval test.");
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
