const db = require('./db');
const bcrypt = require('bcrypt');

async function updateAdminCredentials() {
    try {
        console.log("=== Updating Admin Credentials for Staff, HOD, Office, Principal ===");
        
        // Define the roles to update
        const rolesToUpdate = ['staff', 'hod', 'office', 'principal'];
        
        for (const role of rolesToUpdate) {
            console.log(`\nUpdating ${role} credentials...`);
            
            // Get all users with this role
            const usersResult = await db.query(
                "SELECT id, username, name FROM users WHERE role = $1",
                [role]
            );
            
            if (usersResult.rows.length === 0) {
                console.log(`No ${role} users found`);
                continue;
            }
            
            console.log(`Found ${usersResult.rows.length} ${role} users:`);
            
            // Update each user to have admin credentials
            for (const user of usersResult.rows) {
                console.log(`  - ${user.name} (${user.username}) -> admin`);
                
                // Hash the new password
                const hashedPassword = await bcrypt.hash('admin123', 10);
                
                // Update username and password
                await db.query(
                    "UPDATE users SET username = $1, password = $2 WHERE id = $3",
                    ['admin', hashedPassword, user.id]
                );
                
                console.log(`    ✅ Updated ${user.name} to username: admin, password: admin123`);
            }
        }
        
        // Create a summary of updated users
        console.log("\n=== Summary ===");
        for (const role of rolesToUpdate) {
            const countResult = await db.query(
                "SELECT COUNT(*) as count FROM users WHERE role = $1 AND username = 'admin'",
                [role]
            );
            console.log(`${role}: ${countResult.rows[0].count} users with admin credentials`);
        }
        
        // Test login info
        console.log("\n=== Login Credentials ===");
        console.log("Username: admin");
        console.log("Password: admin123");
        console.log("Valid for: All staff, HOD, office, and principal users");
        
        console.log("\n✅ Admin credentials update completed successfully!");
        
    } catch (error) {
        console.error("❌ Error updating credentials:", error);
    } finally {
        process.exit(0);
    }
}

updateAdminCredentials();
