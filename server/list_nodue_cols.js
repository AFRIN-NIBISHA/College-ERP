const db = require('./db');
async function run() {
    try {
        const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'no_dues'");
        console.log("Columns:", res.rows.map(c => c.column_name).join(', '));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
