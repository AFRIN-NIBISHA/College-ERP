
const db = require('./db');

async function updateSchema() {
    try {
        console.log("Updating Timetable Schema...");

        await db.query(`ALTER TABLE timetable ADD COLUMN IF NOT EXISTS subject_code_text VARCHAR(50);`);
        await db.query(`ALTER TABLE timetable ADD COLUMN IF NOT EXISTS subject_credit_text VARCHAR(10);`);

        console.log("Columns added successfully.");
        process.exit();
    } catch (e) {
        console.error("Schema Update Failed:", e);
        process.exit(1);
    }
}

updateSchema();
