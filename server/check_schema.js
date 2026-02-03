const db = require('./db');

async function checkNoDueSchema() {
    try {
        console.log("=== Checking No Due Table Schema ===");
        
        // Get the table structure
        const schemaResult = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'no_dues' 
            AND column_name LIKE '%_status'
            ORDER BY column_name
        `);
        
        console.log("Available status columns:");
        schemaResult.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type})`);
        });
        
        // Get a sample record to see current values
        const sampleResult = await db.query("SELECT * FROM no_dues LIMIT 1");
        if (sampleResult.rows.length > 0) {
            console.log("\nSample record columns:");
            const sample = sampleResult.rows[0];
            Object.keys(sample).forEach(key => {
                if (key.includes('_status') || key === 'id') {
                    console.log(`  - ${key}: ${sample[key]}`);
                }
            });
        }
        
    } catch (error) {
        console.error("Error checking schema:", error);
    } finally {
        process.exit(0);
    }
}

checkNoDueSchema();
