const axios = require('axios');

async function testNoDueApproval() {
    try {
        console.log("Testing No Due Office Approval API...");
        
        // Test the approval endpoint
        const response = await axios.put('http://localhost:5000/api/no-due/1/approve', {
            field: 'office_status',
            status: 'Approved',
            remarks: null
        });
        
        console.log("✅ API Response:", response.data);
        console.log("✅ Office approval successful!");
        
    } catch (error) {
        console.error("❌ API Test Failed:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testNoDueApproval();
