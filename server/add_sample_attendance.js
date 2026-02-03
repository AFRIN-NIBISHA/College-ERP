const db = require('./db');

async function addSampleAttendance() {
    try {
        console.log("Adding sample attendance data for 3rd Year A students...");

        // Get 3rd Year A students
        const studentsResult = await db.query('SELECT id FROM students WHERE year = 3 AND section = \'A\'');
        const students = studentsResult.rows;

        if (students.length === 0) {
            console.log("No 3rd Year A students found");
            return;
        }

        // Generate attendance for the last 30 days
        const today = new Date();
        const attendanceData = [];

        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;
            
            const dateStr = date.toISOString().split('T')[0];
            
            students.forEach(student => {
                // Random attendance: 80% Present, 15% Absent, 5% On Duty
                const rand = Math.random();
                let status = 'Present';
                if (rand > 0.95) status = 'On Duty';
                else if (rand > 0.80) status = 'Absent';
                
                attendanceData.push({
                    student_id: student.id,
                    date: dateStr,
                    status: status
                });
            });
        }

        // Insert attendance records
        for (const record of attendanceData) {
            try {
                await db.query(`
                    INSERT INTO attendance (student_id, date, status) 
                    VALUES ($1, $2, $3) 
                    ON CONFLICT (student_id, date) 
                    DO UPDATE SET status = EXCLUDED.status
                `, [record.student_id, record.date, record.status]);
            } catch (err) {
                // Skip if record exists
            }
        }

        console.log(`✓ Added ${attendanceData.length} attendance records for ${students.length} students`);

    } catch (error) {
        console.error("Error adding sample attendance:", error);
    } finally {
        process.exit(0);
    }
}

addSampleAttendance();
