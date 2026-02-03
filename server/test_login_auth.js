const axios = require('axios');

async function testLogin(username, password) {
    try {
        console.log(`Testing login for ${username} / ${password}...`);
        const res = await axios.post('http://localhost:5000/api/login', {
            username,
            password
        });
        console.log("✅ Success:", res.data.message);
    } catch (err) {
        if (err.response) {
            console.log("❌ Failed:", err.response.status, err.response.data.message);
        } else {
            console.log("❌ Error:", err.message);
        }
    }
}

async function runTests() {
    await testLogin('Staff', 'staff@123');       // Should Succeed
    await testLogin('staff', 'staff@123');       // Should Succeed (Case insensitive user)
    await testLogin('Staff', 'wrongpass');       // Should Fail
    await testLogin('NonExistent', 'any');       // Should Fail
    // Add test for HOD/Principal
    await testLogin('Principal', 'principal@123'); // Should Succeed
}

runTests();
