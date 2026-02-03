const db = require('./db');

async function debugNoDue() {
    try {
        console.log("Debugging No Due system...");

        // Check current no_dues table structure
        const schemaResult = await db.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns 
            WHERE table_name = 'no_dues'
            ORDER BY ordinal_position
        `);
        
        console.log("\nCurrent no_dues table schema:");
        schemaResult.rows.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type} (default: ${col.column_default})`);
        });

        // Check existing no due requests
        const requestsResult = await db.query(`
            SELECT id, student_id, office_status, staff_status, hod_status, principal_status, status
            FROM no_dues
            LIMIT 5
        `);

        console.log("\nExisting No Due requests:");
        requestsResult.rows.forEach(req => {
            console.log(`ID ${req.id}: Student ${req.student_id} - Office: ${req.office_status}, Staff: ${req.staff_status}, HOD: ${req.hod_status}, Principal: ${req.principal_status}, Overall: ${req.status}`);
        });

        // Test the update query that's failing
        if (requestsResult.rows.length > 0) {
            const testId = requestsResult.rows[0].id;
            console.log(`\nTesting update query for request ID ${testId}...`);
            
            try {
                await db.query(`UPDATE no_dues SET office_status = $1, remarks = COALESCE($2, remarks) WHERE id = $3`, ['Approved', null, testId]);
                console.log("✓ Update query successful");
                
                // Check if it was updated
                const checkResult = await db.query("SELECT office_status FROM no_dues WHERE id = $1", [testId]);
                console.log(`✓ Updated office_status to: ${checkResult.rows[0].office_status}`);
                
            } catch (err) {
                console.error("❌ Update query failed:", err.message);
                console.error("Error details:", err);
            }
        }

    } catch (error) {
        console.error("Debug error:", error);
    } finally {
        process.exit(0);
    }
}

debugNoDue();
