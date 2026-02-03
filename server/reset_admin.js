const db = require('./db');

const resetAdmin = async () => {
    try {
        console.log("Resetting admin password...");
        // Delete existing admin to be sure
        await db.query("DELETE FROM users WHERE username = 'admin'");

        // Re-create simple admin
        await db.query("INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin')");

        console.log("Admin reset complete: username='admin', password='admin123'");

        // Verify
        const res = await db.query("SELECT * FROM users WHERE username = 'admin'");
        console.log("Verification:", res.rows[0]);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};

resetAdmin();
