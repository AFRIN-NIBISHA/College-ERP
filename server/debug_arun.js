const db = require('./db');
async function check() {
    try {
        const staff = await db.query("SELECT * FROM staff WHERE name ILIKE '%Arun%' OR name ILIKE '%Venkadesh%'");
        console.log('Staff:', JSON.stringify(staff.rows, null, 2));

        const tt = await db.query("SELECT * FROM timetable WHERE staff_id IN (SELECT id FROM staff WHERE name ILIKE '%Arun%' OR name ILIKE '%Venkadesh%') OR staff_name_text ILIKE '%Arun%' OR staff_name_text ILIKE '%Venkadesh%'");
        console.log('Timetable Slots:', JSON.stringify(tt.rows, null, 2));

        const users = await db.query("SELECT * FROM users WHERE role='staff' AND id IN (SELECT user_id FROM staff WHERE name ILIKE '%Arun%' OR name ILIKE '%Venkadesh%')");
        console.log('Users:', JSON.stringify(users.rows, null, 2));

        const students = await db.query("SELECT * FROM students WHERE id IN (SELECT student_id FROM no_dues)");
        console.log('\nStudents requesting no due:', JSON.stringify(students.rows.map(s => ({ id: s.id, name: s.name, year: s.year, section: s.section })), null, 2));

        const reqs = await db.query("SELECT * FROM no_dues");
        console.log('\nRequests:', JSON.stringify(reqs.rows, null, 2));

        await db.end();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
