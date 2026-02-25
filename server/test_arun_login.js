const axios = require('axios');
const fs = require('fs');

async function testLoginAndNoDue() {
    try {
        const loginRes = await axios.post('http://localhost:5000/api/login', {
            username: 'Mr.ARUNFAC001',
            password: 'password123',
            role: 'staff'
        });
        let out = "Login User: " + JSON.stringify(loginRes.data.user) + "\n";

        const user = loginRes.data.user;
        if (user.profileId) {
            const q = `http://localhost:5000/api/no-due?role=staff&profile_id=${user.profileId}`;
            const nodues = await axios.get(q);
            out += `No dues for staff ${user.profileId}: ${nodues.data.length} requests\n`;
            if (nodues.data.length > 0) {
                out += "First request ID:" + nodues.data[0].id + "\n";
            }
        } else {
            out += "NO PROFILE ID!\n";
        }
        fs.writeFileSync('test_out2.txt', out, 'utf8');
    } catch (e) {
        fs.writeFileSync('test_out2.txt', JSON.stringify(e.response?.data || e.message), 'utf8');
        process.exit(1);
    }
}
testLoginAndNoDue();
