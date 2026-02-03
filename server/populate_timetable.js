const db = require('./db');

async function populateTimetable() {
    try {
        console.log("Populating 3rd Year A Section timetable...");

        // Clear existing timetable for 3rd Year A
        await db.query('DELETE FROM timetable WHERE year = 3 AND section = \'A\'');
        console.log("Cleared existing 3rd Year A timetable");

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
            { day: 'Monday', period: 1, subject_code: 'CCS336', staff_name: 'Mrs. BINISHA' },
            { day: 'Monday', period: 2, subject_code: 'CCS336', staff_name: 'Mrs. BINISHA' },
            { day: 'Monday', period: 3, subject_code: 'CCS337', staff_name: 'Mrs. ANTO BABIYOLA' },
            { day: 'Monday', period: 4, subject_code: 'CCS337', staff_name: 'Mrs. ANTO BABIYOLA' },
            { day: 'Monday', period: 5, subject_code: 'NM001', staff_name: 'Mrs. SHEEBA' },
            { day: 'Monday', period: 6, subject_code: 'CCS354', staff_name: 'Mrs. RAJA KALA' },
            { day: 'Monday', period: 7, subject_code: 'CCS354', staff_name: 'Mrs. RAJA KALA' },
            { day: 'Monday', period: 8, subject_code: 'CS3491', staff_name: 'Dr. ABISHA MANO' },

            // Tuesday
            { day: 'Tuesday', period: 1, subject_code: 'CS3491', staff_name: 'Dr. ABISHA MANO' },
            { day: 'Tuesday', period: 2, subject_code: 'CS3491', staff_name: 'Dr. ABISHA MANO' },
            { day: 'Tuesday', period: 3, subject_code: 'CCS356', staff_name: 'Mrs. SHEEBA D' },
            { day: 'Tuesday', period: 4, subject_code: 'CCS356', staff_name: 'Mrs. SHEEBA D' },
            { day: 'Tuesday', period: 5, subject_code: 'CCS337', staff_name: 'Mrs. ANTO BABIYOLA' },
            { day: 'Tuesday', period: 6, subject_code: 'CCS337', staff_name: 'Mrs. ANTO BABIYOLA' },
            { day: 'Tuesday', period: 7, subject_code: 'OBT352', staff_name: 'Mrs. ARUN VENKADESH' },
            { day: 'Tuesday', period: 8, subject_code: 'OBT352', staff_name: 'Mrs. ARUN VENKADESH' },

            // Wednesday
            { day: 'Wednesday', period: 1, subject_code: 'CCS336', staff_name: 'Mrs. BINISHA' },
            { day: 'Wednesday', period: 2, subject_code: 'CCS336', staff_name: 'Mrs. BINISHA' },
            { day: 'Wednesday', period: 3, subject_code: 'CCS338', staff_name: 'Mrs. ARUN VENKADESH' },
            { day: 'Wednesday', period: 4, subject_code: 'CCS338', staff_name: 'Mrs. ARUN VENKADESH' },
            { day: 'Wednesday', period: 5, subject_code: 'CCS356', staff_name: 'Mrs. SHEEBA D' },
            { day: 'Wednesday', period: 6, subject_code: 'CCS356', staff_name: 'Mrs. SHEEBA D' },
            { day: 'Wednesday', period: 7, subject_code: 'SS001', staff_name: 'Dr. Bobby Denis' },
            { day: 'Wednesday', period: 8, subject_code: 'SS001', staff_name: 'Dr. Bobby Denis' },

            // Thursday
            { day: 'Thursday', period: 1, subject_code: 'CCS354', staff_name: 'Mrs. RAJA KALA' },
            { day: 'Thursday', period: 2, subject_code: 'CCS354', staff_name: 'Mrs. RAJA KALA' },
            { day: 'Thursday', period: 3, subject_code: 'CCS338', staff_name: 'Mrs. ARUN VENKADESH' },
            { day: 'Thursday', period: 4, subject_code: 'CCS338', staff_name: 'Mrs. ARUN VENKADESH' },
            { day: 'Thursday', period: 5, subject_code: 'NM001', staff_name: 'Mrs. SHEEBA' },
            { day: 'Thursday', period: 6, subject_code: 'NM001', staff_name: 'Mrs. SHEEBA' },
            { day: 'Thursday', period: 7, subject_code: 'OBT352', staff_name: 'Mrs. ARUN VENKADESH' },
            { day: 'Thursday', period: 8, subject_code: 'OBT352', staff_name: 'Mrs. ARUN VENKADESH' },

            // Friday
            { day: 'Friday', period: 1, subject_code: 'CCS336', staff_name: 'Mrs. BINISHA' },
            { day: 'Friday', period: 2, subject_code: 'CCS336', staff_name: 'Mrs. BINISHA' },
            { day: 'Friday', period: 3, subject_code: 'CCS356', staff_name: 'Mrs. SHEEBA D' },
            { day: 'Friday', period: 4, subject_code: 'CCS356', staff_name: 'Mrs. SHEEBA D' },
            { day: 'Friday', period: 5, subject_code: 'CS3491', staff_name: 'Dr. ABISHA MANO' },
            { day: 'Friday', period: 6, subject_code: 'CS3491', staff_name: 'Dr. ABISHA MANO' },
            { day: 'Friday', period: 7, subject_code: 'SS001', staff_name: 'Dr. Bobby Denis' },
            { day: 'Friday', period: 8, subject_code: 'SS001', staff_name: 'Dr. Bobby Denis' }
        ];

        // Insert timetable entries
        for (const entry of timetableData) {
            const subjectId = subjectMap[entry.subject_code];
            const staffId = staffMap[entry.staff_name];
            
            if (subjectId && staffId) {
                await db.query(`
                    INSERT INTO timetable (year, section, day, period, subject_id, staff_id) 
                    VALUES (3, 'A', $1, $2, $3, $4)
                `, [entry.day, entry.period, subjectId, staffId]);
                
                console.log(`✓ Added: ${entry.day} Period ${entry.period} - ${entry.subject_code} by ${entry.staff_name}`);
            } else {
                console.log(`⚠ Missing mapping for: ${entry.subject_code} or ${entry.staff_name}`);
            }
        }

        console.log("3rd Year A Section timetable populated successfully!");

    } catch (error) {
        console.error("Error populating timetable:", error);
    } finally {
        process.exit(0);
    }
}

populateTimetable();
