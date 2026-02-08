const db = require('./db');
async function run() {
    try {
        console.log("Checking for students missing user accounts...");
        const students = await db.query("SELECT id, roll_no, name FROM students WHERE user_id IS NULL");
        console.log(`Found ${students.rows.length} students missing user accounts.`);

        for (const s of students.rows) {
            const username = s.roll_no.toLowerCase();
            const password = s.roll_no; // Default password is roll number

            // Check if user already exists
            const userCheck = await db.query("SELECT id FROM users WHERE username = $1", [username]);
            let userId;
            if (userCheck.rows.length > 0) {
                userId = userCheck.rows[0].id;
            } else {
                const userRes = await db.query(
                    "INSERT INTO users (username, password, role) VALUES ($1, $2, 'student') RETURNING id",
                    [username, password]
                );
                userId = userRes.rows[0].id;
            }

            await db.query("UPDATE students SET user_id = $1 WHERE id = $2", [userId, s.id]);
            console.log(`Fixed User Account for ${s.name} (${s.roll_no})`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
