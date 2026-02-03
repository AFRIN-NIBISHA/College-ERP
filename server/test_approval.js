const db = require('./db');

async function testNoDueApproval() {
    try {
        console.log("Testing No Due approval directly...");
        
        // Get a no due request
        const requestResult = await db.query("SELECT * FROM no_dues WHERE office_status = 'Pending' LIMIT 1");
        
        if (requestResult.rows.length === 0) {
            console.log("❌ No pending No Due requests found");
            return;
        }
        
        const request = requestResult.rows[0];
        console.log(`Testing with request ID: ${request.id}`);
        console.log(`Current office_status: ${request.office_status}`);
        
        // Test the exact update query that the backend uses
        const field = 'office_status';
        const status = 'Approved';
        const remarks = null;
        
        console.log(`Testing update: ${field} = ${status} for ID ${request.id}`);
        
        try {
            await db.query(`UPDATE no_dues SET ${field} = $1, remarks = COALESCE($2, remarks) WHERE id = $3`, [status, remarks, request.id]);
            console.log("✅ Direct database update successful");
            
            // Check if updated
            const checkResult = await db.query("SELECT office_status FROM no_dues WHERE id = $1", [request.id]);
            console.log(`✅ Updated office_status to: ${checkResult.rows[0].office_status}`);
            
        } catch (dbError) {
            console.error("❌ Database update failed:", dbError.message);
            console.error("Error details:", dbError);
        }
        
    } catch (error) {
        console.error("Test error:", error.message);
    } finally {
        process.exit(0);
    }
}

testNoDueApproval();
