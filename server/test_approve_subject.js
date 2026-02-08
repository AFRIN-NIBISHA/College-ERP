const axios = require('axios');

async function run() {
    try {
        const requestId = 13; // From previous step
        const subjectCode = 'CCS356';
        const field = 'ccs356_status';

        console.log(`Simulating approval for Request ${requestId}, Subject ${subjectCode} (${field})...`);

        // We can't use axios against the running server easily unless we know the port and it's running.
        // But since I can run node scripts with the db connection, I can simulate the internal logic or use axios if the server is running on a known port.
        // The .env says PORT=5000. Let's try hitting the local server.

        const res = await axios.put(`http://localhost:5000/api/no-due/${requestId}/approve`, {
            field: field,
            status: 'Approved',
            remarks: 'Test Approval'
        });

        console.log("Response:", res.data);
    } catch (err) {
        console.error("Error:", err.message);
        if (err.response) {
            console.error("Response data:", err.response.data);
        }
    }
}
run();
