const db = require('./db');

async function updateAdminCredentials() {
    try {
        console.log("=== Updating Admin Credentials for Staff, HOD, Office, Principal ===");
        
        // Define the roles and their new usernames
        const rolesToUpdate = [
            { role: 'staff', username: 'staff' },
            { role: 'hod', username: 'hod' },
            { role: 'office', username: 'office' },
            { role: 'principal', username: 'principal' }
        ];
        
        for (const { role, username } of rolesToUpdate) {
            console.log(`\nUpdating ${role} credentials...`);
            
            // Get all users with this role
            const usersResult = await db.query(
                "SELECT id, username FROM users WHERE role = $1",
                [role]
            );
            
            if (usersResult.rows.length === 0) {
                console.log(`No ${role} users found`);
                continue;
            }
            
            console.log(`Found ${usersResult.rows.length} ${role} users:`);
            
            // Update each user to have the new credentials
            for (const user of usersResult.rows) {
                console.log(`  - User ID: ${user.id} (${user.username}) -> ${username}`);
                
                // Update username and password
                await db.query(
                    "UPDATE users SET username = $1, password = $2 WHERE id = $3",
                    [username, 'admin123', user.id]
                );
                
                console.log(`    ✅ Updated user ${user.id} to username: ${username}, password: admin123`);
            }
        }
        
        // Create a summary
        console.log("\n=== Updated Login Credentials ===");
        console.log("Staff Login:");
        console.log("  Username: staff");
        console.log("  Password: admin123");
        console.log("\nHOD Login:");
        console.log("  Username: hod");
        console.log("  Password: admin123");
        console.log("\nOffice Login:");
        console.log("  Username: office");
        console.log("  Password: admin123");
        console.log("\nPrincipal Login:");
        console.log("  Username: principal");
        console.log("  Password: admin123");
        console.log("\nAdmin Login (unchanged):");
        console.log("  Username: admin");
        console.log("  Password: admin123");
        
        // Verify the updates
        console.log("\n=== Verification ===");
        for (const { role, username } of rolesToUpdate) {
            const countResult = await db.query(
                "SELECT COUNT(*) as count FROM users WHERE role = $1 AND username = $2",
                [role, username]
            );
            console.log(`${role}: ${countResult.rows[0].count} users with username '${username}'`);
        }
        
        console.log("\n✅ Credentials update completed successfully!");
        
    } catch (error) {
        console.error("❌ Error updating credentials:", error);
    } finally {
        process.exit(0);
    }
}

updateAdminCredentials();
