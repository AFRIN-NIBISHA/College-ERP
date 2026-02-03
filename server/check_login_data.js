const db = require('./db');

const checkData = async () => {
    try {
        console.log("--- USERS ---");
        const users = await db.query("SELECT id, username, password, role FROM users");
        users.rows.forEach(u => console.log(`${u.role}: ${u.username} / ${u.password}`));

        console.log("\n--- STUDENTS ---");
        const students = await db.query("SELECT id, name, roll_no, year, section FROM students");
        if (students.rows.length === 0) {
            console.log("No students found. Creating dummy student...");
            await db.query("INSERT INTO students (roll_no, name, year, section) VALUES ('CSE001', 'Test Student', 3, 'A')");
            console.log("Created: Test Student / CSE001 / 3 / A");
        } else {
            students.rows.forEach(s => console.log(`Student: ${s.name} | ${s.roll_no} | Year: ${s.year} | Sec: ${s.section}`));
        }

        console.log("\n--- ADMIN CHECK ---");
        const admin = users.rows.find(u => u.role === 'admin' || u.role === 'staff');
        if (!admin) {
            console.log("No admin/staff found. Creating default...");
            await db.query("INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin')");
            console.log("Created: admin / admin123");
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};

checkData();
