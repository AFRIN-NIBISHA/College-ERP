const db = require('./db');

async function add2ndYearData() {
    try {
        console.log("Adding 2nd Year A Section subjects and staff...");

        // Add subjects from the timetable
        const subjects = [
            { code: 'CS3451', name: 'INTRODUCTION TO OPERATING SYSTEM', semester: 4, credits: 3 },
            { code: 'CS3491', name: 'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING', semester: 4, credits: 4 },
            { code: 'CS3452', name: 'THEORY OF COMPUTATION', semester: 4, credits: 3 },
            { code: 'CS3492', name: 'DATABASE MANAGEMENT SYSTEMS', semester: 4, credits: 4 },
            { code: 'CS3401', name: 'ALGORITHMS', semester: 4, credits: 4 },
            { code: 'GE3451', name: 'ENVIRONMENTAL SCIENCE', semester: 4, credits: 3 },
            { code: 'CS3461', name: 'OPERATING SYSTEM LAB', semester: 4, credits: 2 },
            { code: 'CS3481', name: 'DATABASE MANAGEMENT SYSTEMS LAB', semester: 4, credits: 2 },
            { code: 'CS3402', name: 'ALGORITHMS LAB', semester: 4, credits: 2 },
            { code: 'NM002', name: 'NAAN MUTHALVAN', semester: 4, credits: 1 },
            { code: 'NP001', name: 'NPTEL - DBMS', semester: 4, credits: 1 },
            { code: 'SS002', name: 'SOFTSKILL', semester: 4, credits: 1 }
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
            { staff_id: 'STF009', name: 'Mr. ARUN VENKADESH', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF010', name: 'Mrs. STEPHY CHRISTINA', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF011', name: 'Mrs. RAJU', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF012', name: 'Mrs. ALG Staff', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF013', name: 'EVS Staff', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF014', name: 'NPTEL Coordinator', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF015', name: 'Softskill Trainer', designation: 'Assistant Professor', department: 'CSE' }
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

        console.log("2nd Year A Section subjects and staff added successfully!");
        
        // Get the IDs for timetable creation
        const subjectResult = await db.query('SELECT id, subject_code FROM subjects WHERE subject_code IN ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', 
            ['CS3451', 'CS3491', 'CS3452', 'CS3492', 'CS3401', 'GE3451', 'CS3461', 'CS3481', 'CS3402', 'NM002', 'NP001', 'SS002']);
        
        const staffResult = await db.query('SELECT id, name FROM staff WHERE name IN ($1, $2, $3, $4, $5, $6, $7)', 
            ['Mr. ARUN VENKADESH', 'Mrs. STEPHY CHRISTINA', 'Mrs. RAJU', 'Mrs. ALG Staff', 'EVS Staff', 'NPTEL Coordinator', 'Softskill Trainer']);

        console.log("Subject IDs:", subjectResult.rows);
        console.log("Staff IDs:", staffResult.rows);

    } catch (error) {
        console.error("Error adding data:", error);
    } finally {
        process.exit(0);
    }
}

add2ndYearData();
