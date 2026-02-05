const db = require('./db');
async function check() {
    try {
        const result = await db.query("SELECT * FROM students WHERE roll_no = '960623104004'");
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
check();
