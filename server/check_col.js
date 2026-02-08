const db = require('./db');
async function run() {
    try {
        const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'no_dues' AND column_name = 'ccs336_sta_status'");
        console.log(res.rows.length > 0 ? 'Column Exists' : 'Column Missing');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
