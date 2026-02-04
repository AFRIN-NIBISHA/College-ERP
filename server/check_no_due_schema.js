const db = require('./db');

async function checkNoDueSchema() {
    try {
        console.log("=== Checking No Due Schema ===");
        
        // Check no_dues table
        console.log("\n1. Checking no_dues table structure:");
        const noDueSchema = await db.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'no_dues' 
            ORDER BY ordinal_position
        `);
        
        console.log("no_dues columns:");
        noDueSchema.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // Check fees table
        console.log("\n2. Checking fees table structure:");
        const feesSchema = await db.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'fees' 
            ORDER BY ordinal_position
        `);
        
        console.log("fees columns:");
        feesSchema.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // Check students table
        console.log("\n3. Checking students table structure:");
        const studentsSchema = await db.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'students' 
            ORDER BY ordinal_position
        `);
        
        console.log("students columns:");
        studentsSchema.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NO NULL'}`);
        });
        
        // Test the actual query
        console.log("\n4. Testing the actual query:");
        try {
            const testResult = await db.query(`
                SELECT nd.*, s.name, s.roll_no, s.year, s.section, s.department,
                       f.total_amount, f.paid_amount, f.status as fee_status
                FROM no_dues nd
                JOIN students s ON nd.student_id = s.id
                LEFT JOIN fees f ON nd.student_id = f.student_id
                ORDER BY nd.created_at DESC
                LIMIT 1
            `);
            console.log("✅ Query executed successfully");
            console.log("Sample result:", testResult.rows[0]);
        } catch (error) {
            console.error("❌ Query failed:", error.message);
            console.error("Error details:", error);
        }
        
    } catch (error) {
        console.error("Schema check error:", error);
    } finally {
        process.exit(0);
    }
}

checkNoDueSchema();
