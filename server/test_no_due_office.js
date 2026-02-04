const axios = require('axios');

async function testNoDueOfficeAccess() {
    try {
        console.log("=== Testing No Due Office Access ===");
        
        // Test 1: Check if office users can see all No Due requests
        console.log("\n1. Testing GET /api/no-due with role=office");
        try {
            const officeRes = await axios.get('http://localhost:5000/api/no-due?role=office');
            console.log("✅ Office No Due requests:", officeRes.data.length, "requests");
            if (officeRes.data.length > 0) {
                console.log("Sample request:", officeRes.data[0]);
            }
        } catch (error) {
            console.error("❌ Office No Due failed:", error.message);
            if (error.response) {
                console.error("Response:", error.response.data);
            }
        }
        
        // Test 2: Check if students can see their own requests
        console.log("\n2. Testing GET /api/no-due with role=student&student_id=1");
        try {
            const studentRes = await axios.get('http://localhost:5000/api/no-due?role=student&student_id=1');
            console.log("✅ Student No Due requests:", studentRes.data.length, "requests");
            if (studentRes.data.length > 0) {
                console.log("Sample request:", studentRes.data[0]);
            }
        } catch (error) {
            console.error("❌ Student No Due failed:", error.message);
            if (error.response) {
                console.error("Response:", error.response.data);
            }
        }
        
        // Test 3: Check all No Due requests without role filter
        console.log("\n3. Testing GET /api/no-due (all requests)");
        try {
            const allRes = await axios.get('http://localhost:5000/api/no-due');
            console.log("✅ All No Due requests:", allRes.data.length, "requests");
            if (allRes.data.length > 0) {
                console.log("Sample request:", allRes.data[0]);
            }
        } catch (error) {
            console.error("❌ All No Due failed:", error.message);
            if (error.response) {
                console.error("Response:", error.response.data);
            }
        }
        
    } catch (error) {
        console.error("Test error:", error);
    }
}

testNoDueOfficeAccess();
