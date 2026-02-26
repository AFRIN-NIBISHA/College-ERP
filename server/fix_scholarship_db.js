const db = require('./db');

async function fix() {
    try {
        await db.query(`ALTER TABLE fees ADD COLUMN IF NOT EXISTS scholarship_type VARCHAR(100);`);
        await db.query(`ALTER TABLE fees ADD COLUMN IF NOT EXISTS scholarship_details TEXT;`);
        console.log("Columns added successfully");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

fix();
