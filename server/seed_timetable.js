
const db = require('./db');
require('dotenv').config();

const seed = async () => {
    try {
        console.log("Seeding Timetable Data for CSE 3rd Year A Section...");

        // 1. Insert Staff
        const staffList = [
            { staff_id: 'S001', name: 'Mrs. Binisha', designation: 'AP', email: 'binisha@dmi.edu' },
            { staff_id: 'S002', name: 'Mrs. Anto Babiyola', designation: 'AP', email: 'anto@dmi.edu' },
            { staff_id: 'S003', name: 'Mrs. Arun Venkadesh', designation: 'AP', email: 'arun@dmi.edu' },
            { staff_id: 'S004', name: 'Mrs. Raja Kala', designation: 'AP', email: 'raja@dmi.edu' },
            { staff_id: 'S005', name: 'Dr. Abisha Mano', designation: 'AP', email: 'abisha@dmi.edu' },
            { staff_id: 'S006', name: 'Mrs. Sheeba D', designation: 'AP', email: 'sheeba@dmi.edu' },
            { staff_id: 'S007', name: 'Dr. Bobby Denis', designation: 'AP', email: 'bobby@dmi.edu' }
        ];

        for (const s of staffList) {
            // Upsert Staff
            await db.query(`
                INSERT INTO staff (staff_id, name, designation, department, email) 
                VALUES ($1, $2, $3, 'CSE', $4) 
                ON CONFLICT (staff_id) DO NOTHING
            `, [s.staff_id, s.name, s.designation, s.email]);
        }
        console.log("Staff Seeded.");

        // Fetch Staff IDs
        const staffRes = await db.query("SELECT id, name FROM staff");
        const staffMap = {};
        staffRes.rows.forEach(r => staffMap[r.name] = r.id);

        // 2. Insert Subjects
        const subjectsList = [
            { code: 'CCS336-STA', name: 'Software Testing & Automation' },
            { code: 'CCS336-CSM', name: 'Cloud Service Management' },
            { code: 'OBT352', name: 'Food Nutrients & Health' },
            { code: 'CCS354', name: 'Network Security' },
            { code: 'CS3491', name: 'Embedded Systems & IoT' },
            { code: 'CCS356', name: 'Obj Oriented SW Engg' },
            { code: 'NM', name: 'Naan Mudhalvan' },
            { code: 'SS', name: 'Soft Skills' },
            { code: 'NPTEL', name: 'NPTEL' },
            { code: 'LAB', name: 'Laboratory' }
        ];

        for (const s of subjectsList) {
            await db.query(`
                INSERT INTO subjects (subject_code, subject_name, semester) 
                VALUES ($1, $2, 6) 
                ON CONFLICT (subject_code) DO NOTHING
            `, [s.code, s.name]);
        }
        console.log("Subjects Seeded.");

        // Fetch Subject IDs
        const subRes = await db.query("SELECT id, subject_code FROM subjects");
        const subMap = {};
        subRes.rows.forEach(r => subMap[r.subject_code] = r.id);

        // 3. Clear Existing Timetable for 3-A
        await db.query("DELETE FROM timetable WHERE year = 3 AND section = 'A'");

        // 4. Insert Entries
        // Helper
        const add = async (day, period, subCode, staffName) => {
            const subId = subMap[subCode];
            let sName = staffName;

            // Map inconsistent names
            if (sName === 'Mrs. Sheeba') sName = 'Mrs. Sheeba D';

            const staffId = staffMap[sName];

            if (!subId) console.log(`Missing Subject: ${subCode}`);
            if (!staffId) console.log(`Missing Staff: ${sName}`);

            if (subId && staffId) {
                await db.query(`
                    INSERT INTO timetable (year, section, day, period, subject_id, staff_id)
                    VALUES (3, 'A', $1, $2, $3, $4)
                 `, [day, period, subId, staffId]);
            }
        };

        // MONDAY
        await add('Monday', 1, 'CCS336-STA', 'Mrs. Binisha');
        await add('Monday', 2, 'CCS354', 'Mrs. Raja Kala');
        await add('Monday', 3, 'CCS336_LAB', 'Mrs. Binisha'); // Lab - Software Testing
        await add('Monday', 4, 'CCS336_LAB', 'Mrs. Binisha'); // Lab
        await add('Monday', 5, 'OBT352', 'Mrs. Arun Venkadesh');
        await add('Monday', 6, 'NM_LAB', 'Mrs. Sheeba D');
        await add('Monday', 7, 'NM_LAB', 'Mrs. Sheeba D');
        await add('Monday', 8, 'NM_LAB', 'Mrs. Sheeba D');

        // TUESDAY
        await add('Tuesday', 1, 'CS3491', 'Dr. Abisha Mano');
        await add('Tuesday', 2, 'CCS356', 'Mrs. Sheeba D');
        await add('Tuesday', 3, 'CCS336-STA', 'Mrs. Binisha');
        await add('Tuesday', 4, 'SOFTSKILL', 'Dr. Bobby Denis');
        await add('Tuesday', 5, 'CCS354', 'Mrs. Raja Kala');
        await add('Tuesday', 6, 'CCS336-CSM', 'Mrs. Anto Babiyola');
        await add('Tuesday', 7, 'CCS356', 'Mrs. Sheeba D');
        await add('Tuesday', 8, 'CS3491', 'Dr. Abisha Mano');

        // WEDNESDAY
        await add('Wednesday', 1, 'CCS354', 'Mrs. Raja Kala');
        await add('Wednesday', 2, 'CCS336-CSM', 'Mrs. Anto Babiyola');
        await add('Wednesday', 3, 'CCS356_LAB', 'Mrs. Sheeba D'); // Lab - OOSE
        await add('Wednesday', 4, 'CCS356_LAB', 'Mrs. Sheeba D'); // Lab
        await add('Wednesday', 5, 'CS3491', 'Dr. Abisha Mano');
        await add('Wednesday', 6, 'CCS336-STA', 'Mrs. Binisha');
        await add('Wednesday', 7, 'NM_LAB', 'Mrs. Raja Kala');
        await add('Wednesday', 8, 'NPTEL', 'Mrs. Anto Babiyola');

        // THURSDAY
        await add('Thursday', 1, 'OBT352', 'Mrs. Arun Venkadesh');
        await add('Thursday', 2, 'CCS354', 'Mrs. Raja Kala');
        await add('Thursday', 3, 'CS3691_LAB', 'Dr. Abisha Mano'); // Lab - Embedded/IoT
        await add('Thursday', 4, 'CS3691_LAB', 'Dr. Abisha Mano'); // Lab
        await add('Thursday', 5, 'CCS336-CSM', 'Mrs. Anto Babiyola');
        await add('Thursday', 6, 'OBT352', 'Mrs. Arun Venkadesh');
        await add('Thursday', 7, 'CS3491', 'Dr. Abisha Mano');
        await add('Thursday', 8, 'CCS356', 'Mrs. Sheeba D');

        // FRIDAY
        await add('Friday', 1, 'CCS356', 'Mrs. Sheeba D');
        await add('Friday', 2, 'CCS336-STA', 'Mrs. Binisha');
        await add('Friday', 3, 'CCS354_LAB', 'Mrs. Raja Kala'); // Lab - Security
        await add('Friday', 4, 'CCS354_LAB', 'Mrs. Raja Kala'); // Lab
        await add('Friday', 5, 'CCS336_LAB', 'Mrs. Anto Babiyola'); // Lab - Testing/Cloud? Using Testing code fallback
        await add('Friday', 6, 'CCS336_LAB', 'Mrs. Anto Babiyola'); // Lab
        await add('Friday', 7, 'CCS336-CSM', 'Mrs. Anto Babiyola');
        await add('Friday', 8, 'OBT352', 'Mrs. Arun Venkadesh');

        console.log("Timetable Seeded Successfully!");
        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
