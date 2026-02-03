async function testApi() {
    try {
        const url = 'http://localhost:5000/api/marks?year=1&section=A&subject_code=CS101';
        console.log("Fetching:", url);
        const res = await fetch(url);
        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Data Length:", data.length);
        console.log("First Item:", data[0]);
    } catch (err) {
        console.error("Error:", err);
    }
}

testApi();
