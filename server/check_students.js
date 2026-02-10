
const db = require('./db');

async function test() {
    try {
        const res = await db.query("SELECT * FROM students LIMIT 5");
        console.log("Students:", res.rows);

        if (res.rows.length > 0) {
            const s = res.rows[0];
            console.log(`Test Login for ${s.roll_no} / ${s.dob} / ${s.year} / ${s.section}`);

            // formatting date to YYYY-MM-DD for consistency check
            const dob = new Date(s.dob).toISOString().split('T')[0];
            console.log("Formatted DOB:", dob);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

test();
