const db = require('./db');
async function run() {
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE roll_no IS NULL OR roll_no = '') as missing_roll,
                COUNT(*) FILTER (WHERE email IS NULL OR email = '') as missing_email,
                COUNT(*) FILTER (WHERE phone IS NULL OR phone = '') as missing_phone,
                COUNT(*) FILTER (WHERE dob IS NULL) as missing_dob
            FROM students
        `);
        console.log("Student Stats:", stats.rows[0]);

        const sample = await db.query("SELECT * FROM students WHERE year = 3 AND section = 'A' LIMIT 5");
        console.log("Sample CSE 3A Students:", JSON.stringify(sample.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
