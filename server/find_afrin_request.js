const db = require('./db');
async function run() {
    try {
        const studentRes = await db.query(
            "SELECT nd.id, nd.office_status, nd.student_id, s.name, s.user_id FROM no_dues nd JOIN students s ON nd.student_id = s.id WHERE s.name ILIKE '%Afrin%'"
        );
        console.log(JSON.stringify(studentRes.rows, null, 2));

        if (studentRes.rows.length > 0) {
            const req = studentRes.rows[0];
            // Also check `users` table for this student to ensure user_id exists
            if (req.user_id) {
                const userRes = await db.query("SELECT * FROM users WHERE id = $1", [req.user_id]);
                console.log("User Data:", userRes.rows[0]);
            } else {
                console.log("WARNING: Student user_id is NULL");
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
