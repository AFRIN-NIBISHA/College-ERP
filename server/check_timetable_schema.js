const db = require('./db');

async function checkTimetableSchema() {
    try {
        console.log("=== Checking Timetable Table Schema ===");
        
        // Get the table structure
        const schemaResult = await db.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'timetable' 
            ORDER BY ordinal_position
        `);
        
        console.log("Available columns in timetable table:");
        schemaResult.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
    } catch (error) {
        console.error("Error checking schema:", error);
    } finally {
        process.exit(0);
    }
}

checkTimetableSchema();
