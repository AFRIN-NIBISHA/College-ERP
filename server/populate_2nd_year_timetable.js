const db = require('./db');

async function populate2ndYearTimetable() {
    try {
        console.log("Populating 2nd Year A Section timetable...");

        // Clear existing timetable for 2nd Year A
        await db.query('DELETE FROM timetable WHERE year = 2 AND section = \'A\'');
        console.log("Cleared existing 2nd Year A timetable");

        // Get subject and staff IDs
        const subjects = await db.query('SELECT id, subject_code FROM subjects');
        const staff = await db.query('SELECT id, name FROM staff');
        
        const subjectMap = {};
        subjects.rows.forEach(s => subjectMap[s.subject_code] = s.id);
        
        const staffMap = {};
        staff.rows.forEach(s => staffMap[s.name] = s.id);

        // Timetable data based on the image
        // Mapping: Period 1-8 (9:00 AM to 4:10 PM, excluding breaks)
        const timetableData = [
            // Monday
            { day: 'Monday', period: 1, subject_code: 'CS3451', staff_name: 'Mrs. RAJU' },
            { day: 'Monday', period: 2, subject_code: 'CS3491', staff_name: 'Mrs. STEPHY CHRISTINA' },
            { day: 'Monday', period: 3, subject_code: 'CS3452', staff_name: 'Mr. ARUN VENKADESH' },
            { day: 'Monday', period: 4, subject_code: 'CS3492', staff_name: 'Mrs. ALG Staff' },
            { day: 'Monday', period: 5, subject_code: 'CS3491', staff_name: 'Mrs. STEPHY CHRISTINA' }, // AIML Lab
            { day: 'Monday', period: 6, subject_code: 'CS3401', staff_name: 'Mrs. ALG Staff' },
            { day: 'Monday', period: 7, subject_code: 'CS3452', staff_name: 'Mr. ARUN VENKADESH' },
            { day: 'Monday', period: 8, subject_code: 'CS3492', staff_name: 'Mrs. ALG Staff' },

            // Tuesday
            { day: 'Tuesday', period: 1, subject_code: 'CS3452', staff_name: 'Mr. ARUN VENKADESH' },
            { day: 'Tuesday', period: 2, subject_code: 'NM002', staff_name: 'NPTEL Coordinator' }, // NAAN MUTHALVAN
            { day: 'Tuesday', period: 3, subject_code: 'NM002', staff_name: 'NPTEL Coordinator' }, // NAAN MUTHALVAN
            { day: 'Tuesday', period: 4, subject_code: 'NM002', staff_name: 'NPTEL Coordinator' }, // NAAN MUTHALVAN
            { day: 'Tuesday', period: 5, subject_code: 'CS3401', staff_name: 'Mrs. ALG Staff' },
            { day: 'Tuesday', period: 6, subject_code: 'CS3461', staff_name: 'Mrs. RAJU' }, // OS Lab
            { day: 'Tuesday', period: 7, subject_code: 'GE3451', staff_name: 'EVS Staff' },
            { day: 'Tuesday', period: 8, subject_code: 'GE3451', staff_name: 'EVS Staff' },

            // Wednesday
            { day: 'Wednesday', period: 1, subject_code: 'CS3491', staff_name: 'Mrs. STEPHY CHRISTINA' },
            { day: 'Wednesday', period: 2, subject_code: 'CS3401', staff_name: 'Mrs. ALG Staff' },
            { day: 'Wednesday', period: 3, subject_code: 'CS3451', staff_name: 'Mrs. RAJU' },
            { day: 'Wednesday', period: 4, subject_code: 'CS3452', staff_name: 'Mr. ARUN VENKADESH' },
            { day: 'Wednesday', period: 5, subject_code: 'NP001', staff_name: 'NPTEL Coordinator' }, // NPTEL DBMS
            { day: 'Wednesday', period: 6, subject_code: 'CS3481', staff_name: 'Mrs. ALG Staff' }, // DBMS Lab
            { day: 'Wednesday', period: 7, subject_code: 'CS3401', staff_name: 'Mrs. ALG Staff' },
            { day: 'Wednesday', period: 8, subject_code: 'CS3451', staff_name: 'Mrs. RAJU' },

            // Thursday
            { day: 'Thursday', period: 1, subject_code: 'CS3401', staff_name: 'Mrs. ALG Staff' },
            { day: 'Thursday', period: 2, subject_code: 'GE3451', staff_name: 'EVS Staff' },
            { day: 'Thursday', period: 3, subject_code: 'CS3451', staff_name: 'Mrs. RAJU' },
            { day: 'Thursday', period: 4, subject_code: 'CS3492', staff_name: 'Mrs. ALG Staff' },
            { day: 'Thursday', period: 5, subject_code: 'CS3402', staff_name: 'Mrs. ALG Staff' }, // ALG Lab
            { day: 'Thursday', period: 6, subject_code: 'GE3451', staff_name: 'EVS Staff' },
            { day: 'Thursday', period: 7, subject_code: 'CS3492', staff_name: 'Mrs. ALG Staff' },
            { day: 'Thursday', period: 8, subject_code: 'CS3491', staff_name: 'Mrs. STEPHY CHRISTINA' },

            // Friday
            { day: 'Friday', period: 1, subject_code: 'CS3492', staff_name: 'Mrs. ALG Staff' },
            { day: 'Friday', period: 2, subject_code: 'CS3452', staff_name: 'Mr. ARUN VENKADESH' },
            { day: 'Friday', period: 3, subject_code: 'CS3491', staff_name: 'Mrs. STEPHY CHRISTINA' },
            { day: 'Friday', period: 4, subject_code: 'CS3451', staff_name: 'Mrs. RAJU' },
            { day: 'Friday', period: 5, subject_code: 'GE3451', staff_name: 'EVS Staff' },
            { day: 'Friday', period: 6, subject_code: 'CS3451', staff_name: 'Mrs. RAJU' },
            { day: 'Friday', period: 7, subject_code: 'SS002', staff_name: 'Softskill Trainer' }, // Softskill
            { day: 'Friday', period: 8, subject_code: 'SS002', staff_name: 'Softskill Trainer' }  // Softskill
        ];

        // Insert timetable entries
        for (const entry of timetableData) {
            const subjectId = subjectMap[entry.subject_code];
            const staffId = staffMap[entry.staff_name];
            
            if (subjectId && staffId) {
                await db.query(`
                    INSERT INTO timetable (year, section, day, period, subject_id, staff_id) 
                    VALUES (2, 'A', $1, $2, $3, $4)
                `, [entry.day, entry.period, subjectId, staffId]);
                
                console.log(`✓ Added: ${entry.day} Period ${entry.period} - ${entry.subject_code} by ${entry.staff_name}`);
            } else {
                console.log(`⚠ Missing mapping for: ${entry.subject_code} or ${entry.staff_name}`);
            }
        }

        console.log("2nd Year A Section timetable populated successfully!");

    } catch (error) {
        console.error("Error populating timetable:", error);
    } finally {
        process.exit(0);
    }
}

populate2ndYearTimetable();
