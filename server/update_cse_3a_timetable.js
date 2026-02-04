const db = require('./db');

async function updateCSE3YearATimetable() {
    try {
        console.log("Updating CSE 3rd Year A Section Timetable...");
        
        // Clear existing timetable for CSE 3rd Year A
        console.log("Clearing existing timetable...");
        await db.query(`
            DELETE FROM timetable 
            WHERE year = 3 AND section = 'A'
        `);
        
        // Timetable data from the image
        const timetableData = [
            // Monday
            { day: 'Monday', hour: 1, subject_id: null, staff_id: null, room: '301', year: 3, section: 'A', department: 'CSE' }, // Free period
            { day: 'Monday', hour: 2, subject_code: 'CS3491', subject_name: 'Machine Learning', staff_name: 'Mrs. R. Binisha', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Monday', hour: 3, subject_code: 'CCS336', subject_name: 'Cloud Computing', staff_name: 'Mrs. S. Nivethitha', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Monday', hour: 4, subject_code: 'CCS337', subject_name: 'Software Testing', staff_name: 'Mrs. R. Abinaya', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Monday', hour: 5, subject_code: 'CCS338', subject_name: 'Compiler Design', staff_name: 'Mrs. K. Divya', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Monday', hour: 6, subject_code: 'CCS354', subject_name: 'Web Technology', staff_name: 'Mrs. K. Sowmiya', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Monday', hour: 7, subject_code: 'CCS356', subject_name: 'Data Science', staff_name: 'Mrs. R. Binisha', room: '301', year: 3, section: 'A', department: 'CSE' },
            
            // Tuesday
            { day: 'Tuesday', hour: 1, subject_code: 'CCS336', subject_name: 'Cloud Computing', staff_name: 'Mrs. S. Nivethitha', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Tuesday', hour: 2, subject_code: 'CCS337', subject_name: 'Software Testing', staff_name: 'Mrs. R. Abinaya', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Tuesday', hour: 3, subject_code: 'CCS338', subject_name: 'Compiler Design', staff_name: 'Mrs. K. Divya', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Tuesday', hour: 4, subject_code: 'CCS354', subject_name: 'Web Technology', staff_name: 'Mrs. K. Sowmiya', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Tuesday', hour: 5, subject_code: 'CCS356', subject_name: 'Data Science', staff_name: 'Mrs. R. Binisha', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Tuesday', hour: 6, subject_id: null, staff_id: null, room: '301', year: 3, section: 'A', department: 'CSE' }, // Free period
            { day: 'Tuesday', hour: 7, subject_code: 'CS3491', subject_name: 'Machine Learning', staff_name: 'Mrs. R. Binisha', room: '301', year: 3, section: 'A', department: 'CSE' },
            
            // Wednesday
            { day: 'Wednesday', hour: 1, subject_code: 'CCS338', subject_name: 'Compiler Design', staff_name: 'Mrs. K. Divya', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Wednesday', hour: 2, subject_code: 'CCS354', subject_name: 'Web Technology', staff_name: 'Mrs. K. Sowmiya', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Wednesday', hour: 3, subject_code: 'CCS356', subject_name: 'Data Science', staff_name: 'Mrs. R. Binisha', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Wednesday', hour: 4, subject_code: 'CS3491', subject_name: 'Machine Learning', staff_name: 'Mrs. R. Binisha', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Wednesday', hour: 5, subject_code: 'CCS336', subject_name: 'Cloud Computing', staff_name: 'Mrs. S. Nivethitha', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Wednesday', hour: 6, subject_code: 'CCS337', subject_name: 'Software Testing', staff_name: 'Mrs. R. Abinaya', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Wednesday', hour: 7, subject_id: null, staff_id: null, room: '301', year: 3, section: 'A', department: 'CSE' }, // Free period
            
            // Thursday
            { day: 'Thursday', hour: 1, subject_code: 'CCS354', subject_name: 'Web Technology', staff_name: 'Mrs. K. Sowmiya', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Thursday', hour: 2, subject_code: 'CCS356', subject_name: 'Data Science', staff_name: 'Mrs. R. Binisha', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Thursday', hour: 3, subject_code: 'CS3491', subject_name: 'Machine Learning', staff_name: 'Mrs. R. Binisha', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Thursday', hour: 4, subject_code: 'CCS336', subject_name: 'Cloud Computing', staff_name: 'Mrs. S. Nivethitha', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Thursday', hour: 5, subject_code: 'CCS337', subject_name: 'Software Testing', staff_name: 'Mrs. R. Abinaya', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Thursday', hour: 6, subject_id: null, staff_id: null, room: '301', year: 3, section: 'A', department: 'CSE' }, // Free period
            { day: 'Thursday', hour: 7, subject_code: 'CCS338', subject_name: 'Compiler Design', staff_name: 'Mrs. K. Divya', room: '301', year: 3, section: 'A', department: 'CSE' },
            
            // Friday
            { day: 'Friday', hour: 1, subject_code: 'CCS356', subject_name: 'Data Science', staff_name: 'Mrs. R. Binisha', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Friday', hour: 2, subject_code: 'CS3491', subject_name: 'Machine Learning', staff_name: 'Mrs. R. Binisha', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Friday', hour: 3, subject_code: 'CCS336', subject_name: 'Cloud Computing', staff_name: 'Mrs. S. Nivethitha', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Friday', hour: 4, subject_code: 'CCS337', subject_name: 'Software Testing', staff_name: 'Mrs. R. Abinaya', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Friday', hour: 5, subject_code: 'CCS338', subject_name: 'Compiler Design', staff_name: 'Mrs. K. Divya', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Friday', hour: 6, subject_code: 'CCS354', subject_name: 'Web Technology', staff_name: 'Mrs. K. Sowmiya', room: '301', year: 3, section: 'A', department: 'CSE' },
            { day: 'Friday', hour: 7, subject_id: null, staff_id: null, room: '301', year: 3, section: 'A', department: 'CSE' }, // Free period
        ];
        
        console.log("Inserting new timetable data...");
        
        for (const entry of timetableData) {
            if (entry.subject_code) {
                // Get subject ID
                const subjectResult = await db.query(
                    "SELECT id FROM subjects WHERE subject_code = $1",
                    [entry.subject_code]
                );
                
                let subjectId = subjectResult.rows[0]?.id;
                
                // If subject doesn't exist, create it
                if (!subjectId) {
                    const newSubject = await db.query(
                        "INSERT INTO subjects (subject_code, subject_name) VALUES ($1, $2) RETURNING id",
                        [entry.subject_code, entry.subject_name]
                    );
                    subjectId = newSubject.rows[0].id;
                    console.log(`Created new subject: ${entry.subject_code} - ${entry.subject_name}`);
                }
                
                // Get staff ID
                const staffResult = await db.query(
                    "SELECT id FROM staff WHERE name = $1",
                    [entry.staff_name]
                );
                
                let staffId = staffResult.rows[0]?.id;
                
                // If staff doesn't exist, create them
                if (!staffId) {
                    const newStaff = await db.query(
                        "INSERT INTO staff (name, department, email) VALUES ($1, $2, $3) RETURNING id",
                        [entry.staff_name, 'CSE', entry.staff_name.toLowerCase().replace(/\s+/g, '.') + '@college.edu']
                    );
                    staffId = newStaff.rows[0].id;
                    console.log(`Created new staff: ${entry.staff_name}`);
                }
                
                // Insert timetable entry
                await db.query(
                    `INSERT INTO timetable (day, period, subject_id, staff_id, year, section) 
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [entry.day, entry.hour, subjectId, staffId, entry.year, entry.section]
                );
                
                console.log(`Added: ${entry.day} Hour ${entry.hour} - ${entry.subject_code} (${entry.staff_name})`);
            } else {
                // Free period
                await db.query(
                    `INSERT INTO timetable (day, period, subject_id, staff_id, year, section) 
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [entry.day, entry.hour, null, null, entry.year, entry.section]
                );
                
                console.log(`Added: ${entry.day} Hour ${entry.hour} - FREE PERIOD`);
            }
        }
        
        console.log("✅ CSE 3rd Year A Section timetable updated successfully!");
        
    } catch (error) {
        console.error("❌ Error updating timetable:", error);
    } finally {
        process.exit(0);
    }
}

updateCSE3YearATimetable();
