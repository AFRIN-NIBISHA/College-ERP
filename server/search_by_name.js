const db = require('./db');
async function run() {
    try {
        const studentRes = await db.query("SELECT id, name, roll_no FROM students WHERE name ILIKE '%NIBISHA%'");
        console.log("Found students:", JSON.stringify(studentRes.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
