const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function run() {
    try {
        const q = async (name, sql, params) => {
            try {
                return await pool.query(sql, params);
            } catch (err) {
                console.error(`ERROR IN ${name}:`, err.message);
                throw err;
            }
        };

        // --- 1. STAFF ---
        console.log("Updating Staff...");
        const staffData = [
            "Mrs. R. Binisha", "Mr. ARUN VENKADESH", "Mrs. STEPHY CHRISTINA", "Mrs. RAJU",
            "Mrs. SAHAYA REEMA", "Mrs. MONISHA RAJU", "Dr. JOHNCY ROSE", "Mrs. DHANYA RAJ",
            "Mrs. JENET RAJEE", "Mrs. SINDHU", "Dr. Bobby Denis", "Dr. EDWIN ALBERT",
            "Dr. JEBA STARLING", "Dr. A. Ancy Femila", "Mrs. ANTO BABIYOLA", "Mrs. BENILA",
            "Mrs. SHEEBA D", "Mrs. RAJA KALA P", "Dr. ABISHA MANO", "Mrs. SINDU"
        ];

        for (const name of staffData) {
            const sid = name.replace(/[^A-Z0-9]/gi, '');
            await q(`Staff ${name}`, `
                INSERT INTO staff (staff_id, name, department)
                VALUES ($1, $2, 'CSE')
                ON CONFLICT (staff_id) DO UPDATE SET name = EXCLUDED.name
            `, [sid, name]);
        }

        // --- 2. SUBJECTS ---
        console.log("Updating Subjects...");
        const subjectsData = [
            { code: 'CS3452', name: 'Theory of Computation', sem: 4 },
            { code: 'CS3491', name: 'Artificial Intelligence and Machine Learning', sem: 4 },
            { code: 'CS3451', name: 'Introduction to Operating System', sem: 4 },
            { code: 'CS3401', name: 'Algorithms', sem: 4 },
            { code: 'CS3492', name: 'Database Management System', sem: 4 },
            { code: 'GE3451', name: 'Environmental Sciences and Sustainability', sem: 4 },
            { code: 'NM', name: 'Naan Mudhalvan', sem: 4 },
            { code: 'CS3461', name: 'Operating Systems Laboratory', sem: 4 },
            { code: 'CS3481', name: 'Database Management System Laboratory', sem: 4 },
            { code: 'CS3491_LAB', name: 'AIML Lab', sem: 4 },
            { code: 'CS3401_LAB', name: 'Algorithms Lab', sem: 4 },
            { code: 'SOFTSKILL', name: 'Softskill Training', sem: 4 },
            { code: 'CCS336_STA', name: 'Software Testing and Automation', sem: 6 },
            { code: 'CCS336_CSM', name: 'Cloud Service Management', sem: 6 },
            { code: 'OBT352', name: 'Food Nutrients and Health', sem: 6 },
            { code: 'CCS354', name: 'Network Security', sem: 6 },
            { code: 'CS3491_EMB', name: 'Embedded Systems and IOT', sem: 6 },
            { code: 'CCS356', name: 'Object Oriented Software Engineering', sem: 6 },
            { code: 'CCS354_LAB', name: 'Network Security Lab', sem: 6 },
            { code: 'CCS356_LAB', name: 'OOSE Lab', sem: 6 },
            { code: 'CS3691_LAB', name: 'Embedded Systems and IOT Lab', sem: 6 }
        ];

        for (const s of subjectsData) {
            await q(`Subject ${s.code}`, `
                INSERT INTO subjects (subject_code, subject_name, semester)
                VALUES ($1, $2, $3)
                ON CONFLICT (subject_code) DO UPDATE SET subject_name = EXCLUDED.subject_name
            `, [s.code, s.name, s.sem]);
        }

        // --- 3. CLASS DETAILS & IN-CHARGE ---
        console.log("Updating Class Details...");
        const classes = [
            { year: 2, section: 'A', incharge: 'Mrs. R. Binisha', rep: 'Amita Jerine' },
            { year: 2, section: 'B', incharge: 'Mrs. SINDHU', rep: 'Narmatha' },
            { year: 3, section: 'A', incharge: 'Mrs. RAJA KALA P', rep: 'Asha Lidia' },
            { year: 3, section: 'B', incharge: 'Mrs. MONISHA RAJU', rep: 'Sajina' }
        ];

        for (const c of classes) {
            const staffRes = await q(`Lookup Staff for Class ${c.year}${c.section}`, "SELECT id FROM staff WHERE name ILIKE $1", [`%${c.incharge.split(' ').pop()}%`]);
            if (staffRes.rows.length > 0) {
                await q(`Class Details ${c.year}${c.section}`, `
                    INSERT INTO class_details (year, section, staff_id, rep_name)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (year, section) DO UPDATE SET staff_id = EXCLUDED.staff_id, rep_name = EXCLUDED.rep_name
                `, [c.year, c.section, staffRes.rows[0].id, c.rep]);
            }
        }

        // --- 4. TIMETABLE ---
        console.log("Updating Timetables...");
        const getStaffId = async (name) => {
            const res = await q(`Lookup Staff ${name}`, "SELECT id FROM staff WHERE name ILIKE $1", [`%${name}%`]);
            return res.rows[0]?.id || null;
        };
        const getSubjectId = async (code) => {
            const res = await q(`Lookup Subject ${code}`, "SELECT id FROM subjects WHERE subject_code = $1", [code]);
            return res.rows[0]?.id || null;
        };

        const upsertSlot = async (year, section, day, period, subjectCode, staffName) => {
            const sId = await getSubjectId(subjectCode);
            const stId = await getStaffId(staffName);
            if (!sId) return;
            await q(`Timetable ${year} ${section} ${day} ${period}`, `
                INSERT INTO timetable (year, section, day, period, subject_id, staff_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (year, section, day, period) 
                DO UPDATE SET subject_id = EXCLUDED.subject_id, staff_id = EXCLUDED.staff_id
            `, [year, section, day, period, sId, stId]);
        };

        // Y2 Sec A
        const y2a = "A", y2 = 2;
        await upsertSlot(y2, y2a, 'Monday', 1, 'CS3451', 'Raju');
        await upsertSlot(y2, y2a, 'Monday', 2, 'CS3491', 'Christina');
        await upsertSlot(y2, y2a, 'Monday', 3, 'CS3452', 'Arun');
        await upsertSlot(y2, y2a, 'Monday', 4, 'CS3492', 'Monisha');
        await upsertSlot(y2, y2a, 'Monday', 5, 'CS3491_LAB', 'Christina');
        await upsertSlot(y2, y2a, 'Monday', 6, 'CS3491_LAB', 'Christina');
        await upsertSlot(y2, y2a, 'Monday', 7, 'CS3452', 'Arun');
        await upsertSlot(y2, y2a, 'Monday', 8, 'CS3492', 'Monisha');
        await upsertSlot(y2, y2a, 'Tuesday', 1, 'CS3452', 'Arun');
        await upsertSlot(y2, y2a, 'Tuesday', 2, 'NM', 'Dhanya');
        await upsertSlot(y2, y2a, 'Tuesday', 3, 'NM', 'Dhanya');
        await upsertSlot(y2, y2a, 'Tuesday', 4, 'NM', 'Dhanya');
        await upsertSlot(y2, y2a, 'Tuesday', 5, 'CS3401', 'Sahaya');
        await upsertSlot(y2, y2a, 'Tuesday', 6, 'CS3461', 'Raju');
        await upsertSlot(y2, y2a, 'Tuesday', 7, 'CS3461', 'Raju');
        await upsertSlot(y2, y2a, 'Tuesday', 8, 'CS3461', 'Raju');
        await upsertSlot(y2, y2a, 'Wednesday', 1, 'CS3491', 'Christina');
        await upsertSlot(y2, y2a, 'Wednesday', 2, 'CS3401', 'Sahaya');
        await upsertSlot(y2, y2a, 'Wednesday', 3, 'CS3451', 'Raju');
        await upsertSlot(y2, y2a, 'Wednesday', 4, 'CS3452', 'Arun');
        await upsertSlot(y2, y2a, 'Wednesday', 5, 'CS3492', 'Monisha');
        await upsertSlot(y2, y2a, 'Wednesday', 6, 'CS3481', 'Monisha');
        await upsertSlot(y2, y2a, 'Wednesday', 7, 'CS3481', 'Monisha');
        await upsertSlot(y2, y2a, 'Wednesday', 8, 'CS3481', 'Monisha');
        await upsertSlot(y2, y2a, 'Thursday', 1, 'CS3401', 'Sahaya');
        await upsertSlot(y2, y2a, 'Thursday', 2, 'GE3451', 'Rose');
        await upsertSlot(y2, y2a, 'Thursday', 3, 'CS3451', 'Raju');
        await upsertSlot(y2, y2a, 'Thursday', 4, 'CS3492', 'Monisha');
        await upsertSlot(y2, y2a, 'Thursday', 5, 'CS3401_LAB', 'Sahaya');
        await upsertSlot(y2, y2a, 'Thursday', 6, 'CS3401_LAB', 'Sahaya');
        await upsertSlot(y2, y2a, 'Thursday', 7, 'CS3492', 'Monisha');
        await upsertSlot(y2, y2a, 'Thursday', 8, 'CS3491', 'Christina');
        await upsertSlot(y2, y2a, 'Friday', 1, 'CS3492', 'Monisha');
        await upsertSlot(y2, y2a, 'Friday', 2, 'CS3452', 'Arun');
        await upsertSlot(y2, y2a, 'Friday', 3, 'CS3491', 'Christina');
        await upsertSlot(y2, y2a, 'Friday', 4, 'CS3451', 'Raju');
        await upsertSlot(y2, y2a, 'Friday', 5, 'CS3401', 'Sahaya');
        await upsertSlot(y2, y2a, 'Friday', 6, 'GE3451', 'Rose');
        await upsertSlot(y2, y2a, 'Friday', 7, 'CS3451', 'Raju');
        await upsertSlot(y2, y2a, 'Friday', 8, 'SOFTSKILL', 'Bobby');

        // Y2 Sec B
        const y2b = "B";
        await upsertSlot(2, y2b, 'Monday', 1, 'CS3401', 'Sahaya');
        await upsertSlot(2, y2b, 'Monday', 2, 'CS3492', 'Monisha');
        await upsertSlot(2, y2b, 'Monday', 3, 'CS3452', 'Edwin');
        await upsertSlot(2, y2b, 'Monday', 4, 'CS3451', 'Raju');
        await upsertSlot(2, y2b, 'Monday', 5, 'CS3401', 'Sahaya');
        await upsertSlot(2, y2b, 'Monday', 6, 'CS3451', 'Raju');
        await upsertSlot(2, y2b, 'Monday', 7, 'SOFTSKILL', 'Ancy');
        await upsertSlot(2, y2b, 'Monday', 8, 'CS3491', 'Christina');
        await upsertSlot(2, y2b, 'Tuesday', 1, 'CS3452', 'Edwin');
        await upsertSlot(2, y2b, 'Tuesday', 2, 'NM', 'Dhanya');
        await upsertSlot(2, y2b, 'Tuesday', 3, 'NM', 'Dhanya');
        await upsertSlot(2, y2b, 'Tuesday', 4, 'NM', 'Dhanya');
        await upsertSlot(2, y2b, 'Tuesday', 5, 'CS3491_LAB', 'Christina');
        await upsertSlot(2, y2b, 'Tuesday', 6, 'CS3491_LAB', 'Christina');
        await upsertSlot(2, y2b, 'Tuesday', 7, 'CS3452', 'Edwin');
        await upsertSlot(2, y2b, 'Tuesday', 8, 'CS3401', 'Sahaya');
        await upsertSlot(2, y2b, 'Wednesday', 1, 'CS3492', 'Monisha');
        await upsertSlot(2, y2b, 'Wednesday', 2, 'GE3451', 'Starling');
        await upsertSlot(2, y2b, 'Wednesday', 3, 'CS3491', 'Christina');
        await upsertSlot(2, y2b, 'Wednesday', 4, 'CS3492', 'Monisha');
        await upsertSlot(2, y2b, 'Wednesday', 5, 'CS3401_LAB', 'Sahaya');
        await upsertSlot(2, y2b, 'Wednesday', 6, 'CS3401_LAB', 'Sahaya');
        await upsertSlot(2, y2b, 'Wednesday', 7, 'CS3452', 'Edwin');
        await upsertSlot(2, y2b, 'Wednesday', 8, 'CS3492', 'Monisha');
        await upsertSlot(2, y2b, 'Thursday', 1, 'CS3451', 'Raju');
        await upsertSlot(2, y2b, 'Thursday', 2, 'CS3492', 'Monisha');
        await upsertSlot(2, y2b, 'Thursday', 3, 'CS3401', 'Sahaya');
        await upsertSlot(2, y2b, 'Thursday', 4, 'CS3491', 'Christina');
        await upsertSlot(2, y2b, 'Thursday', 5, 'CS3452', 'Edwin');
        await upsertSlot(2, y2b, 'Thursday', 6, 'CS3461', 'Raju');
        await upsertSlot(2, y2b, 'Thursday', 7, 'CS3461', 'Raju');
        await upsertSlot(2, y2b, 'Thursday', 8, 'CS3461', 'Raju');
        await upsertSlot(2, y2b, 'Friday', 1, 'CS3491', 'Christina');
        await upsertSlot(2, y2b, 'Friday', 2, 'CS3451', 'Raju');
        await upsertSlot(2, y2b, 'Friday', 3, 'CS3492', 'Monisha');
        await upsertSlot(2, y2b, 'Friday', 4, 'GE3451', 'Starling');
        await upsertSlot(2, y2b, 'Friday', 5, 'CS3451', 'Raju');
        await upsertSlot(2, y2b, 'Friday', 6, 'CS3481', 'Monisha');
        await upsertSlot(2, y2b, 'Friday', 7, 'CS3481', 'Monisha');
        await upsertSlot(2, y2b, 'Friday', 8, 'CS3481', 'Monisha');

        // Y3 Sec A
        const y3a = "A";
        await upsertSlot(3, y3a, 'Monday', 1, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3a, 'Monday', 2, 'CCS354', 'Kala');
        await upsertSlot(3, y3a, 'Monday', 3, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3a, 'Monday', 4, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3a, 'Monday', 5, 'OBT352', 'Arun');
        await upsertSlot(3, y3a, 'Monday', 6, 'NM', 'Sheeba');
        await upsertSlot(3, y3a, 'Monday', 7, 'NM', 'Sheeba');
        await upsertSlot(3, y3a, 'Monday', 8, 'NM', 'Sheeba');
        await upsertSlot(3, y3a, 'Tuesday', 1, 'CS3691_LAB', 'Abisha');
        await upsertSlot(3, y3a, 'Tuesday', 2, 'CCS356', 'Sheeba');
        await upsertSlot(3, y3a, 'Tuesday', 3, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3a, 'Tuesday', 4, 'SOFTSKILL', 'Bobby');
        await upsertSlot(3, y3a, 'Tuesday', 5, 'CCS354', 'Kala');
        await upsertSlot(3, y3a, 'Tuesday', 6, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3a, 'Tuesday', 7, 'CCS356', 'Sheeba');
        await upsertSlot(3, y3a, 'Tuesday', 8, 'CS3691_LAB', 'Abisha');
        await upsertSlot(3, y3a, 'Wednesday', 1, 'CCS354', 'Kala');
        await upsertSlot(3, y3a, 'Wednesday', 2, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3a, 'Wednesday', 3, 'CCS356_LAB', 'Sheeba');
        await upsertSlot(3, y3a, 'Wednesday', 4, 'CCS356_LAB', 'Sheeba');
        await upsertSlot(3, y3a, 'Wednesday', 5, 'CS3691_LAB', 'Abisha');
        await upsertSlot(3, y3a, 'Wednesday', 6, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3a, 'Thursday', 1, 'OBT352', 'Arun');
        await upsertSlot(3, y3a, 'Thursday', 2, 'CCS354', 'Kala');
        await upsertSlot(3, y3a, 'Thursday', 3, 'CS3691_LAB', 'Abisha');
        await upsertSlot(3, y3a, 'Thursday', 4, 'CS3691_LAB', 'Abisha');
        await upsertSlot(3, y3a, 'Thursday', 5, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3a, 'Thursday', 6, 'OBT352', 'Arun');
        await upsertSlot(3, y3a, 'Thursday', 7, 'CS3691_LAB', 'Abisha');
        await upsertSlot(3, y3a, 'Thursday', 8, 'CCS356', 'Sheeba');
        await upsertSlot(3, y3a, 'Friday', 1, 'CCS356', 'Sheeba');
        await upsertSlot(3, y3a, 'Friday', 2, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3a, 'Friday', 3, 'CCS354_LAB', 'Kala');
        await upsertSlot(3, y3a, 'Friday', 4, 'CCS354_LAB', 'Kala');
        await upsertSlot(3, y3a, 'Friday', 5, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3a, 'Friday', 6, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3a, 'Friday', 7, 'CCS356', 'Sheeba');
        await upsertSlot(3, y3a, 'Friday', 8, 'OBT352', 'Arun');

        // Y3 Sec B
        const y3b = "B";
        await upsertSlot(3, y3b, 'Monday', 1, 'CCS356', 'Sheeba');
        await upsertSlot(3, y3b, 'Monday', 2, 'OBT352', 'Sindu');
        await upsertSlot(3, y3b, 'Monday', 3, 'CCS354_LAB', 'Dhanya');
        await upsertSlot(3, y3b, 'Monday', 4, 'CCS354_LAB', 'Dhanya');
        await upsertSlot(3, y3b, 'Monday', 5, 'OBT352', 'Sindu');
        await upsertSlot(3, y3b, 'Monday', 6, 'NM', 'Sheeba');
        await upsertSlot(3, y3b, 'Monday', 7, 'NM', 'Sheeba');
        await upsertSlot(3, y3b, 'Monday', 8, 'NM', 'Sheeba');
        await upsertSlot(3, y3b, 'Tuesday', 1, 'CS3691_LAB', 'Benila');
        await upsertSlot(3, y3b, 'Tuesday', 2, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3b, 'Tuesday', 3, 'CCS356_LAB', 'Sheeba');
        await upsertSlot(3, y3b, 'Tuesday', 4, 'CCS356_LAB', 'Sheeba');
        await upsertSlot(3, y3b, 'Tuesday', 5, 'OBT352', 'Sindu');
        await upsertSlot(3, y3b, 'Tuesday', 6, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3b, 'Tuesday', 8, 'CS3691_LAB', 'Benila');
        await upsertSlot(3, y3b, 'Wednesday', 1, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3b, 'Wednesday', 2, 'CCS354', 'Dhanya');
        await upsertSlot(3, y3b, 'Wednesday', 3, 'CCS336_CSM', 'Anto');
        await upsertSlot(3, y3b, 'Wednesday', 4, 'CS3691_LAB', 'Benila');
        await upsertSlot(3, y3b, 'Wednesday', 5, 'OBT352', 'Sindu');
        await upsertSlot(3, y3b, 'Wednesday', 6, 'CCS356', 'Sheeba');
        await upsertSlot(3, y3b, 'Wednesday', 7, 'CCS354', 'Dhanya');
        await upsertSlot(3, y3b, 'Thursday', 1, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3b, 'Thursday', 2, 'CS3691_LAB', 'Benila');
        await upsertSlot(3, y3b, 'Thursday', 3, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3b, 'Thursday', 4, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3b, 'Thursday', 5, 'CCS356', 'Sheeba');
        await upsertSlot(3, y3b, 'Thursday', 6, 'SOFTSKILL', 'Bobby');
        await upsertSlot(3, y3b, 'Thursday', 7, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3b, 'Friday', 1, 'CCS354', 'Dhanya');
        await upsertSlot(3, y3b, 'Friday', 2, 'CS3691_LAB', 'Benila');
        await upsertSlot(3, y3b, 'Friday', 3, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3b, 'Friday', 4, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3b, 'Friday', 5, 'CCS354', 'Dhanya');
        await upsertSlot(3, y3b, 'Friday', 6, 'CCS336_STA', 'Binisha');
        await upsertSlot(3, y3b, 'Friday', 7, 'CCS356', 'Sheeba');
        await upsertSlot(3, y3b, 'Friday', 8, 'CCS336_STA', 'Binisha');

        console.log("Database updated successfully!");

    } catch (err) {
        console.error("FATAL ERROR:", err.message);
    } finally {
        pool.end();
    }
}
run();
