const db = require('./db');
async function run() {
    try {
        const studentRes = await db.query(
            "SELECT nd.id, nd.office_status, nd.student_id, s.name FROM no_dues nd JOIN students s ON nd.student_id = s.id WHERE s.name ILIKE '%Afrin%'"
        );
        console.log("All Afrin Requests:", JSON.stringify(studentRes.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
