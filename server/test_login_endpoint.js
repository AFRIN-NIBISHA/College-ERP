const testLogin = async () => {
    try {
        console.log("Testing Login with: admin / admin123");
        const res = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123',
                role: 'staff'
            })
        });

        const data = await res.json();
        console.log("Response Status:", res.status);
        console.log("Response Data:", data);
    } catch (err) {
        console.error("Login Failed:", err);
    }
};

testLogin();
