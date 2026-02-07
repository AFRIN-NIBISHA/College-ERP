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
            await pool.query("INSERT INTO staff (staff_id, name, department) VALUES ($1, $2, 'CSE') ON CONFLICT (staff_id) DO UPDATE SET name = EXCLUDED.name", [sid, name]);
        }

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
            await pool.query("INSERT INTO subjects (subject_code, subject_name, semester) VALUES ($1, $2, $3) ON CONFLICT (subject_code) DO UPDATE SET subject_name = EXCLUDED.subject_name", [s.code, s.name, s.sem]);
        }
        console.log("Chunk 1 Done.");
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
run();
