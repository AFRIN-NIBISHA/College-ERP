const db = require('./db');

async function fix() {
    try {
        await db.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS emis_no VARCHAR(50);`);
        await db.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS umis_no VARCHAR(50);`);
        console.log("EMIS and UMIS columns added successfully");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

fix();
