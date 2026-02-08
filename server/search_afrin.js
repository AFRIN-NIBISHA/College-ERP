const db = require('./db');
async function run() {
    try {
        const res = await db.query("SELECT id, name, roll_no, user_id FROM students WHERE name ILIKE '%AFRIN%'");
        process.stdout.write(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
