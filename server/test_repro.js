const fs = require('fs');
const BASE_URL = 'http://localhost:5000/api';

function log(msg) {
    fs.appendFileSync('test_output.txt', (typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg) + '\n');
}

async function test() {
    try {
        log("1. Fetching No Due Requests...");
        let res = await fetch(`${BASE_URL}/no-due`);
        let data = await res.json();
        log(`Fetched ${data.length} requests.`);

        if (data.length > 0) {
            const req = data[0];
            log({ msg: "Request found", req });
            const id = req.id;

            // 2. Testing 'Invalid stage' scenario
            log("\n2. Testing 'Invalid stage' scenario...");

            // Scenario A: Missing field and stage
            res = await fetch(`${BASE_URL}/no-due/${id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Approved' })
            });
            let result = await res.json();
            log(`Scenario A (No field/stage) Status: ${res.status}`);
            log(result);

            // Scenario B: Empty field
            res = await fetch(`${BASE_URL}/no-due/${id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ field: '', status: 'Approved' })
            });
            result = await res.json();
            log(`Scenario B (Empty field) Status: ${res.status}`);
            log(result);

            // Scenario C: Valid field
            log("Scenario C: Valid field 'ccs336_status'");
            res = await fetch(`${BASE_URL}/no-due/${id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ field: 'ccs336_status', status: 'Approved' })
            });
            result = await res.json();
            log(`Scenario C Status: ${res.status}`);
            log(result);


            // 3. Try to Delete
            log(`\n3. Deleting Request ID: ${id}`);
            res = await fetch(`${BASE_URL}/no-due/${id}`, { method: 'DELETE' });
            result = await res.json(); // Usually result is empty if 204? No, usage says returns json.
            log(`Delete Status: ${res.status}`);
            log(result);

        } else {
            log("No requests to test with.");
        }

    } catch (err) {
        log(`Test Error: ${err.message}`);
    }
}

test();
