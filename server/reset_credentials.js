const db = require('./db');

async function resetCredentials() {
    try {
        console.log("Resetting credentials as requested...");

        // List of users to update/insert
        // Using exact casing provided by user, assuming DB stores acting case-sensitive or user will type strictly.
        // However, usually it's better to lowercase.
        // User request: "Username: Staff..."
        // I will insert them exactly as provided.

        const updates = [
            { username: 'Staff', password: 'staff@123', role: 'staff' },
            { username: 'Principal', password: 'principal@123', role: 'principal' },
            { username: 'HOD', password: 'hod@123', role: 'hod' },
            { username: 'Office', password: 'office@123', role: 'office' }
        ];

        for (const u of updates) {
            // Check if exists (case insensitive check to clean up old ones if needed, or just insert new specific ones)
            // Let's delete old variations to avoid confusion? No, just upsert these specific usernames.

            // Check existence
            const check = await db.query("SELECT * FROM users WHERE username = $1", [u.username]);

            if (check.rows.length > 0) {
                // Update
                await db.query("UPDATE users SET password = $1, role = $2 WHERE username = $3", [u.password, u.role, u.username]);
                console.log(`Updated existing user: ${u.username}`);
            } else {
                // Insert
                await db.query("INSERT INTO users (username, password, role) VALUES ($1, $2, $3)", [u.username, u.password, u.role]);
                console.log(`Created new user: ${u.username}`);
            }

            // Also ensure there is a corresponding entry in 'staff' table for the 'Staff' user so they show up in other places if needed, 
            // but primarily this is for login.
        }

        console.log("\nCredentials set successfully!");
        console.table(updates);

    } catch (err) {
        console.error("Error resetting credentials:", err);
    } finally {
        process.exit();
    }
}

resetCredentials();
