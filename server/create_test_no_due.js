const db = require('./db');

async function createTestNoDueRequest() {
    try {
        console.log("=== Creating Test No Due Request ===");
        
        // Get a student ID
        const studentResult = await db.query("SELECT id FROM students WHERE year = 3 AND section = 'A' LIMIT 1");
        
        if (studentResult.rows.length === 0) {
            console.log("❌ No students found in 3rd Year A Section");
            return;
        }
        
        const studentId = studentResult.rows[0].id;
        console.log(`Using student ID: ${studentId}`);
        
        // Create a No Due request
        await db.query(
            "INSERT INTO no_dues (student_id, semester) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [studentId, '6']
        );
        
        console.log("✅ Test No Due request created successfully");
        
        // Test the API
        console.log("\n=== Testing API Calls ===");
        
        // Test without role
        try {
            const allRes = await db.query(`
                SELECT nd.*, s.name, s.roll_no, s.year, s.section, s.department
                FROM no_dues nd
                JOIN students s ON nd.student_id = s.id
                ORDER BY nd.created_at DESC
                LIMIT 5
            `);
            console.log("✅ Direct DB query - All requests:", allRes.rows.length);
            if (allRes.rows.length > 0) {
                console.log("Sample:", allRes.rows[0]);
            }
        } catch (error) {
            console.error("❌ Direct DB query failed:", error.message);
        }
        
    } catch (error) {
        console.error("Test error:", error);
    } finally {
        process.exit(0);
    }
}

createTestNoDueRequest();
