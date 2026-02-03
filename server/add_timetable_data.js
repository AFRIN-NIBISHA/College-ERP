const db = require('./db');

async function addTimetableData() {
    try {
        console.log("Adding subjects and staff for 3rd Year A Section...");

        // Add subjects from the timetable
        const subjects = [
            { code: 'CCS336', name: 'SOFTWARE TESTING AND AUTOMATION', semester: 6, credits: 4 },
            { code: 'CCS337', name: 'CLOUD SERVICE MANAGEMENT', semester: 6, credits: 4 },
            { code: 'CCS338', name: 'CLOUD SERVICE MANAGEMENT LAB', semester: 6, credits: 4 },
            { code: 'OBT352', name: 'FOOD NUTRIENTS AND HEALTH', semester: 6, credits: 3 },
            { code: 'CCS354', name: 'NETWORK SECURITY', semester: 6, credits: 4 },
            { code: 'CS3491', name: 'EMBEDDED SYSTEMS AND IOT', semester: 6, credits: 4 },
            { code: 'CCS356', name: 'OBJECT ORIENTED SOFTWARE ENGINEERING', semester: 6, credits: 4 },
            { code: 'NM001', name: 'NUMERICAL METHODS', semester: 6, credits: 3 },
            { code: 'SS001', name: 'SOFTSKILL TRAINING', semester: 6, credits: 2 }
        ];

        for (const subject of subjects) {
            try {
                await db.query(
                    'INSERT INTO subjects (subject_code, subject_name, semester, credits) VALUES ($1, $2, $3, $4) ON CONFLICT (subject_code) DO NOTHING',
                    [subject.code, subject.name, subject.semester, subject.credits]
                );
                console.log(`✓ Added subject: ${subject.code} - ${subject.name}`);
            } catch (err) {
                console.log(`⚠ Subject ${subject.code} might already exist`);
            }
        }

        // Add staff members
        const staff = [
            { staff_id: 'STF001', name: 'Mrs. BINISHA', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF002', name: 'Mrs. ANTO BABIYOLA', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF003', name: 'Mrs. ARUN VENKADESH', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF004', name: 'Mrs. RAJA KALA', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF005', name: 'Dr. ABISHA MANO', designation: 'Associate Professor', department: 'CSE' },
            { staff_id: 'STF006', name: 'Mrs. SHEEBA D', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF007', name: 'Mrs. SHEEBA', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF008', name: 'Dr. Bobby Denis', designation: 'Assistant Professor', department: 'CSE' }
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

        console.log("Subjects and staff added successfully!");
        
        // Get the IDs for timetable creation
        const subjectResult = await db.query('SELECT id, subject_code FROM subjects WHERE subject_code IN ($1, $2, $3, $4, $5, $6, $7, $8, $9)', 
            ['CCS336', 'CCS337', 'CCS338', 'OBT352', 'CCS354', 'CS3491', 'CCS356', 'NM001', 'SS001']);
        
        const staffResult = await db.query('SELECT id, name FROM staff WHERE name IN ($1, $2, $3, $4, $5, $6, $7, $8)', 
            ['Mrs. BINISHA', 'Mrs. ANTO BABIYOLA', 'Mrs. ARUN VENKADESH', 'Mrs. RAJA KALA', 'Dr. ABISHA MANO', 'Mrs. SHEEBA D', 'Mrs. SHEEBA', 'Dr. Bobby Denis']);

        console.log("Subject IDs:", subjectResult.rows);
        console.log("Staff IDs:", staffResult.rows);

    } catch (error) {
        console.error("Error adding data:", error);
    } finally {
        process.exit(0);
    }
}

addTimetableData();
