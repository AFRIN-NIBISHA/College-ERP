const db = require('./db');
async function search() {
    try {
        const term = '960623104004';
        const res = await db.query("SELECT * FROM students WHERE roll_no ILIKE $1 OR phone ILIKE $1", [term]);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
search();
