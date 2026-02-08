const db = require('./db');

async function promoteStudents() {
    try {
        console.log("Starting Academic Year Promotion Process...");

        // 1. Move Year 4 to Completed/Alumni (Optional: Or just delete if record not needed)
        // Here we just keep them at Year 4 or we can set to 5 to indicate graduated.
        const resGrad = await db.query("UPDATE students SET year = 5 WHERE year = 4");
        console.log(`✓ Graduated ${resGrad.rowCount} students (Year 4 -> Alumni)`);

        // 2. Promote Year 3 to Year 4
        const res3 = await db.query("UPDATE students SET year = 4 WHERE year = 3");
        console.log(`✓ Promoted ${res3.rowCount} students (Year 3 -> Year 4)`);

        // 3. Promote Year 2 to Year 3
        const res2 = await db.query("UPDATE students SET year = 3 WHERE year = 2");
        console.log(`✓ Promoted ${res2.rowCount} students (Year 2 -> Year 3)`);

        // 4. Promote Year 1 to Year 2
        const res1 = await db.query("UPDATE students SET year = 2 WHERE year = 1");
        console.log(`✓ Promoted ${res1.rowCount} students (Year 1 -> Year 2)`);

        console.log("\n--- Cleanup and Data Reset ---");

        // 5. Clear old academic cycle data (Attendance, Internal Marks, Timetables)
        // Note: In real scenarios, you might want to ARCHIVE these instead of deleting.

        const marksRes = await db.query("DELETE FROM internal_marks");
        console.log(`✓ Cleared ${marksRes.rowCount} internal marks records for the new cycle`);

        const attRes = await db.query("DELETE FROM attendance");
        console.log(`✓ Cleared student attendance records`);

        const facAttRes = await db.query("DELETE FROM faculty_attendance");
        console.log(`✓ Cleared faculty attendance records`);

        // Reset No Dues for the new semester
        const nodueRes = await db.query("DELETE FROM no_dues");
        console.log(`✓ Cleared previous No Due applications`);

        console.log("\n✅ SUCCESS: Promotion completed. The system is ready for the next academic year.");
        console.log("Next steps: Add new 1st-year students and upload the new semester's timetable.");

    } catch (err) {
        console.error("Promotion failed:", err);
    } finally {
        process.exit(0);
    }
}

// Security Check: Ask before running or just provide the script
console.log("Script loaded. Run this only when the current academic year is officially over.");
promoteStudents();
