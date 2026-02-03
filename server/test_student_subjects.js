const db = require('./db');

async function testStudentSubjects() {
    try {
        console.log("Testing student subjects data...");

        // Check if students exist
        const studentsResult = await db.query('SELECT * FROM students LIMIT 5');
        console.log("\nSample Students:");
        studentsResult.rows.forEach(student => {
            console.log(`- ${student.name} (${student.roll_no}) - Year ${student.year}, Section ${student.section}`);
        });

        // Check if timetable exists for 2nd Year A
        const timetableResult = await db.query(`
            SELECT COUNT(*) as count
            FROM timetable 
            WHERE year = 2 AND section = 'A'
        `);
        console.log(`\nTimetable entries for 2nd Year A: ${timetableResult.rows[0].count}`);

        // Test the actual query used in the API
        const subjectsResult = await db.query(`
            SELECT DISTINCT s.subject_code, s.subject_name, st.name as staff_name, s.credits
            FROM timetable t
            JOIN subjects s ON t.subject_id = s.id
            JOIN staff st ON t.staff_id = st.id
            WHERE t.year = 2 AND t.section = 'A'
            ORDER BY s.subject_code
        `);
        
        console.log("\nSubjects for 2nd Year A:");
        if (subjectsResult.rows.length === 0) {
            console.log("No subjects found!");
        } else {
            subjectsResult.rows.forEach(subject => {
                console.log(`- ${subject.subject_code}: ${subject.subject_name} (${subject.staff_name})`);
            });
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit(0);
    }
}

testStudentSubjects();
