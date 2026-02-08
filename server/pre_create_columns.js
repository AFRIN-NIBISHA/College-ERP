const db = require('./db');
async function run() {
    try {
        console.log("Pre-creating No Due columns for Year 3 Section A...");

        // 1. Get Subjects
        const subjectsRes = await db.query(`
            SELECT DISTINCT s.subject_code 
            FROM timetable t 
            JOIN subjects s ON t.subject_id = s.id 
            WHERE t.year = 3 AND t.section = 'A'
        `);

        console.log(`Found ${subjectsRes.rows.length} subjects.`);

        for (const sub of subjectsRes.rows) {
            const colName = sub.subject_code.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_status';
            console.log(`Checking/Creating column: ${colName}`);

            await db.query(`ALTER TABLE no_dues ADD COLUMN IF NOT EXISTS "${colName}" VARCHAR(20) DEFAULT 'Pending'`);
        }

        console.log("All columns ensured.");
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
