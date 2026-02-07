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
        const getStaffId = async (name) => {
            const res = await pool.query("SELECT id FROM staff WHERE name ILIKE $1", [`%${name}%`]);
            return res.rows[0]?.id || null;
        };
        const getSubjectId = async (code) => {
            const res = await pool.query("SELECT id FROM subjects WHERE subject_code = $1", [code]);
            return res.rows[0]?.id || null;
        };

        const upsertSlot = async (year, section, day, period, subjectCode, staffName) => {
            const sId = await getSubjectId(subjectCode);
            const stId = await getStaffId(staffName);
            if (!sId) {
                console.log(`Missing subject: ${subjectCode}`);
                return;
            }
            await pool.query(`
                INSERT INTO timetable (year, section, day, period, subject_id, staff_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (year, section, day, period) 
                DO UPDATE SET subject_id = EXCLUDED.subject_id, staff_id = EXCLUDED.staff_id
            `, [year, section, day, period, sId, stId]);
        };

        console.log("Starting Timetable Population...");

        // --- YEAR 2 SEC A ---
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

        // --- YEAR 2 SEC B ---
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

        // --- YEAR 3 SEC A ---
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

        // --- YEAR 3 SEC B ---
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

        console.log("Timetable Population Success!");
    } catch (err) {
        console.error("FATAL ERROR:", err.message);
    } finally {
        pool.end();
    }
}
run();
