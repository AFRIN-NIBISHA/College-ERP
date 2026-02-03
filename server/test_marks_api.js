async function testMarksApi() {
    try {
        // Test 1: Year 3, Section A (assuming user added students here)
        const url = 'http://localhost:5000/api/marks?year=3&section=A&subject_code=CS101';
        console.log(`Fetching from: ${url}`);

        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Error: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error("Response body:", text);
            return;
        }

        const data = await res.json();
        console.log("Success! Data received:");
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

testMarksApi();
