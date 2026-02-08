const db = require('./db');
async function run() {
    try {
        const res = await db.query(`
            SELECT u.username, s.name, s.id as staff_profile_id
            FROM users u
            JOIN staff s ON u.id = s.user_id
            WHERE u.username = '9606cse002'
        `);
        console.log("Logged in User Details:", JSON.stringify(res.rows, null, 2));

        const subjects = await db.query(`
            SELECT DISTINCT s.subject_code, s.subject_name, st.name as staff_name, st.id as staff_profile_id
            FROM timetable t
            JOIN subjects s ON t.subject_id = s.id
            JOIN staff st ON t.staff_id = st.id
            WHERE t.year = 3 AND t.section = 'A'
        `);
        console.log("Year 3 Section A Subjects & Staff:", JSON.stringify(subjects.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
