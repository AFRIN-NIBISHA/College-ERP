const db = require('./db');

async function testSubjectsDirectly() {
    try {
        console.log("Testing subjects query directly...");
        
        const result = await db.query(`
            SELECT DISTINCT s.subject_code, s.subject_name, st.name as staff_name, s.credits
            FROM timetable t
            JOIN subjects s ON t.subject_id = s.id
            JOIN staff st ON t.staff_id = st.id
            WHERE t.year = 2 AND t.section = 'A'
            ORDER BY s.subject_code
        `);
        
        console.log("Query successful!");
        console.log("Number of subjects found:", result.rows.length);
        console.log("First few subjects:");
        result.rows.slice(0, 3).forEach(subject => {
            console.log(`- ${subject.subject_code}: ${subject.subject_name}`);
        });
        
    } catch (error) {
        console.error("Database query error:", error);
    } finally {
        process.exit(0);
    }
}

testSubjectsDirectly();
