const db = require('./db');

async function simplifyAdminCredentials() {
    try {
        console.log("=== Simplifying Admin Credentials ===");
        
        // Define the roles to keep
        const rolesToKeep = ['staff', 'hod', 'office', 'principal'];
        
        for (const role of rolesToKeep) {
            console.log(`\nProcessing ${role} users...`);
            
            // Get all users with this role
            const usersResult = await db.query(
                "SELECT id, username FROM users WHERE role = $1 ORDER BY id",
                [role]
            );
            
            if (usersResult.rows.length === 0) {
                console.log(`No ${role} users found, creating one...`);
                
                // Create a new user for this role
                await db.query(
                    "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
                    [role, 'admin123', role]
                );
                console.log(`  ✅ Created new ${role} user: username=${role}, password=admin123`);
                continue;
            }
            
            console.log(`Found ${usersResult.rows.length} ${role} users:`);
            
            // Keep only the first user, delete the rest
            const firstUser = usersResult.rows[0];
            console.log(`  - Keeping user ID: ${firstUser.id} (${firstUser.username})`);
            
            // Update the first user to have simple credentials
            await db.query(
                "UPDATE users SET username = $1, password = $2 WHERE id = $3",
                [role, 'admin123', firstUser.id]
            );
            console.log(`  ✅ Updated to username: ${role}, password: admin123`);
            
            // Delete the rest
            for (let i = 1; i < usersResult.rows.length; i++) {
                const userToDelete = usersResult.rows[i];
                console.log(`  - Deleting user ID: ${userToDelete.id} (${userToDelete.username})`);
                await db.query("DELETE FROM users WHERE id = $1", [userToDelete.id]);
            }
        }
        
        // Final summary
        console.log("\n=== Final Login Credentials ===");
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
        
        // Verify the final state
        console.log("\n=== Final User Count ===");
        const finalCount = await db.query(`
            SELECT role, COUNT(*) as count, 
                   STRING_AGG(username, ', ') as usernames
            FROM users 
            GROUP BY role
            ORDER BY role
        `);
        
        finalCount.rows.forEach(row => {
            console.log(`${row.role}: ${row.count} users (${row.usernames})`);
        });
        
        console.log("\n✅ Admin credentials simplification completed!");
        
    } catch (error) {
        console.error("❌ Error simplifying credentials:", error);
    } finally {
        process.exit(0);
    }
}

simplifyAdminCredentials();
