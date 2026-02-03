const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

const syncFees = async () => {
    try {
        console.log("Starting fee sync...");
        const students = await pool.query("SELECT id, name FROM students");
        console.log(`Found ${students.rows.length} students.`);

        let count = 0;
        for (const student of students.rows) {
            const check = await pool.query("SELECT id FROM fees WHERE student_id = $1", [student.id]);
            if (check.rows.length === 0) {
                console.log(`Creating fee record for student: ${student.name} (ID: ${student.id})`);
                await pool.query(
                    "INSERT INTO fees (student_id, total_fee, paid_amount, status) VALUES ($1, 50000, 0, 'Pending')",
                    [student.id]
                );
                count++;
            }
        }
        console.log(`SUCCESS: Synced ${count} missing fee records.`);
    } catch (err) {
        console.error("Sync Error:", err);
    } finally {
        pool.end();
    }
};

syncFees();
