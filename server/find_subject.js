const db = require('./db');
async function run() {
    try {
        const res = await db.query("SELECT * FROM subjects WHERE subject_code LIKE 'CCS336%'");
        console.log("Subjects:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
