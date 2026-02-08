const db = require('./db');
async function run() {
    try {
        const res = await db.query("SELECT * FROM no_dues WHERE student_id = 422 ORDER BY created_at DESC LIMIT 1");
        if (res.rows.length > 0) {
            console.log(JSON.stringify(res.rows[0], null, 2));
        } else {
            console.log("No record found");
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
