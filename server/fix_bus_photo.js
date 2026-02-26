const db = require('./db');
async function fix() {
    try {
        await db.query(`ALTER TABLE bus ADD COLUMN IF NOT EXISTS photo_data TEXT;`);
        console.log("Photo column added successfully to bus table");
    } catch (e) { console.error(e); }
    process.exit(0);
}
fix();
