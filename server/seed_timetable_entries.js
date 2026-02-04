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

async function seedTimetable() {
    try {
        console.log("Seeding Timetable Entries...");

        // Helpers to get IDs
        const getSub = async (code) => {
            const res = await pool.query("SELECT id FROM subjects WHERE subject_code = $1", [code]);
            return res.rows[0]?.id;
        };
        const getStaff = async (namePart) => {
            // Flexible match
            const res = await pool.query("SELECT id FROM staff WHERE name ILIKE $1", [`%${namePart}%`]);
            return res.rows[0]?.id;
        };

        const year = 3; // III Year
        const sections = ['A', 'B'];

        // Define a schedule template (approximate based on typical load)
        // Subjects:
        // CS3452 (TOC), CS3491 (AIML), CS3451 (OS), CS3401 (ALG), CS3492 (DBMS), GE3451 (EVS)
        // Labs: LAB1 (DBMS), LAB2 (OS), LAB3 (Softskill)

        const schedulePattern = {
            'Monday': ['CS3401', 'CS3492', 'CS3452', 'CS3451', 'LAB1', 'LAB1', 'LAB3', 'CS3491'],
            'Tuesday': ['CS3452', 'NM', 'NM', 'CS3491', 'LAB1', 'NM', 'CS3452', 'CS3401'],
            'Wednesday': ['CS3491', 'GE3451', 'CS3401', 'CS3492', 'LAB2', 'LAB2', 'CS3452', 'NM'],
            'Thursday': ['CS3451', 'CS3492', 'CS3401', 'CS3491', 'CS3452', 'LAB3', 'CS3451', 'GE3451'],
            'Friday': ['CS3492', 'CS3451', 'CS3492', 'CS3452', 'CS3401', 'GE3451', 'CS3451', 'CS3491'] // 8 periods
        };

        // Staff Mapping Guess (from previous seed data)
        const staffMap = {
            'CS3452': 'ARUN',
            'CS3491': 'STEPHY',
            'CS3451': 'RAJU',
            'CS3401': 'SAHAYA',
            'CS3492': 'MONISHA',
            'GE3451': 'JOHNCY',
            'NM': 'DHANYA',
            'LAB1': 'MONISHA',
            'LAB2': 'RAJU',
            'LAB3': 'Bobby'
        };

        for (const section of sections) {
            console.log(`Processing Year ${year} Section ${section}...`);

            for (const [day, codes] of Object.entries(schedulePattern)) {
                for (let i = 0; i < codes.length; i++) {
                    const code = codes[i];
                    const period = i + 1;

                    const subId = await getSub(code);
                    const staffId = await getStaff(staffMap[code] || 'ARUN'); // Fallback

                    if (subId && staffId) {
                        await pool.query(
                            `INSERT INTO timetable (year, section, day, period, subject_id, staff_id)
                             VALUES ($1, $2, $3, $4, $5, $6)
                             ON CONFLICT (year, section, day, period) 
                             DO UPDATE SET subject_id = EXCLUDED.subject_id, staff_id = EXCLUDED.staff_id`,
                            [year, section, day, period, subId, staffId]
                        );
                        // console.log(`Set ${day} P${period}: ${code}`);
                    }
                }
            }
        }

        console.log("Timetable Seeding Complete!");
        pool.end();
    } catch (err) {
        console.error("Error seeding timetable:", err);
    }
}

seedTimetable();
