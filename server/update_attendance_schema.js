const db = require('./db');

// Add periods support to attendance using a new table for period-wise granularity
// We will simply create fields period1 to period8 in a new table or existing one.
// Let's create a new table 'attendance_periods' because 'attendance' table already has valid data (daily summary).
// However, syncing two tables is painful.
// Better plan: Add columns period_1 to period_8 to existing attendance table.
// And 'status' column will act as the "Overall" status (calculated or manually set).

async function updateSchema() {
    try {
        console.log("Adding periods to attendance table...");

        // Add columns if not exist
        await db.query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_1 VARCHAR(10) DEFAULT 'Present'`);
        await db.query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_2 VARCHAR(10) DEFAULT 'Present'`);
        await db.query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_3 VARCHAR(10) DEFAULT 'Present'`);
        await db.query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_4 VARCHAR(10) DEFAULT 'Present'`);
        await db.query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_5 VARCHAR(10) DEFAULT 'Present'`);
        await db.query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_6 VARCHAR(10) DEFAULT 'Present'`);
        await db.query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_7 VARCHAR(10) DEFAULT 'Present'`);
        await db.query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_8 VARCHAR(10) DEFAULT 'Present'`);

        console.log("Schema updated for Period-wise Attendance.");
    } catch (err) {
        console.error("Error updating schema:", err);
    } finally {
        process.exit();
    }
}

updateSchema();
