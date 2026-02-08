const db = require('./db');
async function run() {
    try {
        const studentRes = await db.query("SELECT id, name, roll_no FROM students WHERE name ILIKE '%AFRIN%'");
        console.log("Found students:", JSON.stringify(studentRes.rows, null, 2));

        for (const s of studentRes.rows) {
            const ndRes = await db.query("SELECT * FROM no_dues WHERE student_id = $1", [s.id]);
            console.log(`No Due for student ID ${s.id} (${s.name}):`, JSON.stringify(ndRes.rows, null, 2));
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
