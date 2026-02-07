const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function check() {
    try {
        const studentRes = await pool.query("SELECT * FROM students WHERE roll_no = '960623104004'");
        const student = studentRes.rows[0];
        console.log("--- STUDENT CHECK ---");
        console.log("Name:", student?.name);
        console.log("Year:", student?.year);
        console.log("Section:", student?.section);

        if (student) {
            const classRes = await pool.query("SELECT * FROM class_details WHERE year = $1 AND section = $2", [student.year, student.section]);
            const cls = classRes.rows[0];
            console.log("\n--- CLASS CHECK ---");
            console.log("Class Found:", !!cls);
            console.log("Staff ID in Class:", cls?.staff_id);

            if (cls && cls.staff_id) {
                const staffRes = await pool.query("SELECT name FROM staff WHERE id = $1", [cls.staff_id]);
                console.log("\n--- STAFF CHECK ---");
                console.log("Staff Name:", staffRes.rows[0]?.name);
            } else {
                console.log("\n--- IN-CHARGE MISSING IN CLASS_DETAILS ---");
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();
