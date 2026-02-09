const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        }
        : {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME
        }
);

async function synchronizeTimetable() {
    try {
        console.log("Starting Timetable Synchronization...");

        // 1. Ensure Subjects exist
        const subjects = [
            // Sem 4 (Year 2)
            { code: 'CS3451', name: 'Introduction to Operating System', sem: 4 },
            { code: 'CS3491', name: 'Artificial Intelligence and Machine Learning', sem: 4 },
            { code: 'CS3452', name: 'Theory of Computation', sem: 4 },
            { code: 'CS3401', name: 'Algorithms', sem: 4 },
            { code: 'CS3492', name: 'Database Management System', sem: 4 },
            { code: 'GE3451', name: 'Environmental Sciences and Sustainability', sem: 4 },
            { code: 'NM', name: 'Naan Mudhalvan', sem: 4 },
            { code: 'CS3481', name: 'DATABASE MANAGEMENT SYSTEM LABORATORY', sem: 4 },
            { code: 'CS3461', name: 'OPERATING SYSTEMS LABORATORY', sem: 4 },
            { code: 'CS3401_LAB', name: 'ALGORITHMS LABORATORY', sem: 4 },
            { code: 'CS3491_LAB', name: 'AIML Laboratory', sem: 4 },
            { code: 'SOFTSKILL', name: 'Softskill Training', sem: 4 },
            { code: 'NPTEL', name: 'NPTEL', sem: 4 },

            // Sem 6 (Year 3)
            { code: 'CCS336_STA', name: 'Software Testing and Automation', sem: 6 },
            { code: 'CCS336_CSM', name: 'Cloud Service Management', sem: 6 },
            { code: 'CCS336_IAB', name: 'Cloud Service Management IAB', sem: 6 },
            { code: 'OBT352', name: 'Food Nutrients and Health', sem: 6 },
            { code: 'CCS354', name: 'Network Security', sem: 6 },
            { code: 'CS3691_ESI', name: 'Embedded Systems and IOT', sem: 6 },
            { code: 'CCS356', name: 'Object Oriented Software Engineering', sem: 6 },
            { code: 'NM_S6', name: 'Naan Mudhalvan', sem: 6 },
            { code: 'CCS336_LAB', name: 'Software Testing Laboratory', sem: 6 },
            { code: 'CCS356_LAB', name: 'Object Oriented Software Engineering Laboratory', sem: 6 },
            { code: 'CCS354_LAB', name: 'Network Security Laboratory', sem: 6 },
            { code: 'CS3691_LAB', name: 'Embedded Systems and IOT Laboratory', sem: 6 },
            { code: 'NM_LAB', name: 'Naan Mudhalvan Lab', sem: 6 },
            { code: 'HACKATHON', name: 'Hackathon', sem: 6 },
            { code: 'NPTEL_S6', name: 'NPTEL', sem: 6 },
            { code: 'SS_S6', name: 'Softskill I', sem: 6 }
        ];

        for (const s of subjects) {
            await pool.query(`
                INSERT INTO subjects (subject_code, subject_name, semester) 
                VALUES ($1, $2, $3) 
                ON CONFLICT (subject_code) DO UPDATE SET subject_name = EXCLUDED.subject_name, semester = EXCLUDED.semester
            `, [s.code, s.name, s.sem]);
        }
        console.log("Subjects Synced.");

        // 2. Clear Existing Timetable for Year 2 and Year 3 Section A
        await pool.query("DELETE FROM timetable WHERE (year = 2 OR year = 3) AND section = 'A'");
        console.log("Timetable cleared for 2A and 3A.");

        // Utility to add timetable entry
        const addEntry = async (year, section, day, period, subCode, staffId) => {
            const subRes = await pool.query("SELECT id FROM subjects WHERE subject_code = $1", [subCode]);
            if (subRes.rows.length === 0) {
                console.error(`Subject not found: ${subCode}`);
                return;
            }
            const subId = subRes.rows[0].id;
            await pool.query(`
                INSERT INTO timetable (year, section, day, period, subject_id, staff_id)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [year, section, day, period, subId, staffId]);
        };

        // Staff IDs (from previous fetch)
        // FAC010 Mr. ARUN VENKADESH
        // FAC026 Mrs. STEPHY CHRISTINA
        // FAC029 Mrs. RAJU
        // FAC022 Mrs. SAHAYA REEMA
        // FAC020 Mrs. MONISHA RAJU
        // FAC004 Dr. JOHNCY ROSE
        // FAC018 Mrs. DHANYA RAJU
        // FAC024 Mrs. SINDHU
        // FAC019 Mrs. JENET RAJEE
        // FAC013 Dr.Bobby Denis -> wait, let me check FAC list again.

        const getStaffId = async (namePart) => {
            const res = await pool.query("SELECT id, staff_id FROM staff WHERE name ILIKE $1", [`%${namePart}%`]);
            return res.rows[0]?.id;
        };

        const STAFF = {
            ARUN: await getStaffId('ARUN VENKADESH'),
            STEPHY: await getStaffId('STEPHY CHRISTINA'),
            RAJU: await getStaffId('Mrs. RAJU'),
            SAHAYA: await getStaffId('SAHAYA REEMA'),
            MONISHA: await getStaffId('MONISHA RAJU'),
            JOHNCY: await getStaffId('JOHNCY ROSE'),
            DHANYA: await getStaffId('DHANYA RAJU'),
            SINDHU: await getStaffId('SINDHU'),
            JENET: await getStaffId('JENET RAJEE'),
            BOBBY: await getStaffId('Bobby Denis'),
            BINISHA: await getStaffId('Binisha'),
            RAJA_KALA: await getStaffId('RAJA KALA'),
            SHEEBA: await getStaffId('SHEEBA'),
            ABISHA: await getStaffId('ABISHA MANO'),
            ANTO: await getStaffId('ANTO BABIYOLA')
        };

        // --- YEAR 2 SECTION A (SEM 4) ---
        console.log("Seeding Year 2A...");
        // Monday
        await addEntry(2, 'A', 'Monday', 1, 'CS3451', STAFF.RAJU);
        await addEntry(2, 'A', 'Monday', 2, 'CS3491', STAFF.STEPHY);
        await addEntry(2, 'A', 'Monday', 4, 'CS3452', STAFF.ARUN);
        await addEntry(2, 'A', 'Monday', 5, 'CS3492', STAFF.MONISHA);
        await addEntry(2, 'A', 'Monday', 7, 'CS3491_LAB', STAFF.STEPHY);
        await addEntry(2, 'A', 'Monday', 8, 'CS3491_LAB', STAFF.STEPHY);
        await addEntry(2, 'A', 'Monday', 10, 'CS3452', STAFF.ARUN);
        await addEntry(2, 'A', 'Monday', 11, 'CS3492', STAFF.MONISHA);

        // Tuesday
        await addEntry(2, 'A', 'Tuesday', 1, 'CS3452', STAFF.ARUN);
        await addEntry(2, 'A', 'Tuesday', 2, 'NM', STAFF.DHANYA);
        await addEntry(2, 'A', 'Tuesday', 3, 'NM', STAFF.DHANYA);
        await addEntry(2, 'A', 'Tuesday', 4, 'NM', STAFF.DHANYA);
        await addEntry(2, 'A', 'Tuesday', 5, 'NM', STAFF.DHANYA);
        await addEntry(2, 'A', 'Tuesday', 7, 'CS3401', STAFF.SAHAYA);
        await addEntry(2, 'A', 'Tuesday', 8, 'CS3461', STAFF.RAJU);
        await addEntry(2, 'A', 'Tuesday', 9, 'CS3461', STAFF.RAJU);
        await addEntry(2, 'A', 'Tuesday', 10, 'CS3461', STAFF.RAJU);
        await addEntry(2, 'A', 'Tuesday', 11, 'CS3461', STAFF.RAJU);

        // Wednesday
        await addEntry(2, 'A', 'Wednesday', 1, 'CS3491', STAFF.STEPHY);
        await addEntry(2, 'A', 'Wednesday', 2, 'CS3401', STAFF.SAHAYA);
        await addEntry(2, 'A', 'Wednesday', 4, 'CS3451', STAFF.RAJU);
        await addEntry(2, 'A', 'Wednesday', 5, 'CS3452', STAFF.ARUN);
        await addEntry(2, 'A', 'Wednesday', 7, 'NPTEL', STAFF.STEPHY); // Guessing staff
        await addEntry(2, 'A', 'Wednesday', 8, 'CS3481', STAFF.MONISHA);
        await addEntry(2, 'A', 'Wednesday', 9, 'CS3481', STAFF.MONISHA);
        await addEntry(2, 'A', 'Wednesday', 10, 'CS3481', STAFF.MONISHA);
        await addEntry(2, 'A', 'Wednesday', 11, 'CS3481', STAFF.MONISHA);

        // Thursday
        await addEntry(2, 'A', 'Thursday', 1, 'CS3401', STAFF.SAHAYA);
        await addEntry(2, 'A', 'Thursday', 2, 'GE3451', STAFF.JOHNCY);
        await addEntry(2, 'A', 'Thursday', 4, 'CS3451', STAFF.RAJU);
        await addEntry(2, 'A', 'Thursday', 5, 'CS3492', STAFF.MONISHA);
        await addEntry(2, 'A', 'Thursday', 7, 'CS3401_LAB', STAFF.SAHAYA);
        await addEntry(2, 'A', 'Thursday', 8, 'CS3401_LAB', STAFF.SAHAYA);
        await addEntry(2, 'A', 'Thursday', 10, 'CS3492', STAFF.MONISHA);
        await addEntry(2, 'A', 'Thursday', 11, 'CS3491', STAFF.STEPHY);

        // Friday
        await addEntry(2, 'A', 'Friday', 1, 'CS3492', STAFF.MONISHA);
        await addEntry(2, 'A', 'Friday', 2, 'CS3452', STAFF.ARUN);
        await addEntry(2, 'A', 'Friday', 4, 'CS3491', STAFF.STEPHY);
        await addEntry(2, 'A', 'Friday', 5, 'CS3451', STAFF.RAJU);
        await addEntry(2, 'A', 'Friday', 7, 'CS3401', STAFF.SAHAYA);
        await addEntry(2, 'A', 'Friday', 8, 'GE3451', STAFF.JOHNCY);
        await addEntry(2, 'A', 'Friday', 10, 'CS3451', STAFF.RAJU);
        await addEntry(2, 'A', 'Friday', 11, 'SOFTSKILL', STAFF.BOBBY);

        // --- YEAR 3 SECTION A (SEM 6) ---
        console.log("Seeding Year 3A...");
        // Monday
        await addEntry(3, 'A', 'Monday', 1, 'CCS336_STA', STAFF.BINISHA);
        await addEntry(3, 'A', 'Monday', 2, 'CCS354', STAFF.RAJA_KALA);
        await addEntry(3, 'A', 'Monday', 4, 'CCS336_LAB', STAFF.BINISHA);
        await addEntry(3, 'A', 'Monday', 5, 'CCS336_LAB', STAFF.BINISHA);
        await addEntry(3, 'A', 'Monday', 7, 'OBT352', STAFF.ARUN);
        await addEntry(3, 'A', 'Monday', 8, 'NM_S6', STAFF.SHEEBA);
        await addEntry(3, 'A', 'Monday', 9, 'NM_S6', STAFF.SHEEBA);
        await addEntry(3, 'A', 'Monday', 10, 'NM_S6', STAFF.SHEEBA);
        await addEntry(3, 'A', 'Monday', 11, 'NM_S6', STAFF.SHEEBA);

        // Tuesday
        await addEntry(3, 'A', 'Tuesday', 1, 'CS3691_ESI', STAFF.ABISHA);
        await addEntry(3, 'A', 'Tuesday', 2, 'CCS356', STAFF.SHEEBA);
        await addEntry(3, 'A', 'Tuesday', 4, 'CCS336_STA', STAFF.BINISHA);
        await addEntry(3, 'A', 'Tuesday', 5, 'SS_S6', STAFF.BOBBY);
        await addEntry(3, 'A', 'Tuesday', 7, 'CCS354', STAFF.RAJA_KALA);
        await addEntry(3, 'A', 'Tuesday', 8, 'CCS336_CSM', STAFF.ANTO);
        await addEntry(3, 'A', 'Tuesday', 10, 'CCS356', STAFF.SHEEBA);
        await addEntry(3, 'A', 'Tuesday', 11, 'CS3691_ESI', STAFF.ABISHA);

        // Wednesday
        await addEntry(3, 'A', 'Wednesday', 1, 'CCS354', STAFF.RAJA_KALA);
        await addEntry(3, 'A', 'Wednesday', 2, 'CCS336_CSM', STAFF.ANTO);
        await addEntry(3, 'A', 'Wednesday', 4, 'CCS356_LAB', STAFF.SHEEBA);
        await addEntry(3, 'A', 'Wednesday', 5, 'CCS356_LAB', STAFF.SHEEBA);
        await addEntry(3, 'A', 'Wednesday', 7, 'CS3691_ESI', STAFF.ABISHA);
        await addEntry(3, 'A', 'Wednesday', 8, 'CCS336_STA', STAFF.BINISHA);
        await addEntry(3, 'A', 'Wednesday', 10, 'HACKATHON', STAFF.RAJA_KALA);
        await addEntry(3, 'A', 'Wednesday', 11, 'NPTEL_S6', STAFF.STEPHY);

        // Thursday
        await addEntry(3, 'A', 'Thursday', 1, 'OBT352', STAFF.ARUN);
        await addEntry(3, 'A', 'Thursday', 2, 'OBT352', STAFF.ARUN);
        await addEntry(3, 'A', 'Thursday', 4, 'CCS354', STAFF.RAJA_KALA);
        await addEntry(3, 'A', 'Thursday', 5, 'CS3691_LAB', STAFF.ABISHA);
        await addEntry(3, 'A', 'Thursday', 7, 'CCS336_CSM', STAFF.ANTO);
        await addEntry(3, 'A', 'Thursday', 8, 'OBT352', STAFF.ARUN);
        await addEntry(3, 'A', 'Thursday', 10, 'CS3691_ESI', STAFF.ABISHA);
        await addEntry(3, 'A', 'Thursday', 11, 'CCS356', STAFF.SHEEBA);

        // Friday
        await addEntry(3, 'A', 'Friday', 1, 'CCS356', STAFF.SHEEBA);
        await addEntry(3, 'A', 'Friday', 2, 'CCS336_STA', STAFF.BINISHA);
        await addEntry(3, 'A', 'Friday', 4, 'CCS354_LAB', STAFF.RAJA_KALA);
        await addEntry(3, 'A', 'Friday', 5, 'CCS354_LAB', STAFF.RAJA_KALA);
        await addEntry(3, 'A', 'Friday', 7, 'CCS336_IAB', STAFF.ARUN);
        await addEntry(3, 'A', 'Friday', 8, 'CCS336_IAB', STAFF.ARUN);
        await addEntry(3, 'A', 'Friday', 10, 'CCS336_CSM', STAFF.ANTO);
        await addEntry(3, 'A', 'Friday', 11, 'OBT352', STAFF.ARUN);

        console.log("Timetable Seeding Complete!");

    } catch (err) {
        console.error("Critical Failure:", err);
    } finally {
        pool.end();
    }
}

synchronizeTimetable();
