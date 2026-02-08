const db = require('./db');
async function run() {
    try {
        const res = await db.query("SELECT * FROM students WHERE name ILIKE '%AFRIN%'");
        console.log("Students:", JSON.stringify(res.rows, null, 2));

        const ndAll = await db.query("SELECT nd.*, s.roll_no, s.name FROM no_dues nd JOIN students s ON nd.student_id = s.id");
        console.log("All No Due Requests:", JSON.stringify(ndAll.rows, null, 2));

        const users = await db.query("SELECT u.username, u.role, s.name FROM users u LEFT JOIN staff s ON u.id = s.user_id WHERE u.username = '9606cse002'");
        console.log("User 9606cse002:", JSON.stringify(users.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
