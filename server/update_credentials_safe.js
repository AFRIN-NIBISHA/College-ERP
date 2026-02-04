const db = require('./db');

async function updateCredentialsSafely() {
    try {
        console.log("=== Updating Credentials Safely ===");
        
        // Get all users and update them with unique usernames
        const allUsersResult = await db.query(
            "SELECT id, role, username FROM users WHERE role IN ('staff', 'hod', 'office', 'principal') ORDER BY role, id"
        );
        
        console.log(`Found ${allUsersResult.rows.length} users to update`);
        
        // Create unique usernames for each user
        let staffCounter = 1;
        let hodCounter = 1;
        let officeCounter = 1;
        let principalCounter = 1;
        
        for (const user of allUsersResult.rows) {
            let newUsername;
            
            switch (user.role) {
                case 'staff':
                    newUsername = staffCounter === 1 ? 'staff' : `staff${staffCounter}`;
                    staffCounter++;
                    break;
                case 'hod':
                    newUsername = hodCounter === 1 ? 'hod' : `hod${hodCounter}`;
                    hodCounter++;
                    break;
                case 'office':
                    newUsername = officeCounter === 1 ? 'office' : `office${officeCounter}`;
                    officeCounter++;
                    break;
                case 'principal':
                    newUsername = principalCounter === 1 ? 'principal' : `principal${principalCounter}`;
                    principalCounter++;
                    break;
                default:
                    newUsername = user.username;
            }
            
            console.log(`Updating ${user.role} user ID ${user.id}: ${user.username} -> ${newUsername}`);
            
            // Update the user
            await db.query(
                "UPDATE users SET username = $1, password = $2 WHERE id = $3",
                [newUsername, 'admin123', user.id]
            );
            
            console.log(`  ✅ Updated to username: ${newUsername}, password: admin123`);
        }
        
        // Final login credentials
        console.log("\n=== Updated Login Credentials ===");
        console.log("Staff Login:");
        console.log("  Username: staff");
        console.log("  Password: admin123");
        console.log("  (Other staff users: staff2, staff3, etc.)");
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
        const verificationResult = await db.query(`
            SELECT role, COUNT(*) as count, 
                   STRING_AGG(username, ', ') as usernames
            FROM users 
            WHERE role IN ('staff', 'hod', 'office', 'principal')
            GROUP BY role
            ORDER BY role
        `);
        
        verificationResult.rows.forEach(row => {
            console.log(`${row.role}: ${row.count} users (${row.usernames})`);
        });
        
        console.log("\n✅ Credentials update completed successfully!");
        
    } catch (error) {
        console.error("❌ Error updating credentials:", error);
    } finally {
        process.exit(0);
    }
}

updateCredentialsSafely();
