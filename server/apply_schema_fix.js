const db = require('./db');
async function run() {
    try {
        await db.query("ALTER TABLE students ADD COLUMN IF NOT EXISTS dob DATE");
        await db.query("ALTER TABLE student_od ADD COLUMN IF NOT EXISTS od_type VARCHAR(10) DEFAULT 'Day'");
        await db.query("ALTER TABLE student_od ADD COLUMN IF NOT EXISTS hours INT");
        await db.query("ALTER TABLE student_od ADD COLUMN IF NOT EXISTS pending_with VARCHAR(20)");
        console.log("Schema updated successfully.");
    } catch (e) {
        console.error("Update failed:", e);
    } finally {
        process.exit();
    }
}
run();
