const axios = require('axios');

async function testDelete() {
    try {
        const res = await axios.get('http://localhost:5000/api/no-due?student_id=960623104004');
        console.log("Current requests:", res.data);
        const reqId = res.data[0]?.id;
        console.log("Request ID to delete:", reqId);

        if (reqId) {
            const delRes = await axios.delete(`http://localhost:5000/api/no-due/${reqId}`);
            console.log("Delete response:", delRes.data);
        } else {
            console.log("No request ID found, testing with 'null'...");
            const delRes = await axios.delete(`http://localhost:5000/api/no-due/null`);
            console.log("Delete response:", delRes.data);
        }
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}

testDelete();
