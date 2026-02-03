const axios = require('axios');

async function testSubjectsAPI() {
    try {
        console.log("Testing /api/student/subjects endpoint...");
        
        const response = await axios.get('http://localhost:5000/api/student/subjects?year=2&section=A');
        
        console.log("Response status:", response.status);
        console.log("Response data length:", response.data.length);
        console.log("Sample response:");
        console.log(JSON.stringify(response.data.slice(0, 2), null, 2));
        
    } catch (error) {
        console.error("Error testing API:", error.message);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
    }
}

testSubjectsAPI();
