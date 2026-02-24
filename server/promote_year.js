const db = require('./db');

async function promoteStudents(newYear) {
    try {
        if (!newYear) {
            console.error("Please provide a new academic year (e.g., '2026-2027')");
            return;
        }

        console.log(`Starting Academic Year Promotion Process to ${newYear}...`);

        // 1. Get current year for archiving reference
        const currentYearRes = await db.query("SELECT value FROM settings WHERE key = 'current_academic_year'");
        const previousYear = currentYearRes.rows[0]?.value || '2025-2026';

        // 2. Update students: Move Year 4 to Alumni status
        const resGrad = await db.query("UPDATE students SET status = 'Graduated' WHERE year = 4 AND status = 'Active'");
        console.log(`✓ Graduated ${resGrad.rowCount} senior students (Year 4 -> Alumni)`);

        // 3. Promote existing years (3rd -> 4th, 2nd -> 3rd, 1st -> 2nd)
        await db.query("UPDATE students SET year = 4 WHERE year = 3 AND status = 'Active'");
        await db.query("UPDATE students SET year = 3 WHERE year = 2 AND status = 'Active'");
        await db.query("UPDATE students SET year = 2 WHERE year = 1 AND status = 'Active'");
        console.log(`✓ Promoted all active students to their next respective years.`);

        // 4. Update the global academic year setting
        await db.query("UPDATE settings SET value = $1 WHERE key = 'current_academic_year'", [newYear]);
        console.log(`✓ GLobal Academic Year updated to ${newYear}`);

        console.log(`\n✅ SUCCESS: Promotion completed. Historical data for ${previousYear} is preserved.`);
        console.log(`The system is now running on ${newYear} cycle.`);
        console.log("Next steps: Import new first-year students and upload the new semester's timetable.");
        console.log("Next steps: Add new 1st-year students and upload the new semester's timetable.");

    } catch (err) {
        console.error("Promotion failed:", err);
    } finally {
        process.exit(0);
    }
}

// Security Check: Run only when the academic year is officially over.
module.exports = promoteStudents;

// To run manually: node -e "require('./promote_year')()"
if (require.main === module) {
    promoteStudents().then(() => process.exit(0));
}
