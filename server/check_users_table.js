const db = require('./db');

async function checkUsersTable() {
    try {
        console.log("=== Checking Users Table ===");
        
        // Get the table structure
        const schemaResult = await db.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        `);
        
        console.log("Available columns in users table:");
        schemaResult.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // Check current users by role
        const rolesResult = await db.query(`
            SELECT role, COUNT(*) as count, 
                   STRING_AGG(username, ', ') as usernames
            FROM users 
            GROUP BY role
            ORDER BY role
        `);
        
        console.log("\nCurrent users by role:");
        rolesResult.rows.forEach(row => {
            console.log(`  ${row.role}: ${row.count} users (${row.usernames})`);
        });
        
    } catch (error) {
        console.error("Error checking users table:", error);
    } finally {
        process.exit(0);
    }
}

checkUsersTable();
