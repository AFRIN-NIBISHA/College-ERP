const db = require('./db');

async function checkUsers() {
    try {
        console.log("Checking users in the system...");
        
        // Check if there are any office users
        const officeUsers = await db.query("SELECT username, role FROM users WHERE role = 'office'");
        console.log(`Office users: ${officeUsers.rows.length}`);
        officeUsers.rows.forEach(user => {
            console.log(`- ${user.username} (${user.role})`);
        });
        
        // Check all user roles
        const allUsers = await db.query("SELECT username, role FROM users ORDER BY role");
        console.log("\nAll users by role:");
        allUsers.rows.forEach(user => {
            console.log(`- ${user.username} (${user.role})`);
        });
        
    } catch (error) {
        console.error("Error checking users:", error.message);
    } finally {
        process.exit(0);
    }
}

checkUsers();
