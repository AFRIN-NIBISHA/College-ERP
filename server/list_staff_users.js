const db = require('./db');
async function run() {
    try {
        const staffRes = await db.query("SELECT id, name, staff_id FROM staff");
        console.log("Staff List:", JSON.stringify(staffRes.rows, null, 2));

        const userRes = await db.query("SELECT u.username, s.name, s.id as staff_id FROM users u JOIN staff s ON u.id = s.user_id");
        console.log("User-Staff Linkage:", JSON.stringify(userRes.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
