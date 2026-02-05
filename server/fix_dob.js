const db = require('./db');
async function fix() {
    try {
        const res = await db.query("UPDATE students SET dob = '2006-03-28' WHERE roll_no = '960623104004' RETURNING *");
        console.log("Updated:", res.rows[0]);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
fix();
