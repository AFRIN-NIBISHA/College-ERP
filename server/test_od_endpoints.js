const axios = require('axios');

async function testODEndpoints() {
    try {
        console.log("=== Testing OD Endpoints ===");
        
        // Test 1: Get OD requests
        console.log("\n1. Testing GET /api/od");
        try {
            const getResponse = await axios.get('http://localhost:5000/api/od');
            console.log("✅ GET /api/od successful");
            console.log("Response data:", getResponse.data);
        } catch (error) {
            console.error("❌ GET /api/od failed:", error.message);
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
            }
        }
        
        // Test 2: Test OD delete with a sample ID
        console.log("\n2. Testing DELETE /api/od/999");
        try {
            const deleteResponse = await axios.delete('http://localhost:5000/api/od/999');
            console.log("✅ DELETE /api/od/999 successful");
            console.log("Response data:", deleteResponse.data);
        } catch (error) {
            console.error("❌ DELETE /api/od/999 failed:", error.message);
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
            }
        }
        
    } catch (error) {
        console.error("Test error:", error.message);
    }
}

testODEndpoints();
