const db = require('./db');

async function testNoDueDirectly() {
    try {
        console.log("Testing No Due Office Approval directly...");
        
        // Get a no due request
        const requestResult = await db.query("SELECT * FROM no_dues LIMIT 1");
        
        if (requestResult.rows.length === 0) {
            console.log("❌ No No Due requests found");
            return;
        }
        
        const request = requestResult.rows[0];
        console.log(`Testing with request ID: ${request.id}`);
        console.log(`Current office_status: ${request.office_status}`);
        
        // Update the office status
        await db.query("UPDATE no_dues SET office_status = $1 WHERE id = $2", ['Approved', request.id]);
        
        // Check if updated
        const checkResult = await db.query("SELECT office_status FROM no_dues WHERE id = $1", [request.id]);
        console.log(`✅ Updated office_status to: ${checkResult.rows[0].office_status}`);
        
        console.log("✅ Direct database update successful!");
        
    } catch (error) {
        console.error("❌ Direct test failed:", error.message);
    } finally {
        process.exit(0);
    }
}

testNoDueDirectly();
