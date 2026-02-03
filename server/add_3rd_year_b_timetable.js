const db = require('./db');

async function add3rdYearBData() {
    try {
        console.log("Adding 3rd Year B Section staff and timetable...");

        // Add new staff members mentioned in the timetable
        const staff = [
            { staff_id: 'STF024', name: 'Raju', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF025', name: 'Munir', designation: 'Assistant Professor', department: 'CSE' }
        ];

        for (const member of staff) {
            try {
                await db.query(
                    'INSERT INTO staff (staff_id, name, designation, department) VALUES ($1, $2, $3, $4) ON CONFLICT (staff_id) DO NOTHING',
                    [member.staff_id, member.name, member.designation, member.department]
                );
                console.log(`✓ Added staff: ${member.name}`);
            } catch (err) {
                console.log(`⚠ Staff ${member.name} might already exist`);
            }
        }

        // Clear existing timetable for 3rd Year B
        await db.query('DELETE FROM timetable WHERE year = 3 AND section = \'B\'');
        console.log("Cleared existing 3rd Year B timetable");

        // Get subject and staff IDs
        const subjects = await db.query('SELECT id, subject_code FROM subjects');
        const staffQuery = await db.query('SELECT id, name FROM staff');
        
        const subjectMap = {};
        subjects.rows.forEach(s => subjectMap[s.subject_code] = s.id);
        
        const staffMap = {};
        staffQuery.rows.forEach(s => staffMap[s.name] = s.id);

        // Timetable data based on the image
        const timetableData = [
            // Monday
            { day: 'Monday', period: 1, subject_code: 'CCS356', staff_name: 'Mrs. SHEEBA D' }, // OOSE
            { day: 'Monday', period: 2, subject_code: 'OBT352', staff_name: 'Mrs. ARUN VENKADESH' }, // Food
            { day: 'Monday', period: 3, subject_code: 'CCS354', staff_name: 'Mrs. RAJA KALA' }, // NS LAB
            { day: 'Monday', period: 4, subject_code: 'CCS354', staff_name: 'Mrs. RAJA KALA' }, // NS LAB
            { day: 'Monday', period: 5, subject_code: 'OBT352', staff_name: 'Mrs. ARUN VENKADESH' }, // FOOD
            { day: 'Monday', period: 6, subject_code: 'NM002', staff_name: 'Mrs. SHEEBA' }, // NAAN MUTHALVAN
            { day: 'Monday', period: 7, subject_code: 'NM002', staff_name: 'Mrs. SHEEBA' }, // NAAN MUTHALVAN
            { day: 'Monday', period: 8, subject_code: 'NM002', staff_name: 'Mrs. SHEEBA' }, // NAAN MUTHALVAN

            // Tuesday
            { day: 'Tuesday', period: 1, subject_code: 'CS3491', staff_name: 'Dr. ABISHA MANO' }, // ESIoT
            { day: 'Tuesday', period: 2, subject_code: 'CCS337', staff_name: 'Mrs. ANTO BABIYOLA' }, // CSM
            { day: 'Tuesday', period: 3, subject_code: 'CCS356', staff_name: 'Mrs. SHEEBA D' }, // OOSE LAB
            { day: 'Tuesday', period: 4, subject_code: 'CCS356', staff_name: 'Mrs. SHEEBA D' }, // OOSE LAB
            { day: 'Tuesday', period: 5, subject_code: 'OBT352', staff_name: 'Mrs. ARUN VENKADESH' }, // FOOD
            { day: 'Tuesday', period: 6, subject_code: 'CCS336', staff_name: 'Mrs. BINISHA' }, // STA
            { day: 'Tuesday', period: 7, subject_code: 'CS3491', staff_name: 'Dr. ABISHA MANO' }, // ESIoT Lab
            { day: 'Tuesday', period: 8, subject_code: 'CS3491', staff_name: 'Dr. ABISHA MANO' }, // ESIoT Lab

            // Wednesday
            { day: 'Wednesday', period: 1, subject_code: 'CCS336', staff_name: 'Mrs. BINISHA' }, // STA
            { day: 'Wednesday', period: 2, subject_code: 'CCS354', staff_name: 'Mrs. RAJA KALA' }, // NS
            { day: 'Wednesday', period: 3, subject_code: 'CCS336', staff_name: 'Mrs. BINISHA' }, // STA
            { day: 'Wednesday', period: 4, subject_code: 'CS3491', staff_name: 'Dr. ABISHA MANO' }, // ESIoT
            { day: 'Wednesday', period: 5, subject_code: 'OBT352', staff_name: 'Mrs. ARUN VENKADESH' }, // FOOD
            { day: 'Wednesday', period: 6, subject_code: 'CCS356', staff_name: 'Mrs. SHEEBA D' }, // OOSE
            { day: 'Wednesday', period: 7, subject_code: 'CCS354', staff_name: 'Raju' }, // NS (Raju)
            { day: 'Wednesday', period: 8, subject_code: 'CCS337', staff_name: 'Munir' }, // CSM (Munir)

            // Thursday
            { day: 'Thursday', period: 1, subject_code: 'CCS337', staff_name: 'Mrs. ANTO BABIYOLA' }, // CSM
            { day: 'Thursday', period: 2, subject_code: 'CS3491', staff_name: 'Dr. ABISHA MANO' }, // ESIoT
            { day: 'Thursday', period: 3, subject_code: 'CCS336', staff_name: 'Mrs. BINISHA' }, // STA LAB
            { day: 'Thursday', period: 4, subject_code: 'CCS336', staff_name: 'Mrs. BINISHA' }, // STA LAB
            { day: 'Thursday', period: 5, subject_code: 'CCS356', staff_name: 'Mrs. SHEEBA D' }, // OOSE
            { day: 'Thursday', period: 6, subject_code: 'SS001', staff_name: 'Dr. Bobby Denis' }, // Softskill
            { day: 'Thursday', period: 7, subject_code: 'CCS337', staff_name: 'Mrs. ANTO BABIYOLA' }, // CSM
            { day: 'Thursday', period: 8, subject_code: 'CCS356', staff_name: 'Mrs. SHEEBA D' }, // OOSE

            // Friday
            { day: 'Friday', period: 1, subject_code: 'CCS354', staff_name: 'Mrs. RAJA KALA' }, // NS
            { day: 'Friday', period: 2, subject_code: 'CS3491', staff_name: 'Dr. ABISHA MANO' }, // ESIoT
            { day: 'Friday', period: 3, subject_code: 'CCS338', staff_name: 'Mrs. ARUN VENKADESH' }, // CSM LAB
            { day: 'Friday', period: 4, subject_code: 'CCS338', staff_name: 'Mrs. ARUN VENKADESH' }, // CSM LAB
            { day: 'Friday', period: 5, subject_code: 'CCS354', staff_name: 'Mrs. RAJA KALA' }, // NS
            { day: 'Friday', period: 6, subject_code: 'CCS336', staff_name: 'Mrs. BINISHA' }, // STA
            { day: 'Friday', period: 7, subject_code: 'CCS356', staff_name: 'Mrs. SHEEBA D' }, // OOSE
            { day: 'Friday', period: 8, subject_code: 'CCS337', staff_name: 'Mrs. ANTO BABIYOLA' }  // CSM
        ];

        // Insert timetable entries
        for (const entry of timetableData) {
            const subjectId = subjectMap[entry.subject_code];
            const staffId = staffMap[entry.staff_name];
            
            if (subjectId && staffId) {
                await db.query(`
                    INSERT INTO timetable (year, section, day, period, subject_id, staff_id) 
                    VALUES (3, 'B', $1, $2, $3, $4)
                `, [entry.day, entry.period, subjectId, staffId]);
                
                console.log(`✓ Added: ${entry.day} Period ${entry.period} - ${entry.subject_code} by ${entry.staff_name}`);
            } else {
                console.log(`⚠ Missing mapping for: ${entry.subject_code} or ${entry.staff_name}`);
            }
        }

        console.log("3rd Year B Section timetable populated successfully!");

    } catch (error) {
        console.error("Error adding data:", error);
    } finally {
        process.exit(0);
    }
}

add3rdYearBData();
