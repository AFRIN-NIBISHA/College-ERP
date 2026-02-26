const db = require('./db');
async function check() {
    try {
        const settings = await db.query("SELECT * FROM settings WHERE key = 'current_academic_year'");
        console.log("Current Academic Year Setting:", settings.rows[0]);

        const student = await db.query("SELECT id, roll_no, name FROM students WHERE roll_no = '960623104004'");
        console.log("Student Info:", student.rows[0]);

        if (student.rows[0]) {
            const fees = await db.query("SELECT * FROM fees WHERE student_id = $1", [student.rows[0].id]);
            console.log("Fee Records for Student:", fees.rows);
        }
    } catch (e) { console.error(e); }
    process.exit(0);
}
check();
