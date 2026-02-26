const db = require('./db');
const fs = require('fs');

async function fixLocalDb() {
    try {
        console.log("Adding missing columns to local DB...");
        await db.query(`
            ALTER TABLE fees ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) DEFAULT '2025-2026';
            ALTER TABLE fees ADD COLUMN IF NOT EXISTS scholarship_type VARCHAR(100);
            ALTER TABLE fees ADD COLUMN IF NOT EXISTS scholarship_details TEXT;
            
            -- Ensure settings exist locally
            INSERT INTO settings (key, value) VALUES ('current_academic_year', '2025-2026') ON CONFLICT DO NOTHING;
        `);
        console.log("Local DB fixed.");
        process.exit(0);
    } catch (e) {
        console.error("Local Fix Error:", e.message);
        process.exit(1);
    }
}
fixLocalDb();
