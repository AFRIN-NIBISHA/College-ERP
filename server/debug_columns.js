const db = require('./db');
async function run() {
    try {
        const res = await db.query("SELECT * FROM students LIMIT 1");
        console.log(Object.keys(res.rows[0]));
        const res2 = await db.query("SELECT dob FROM students WHERE roll_no = '960623104004'");
        console.log("DOB for 960623104004:", res2.rows[0]);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
