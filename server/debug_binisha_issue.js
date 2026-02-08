const db = require('./db');

async function run() {
    try {
        console.log("--- 1. STAFF DETAILS (Binisha) ---");
        const staffRes = await db.query(`
            SELECT s.id, s.name, s.user_id, u.username, u.role 
            FROM staff s 
            LEFT JOIN users u ON s.user_id = u.id 
            WHERE s.name ILIKE '%Binisha%' OR u.username ILIKE '%Binisha%'
        `);
        console.table(staffRes.rows);

        console.log("\n--- 2. STUDENT DETAILS (Afrin) ---");
        const studRes = await db.query(`
            SELECT s.id, s.name, s.roll_no, s.year, s.section, u.id as user_id 
            FROM students s 
            LEFT JOIN users u ON s.user_id = u.id 
            WHERE s.name ILIKE '%Afrin%'
        `);
        console.table(studRes.rows);

        if (studRes.rows.length > 0 && staffRes.rows.length > 0) {
            const student = studRes.rows[0];
            const staff = staffRes.rows[0];

            console.log(`\n--- 3. TIMETABLE MAPPING (Year ${student.year} ${student.section} -> Staff ${staff.name}) ---`);
            const timeRes = await db.query(`
                SELECT t.id, t.day, t.period, s.subject_code, s.subject_name 
                FROM timetable t
                JOIN subjects s ON t.subject_id = s.id
                WHERE t.year = $1 AND t.section = $2 AND t.staff_id = $3
            `, [student.year, student.section, staff.id]);
            console.table(timeRes.rows);

            console.log("\n--- 4. NO DUE REQUEST STATUS ---");
            const ndRes = await db.query(`
                SELECT * FROM no_dues WHERE student_id = $1
            `, [student.id]);
            console.log(ndRes.rows);
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
