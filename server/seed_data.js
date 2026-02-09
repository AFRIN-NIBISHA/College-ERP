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

async function seedData() {
    try {
        console.log("Seeding Subjects and Staff...");

        // 1. Staff
        const staffList = [
            { name: "Mr.ARUN VENKADESH", id: "FAC001" },
            { name: "Mrs.STEPHY CHRISTINA", id: "FAC002" },
            { name: "Mrs.RAJU", id: "FAC003" },
            { name: "Mrs.SAHAYA REEMA", id: "FAC004" },
            { name: "Mrs.MONISHA RAJU", id: "FAC005" },
            { name: "Dr. JOHNCY ROSE", id: "FAC006" },
            { name: "Mrs.DHANYA RAJU", id: "FAC007" },
            { name: "Dr. EDWIN ALBERT", id: "FAC008" },
            { name: "Dr. JEBA STARLING", id: "FAC009" },
            { name: "Dr.A.Ancy Femila", id: "FAC010" },
            { name: "Mrs.JENET RAJEE", id: "FAC011" },
            { name: "Mrs.SINDHU", id: "FAC012" },
            { name: "Dr.Bobby Denis", id: "FAC013" },

            // From Images 1 & 3
            { name: "Mrs. BINISHA", id: "FAC014" },
            { name: "Mrs. ANTO BABIYOLA", id: "FAC015" },
            { name: "Mrs. RAJA KALA", id: "FAC016" },
            { name: "Dr. ABISHA MANO", id: "FAC017" },
            { name: "Mrs. SHEEBA D", id: "FAC018" },
            { name: "Mrs.BENILA", id: "FAC019" }
        ];

        for (const s of staffList) {
            // For Staff, we usually link to a user. For simplicity in this seed,
            // we'll just insert if not exists (handling user_id as nullable or mock if schema enforces it).
            // Checking schema: user_id is REFERENCES users(id). It might be NULLABLE?
            // Let's check schema via error if it fails, or just insert dummy users first?
            // Actually currently staff table has user_id references users.

            // Quick fix: Insert dummy users for these staff or check if we can insert null.
            // Usually user_id is for login. 

            // Let's create a User for each Staff first to be safe and "Real".
            const username = s.name.split(' ')[0] + s.id;
            console.log(`Ensuring user/staff: ${s.name}`);

            // Check if User exists
            let userRes = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
            let userId;
            if (userRes.rows.length === 0) {
                const newU = await pool.query(
                    "INSERT INTO users (username, password, role) VALUES ($1, $2, 'staff') RETURNING id",
                    [username, 'password123']
                );
                userId = newU.rows[0].id;
            } else {
                userId = userRes.rows[0].id;
            }

            // Check if Staff profile exists
            const staffCheck = await pool.query("SELECT id FROM staff WHERE staff_id = $1", [s.id]);
            if (staffCheck.rows.length === 0) {
                await pool.query(
                    "INSERT INTO staff (user_id, staff_id, name, department) VALUES ($1, $2, $3, 'CSE')",
                    [userId, s.id, s.name]
                );
                console.log(`Inserted Staff: ${s.name}`);
            }
        }

        // 2. Subjects
        const subjects = [
            // Set A
            { code: "CS3452", name: "THEORY OF COMPUTATION", sem: 4 },
            { code: "CS3491", name: "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING", sem: 4 },
            { code: "CS3451", name: "INTRODUCTION TO OPERATING SYSTEM", sem: 4 },
            { code: "CS3401", name: "ALGORITHMS", sem: 4 },
            { code: "CS3492", name: "DATABASE MANAGEMENT SYSTEM", sem: 4 },
            { code: "GE3451", name: "ENVIRONMENTAL SCIENCES AND SUSTAINABILITY", sem: 4 },
            { code: "NM", name: "NAAN MUDHALVAN", sem: 4 }, // "NM" code assumed?
            { code: "LAB1", name: "DATABASE MANAGEMENT SYSTEM LABORATORY", sem: 4 },
            { code: "LAB2", name: "OPERATING SYSTEMS LABORATORY", sem: 4 },
            { code: "LAB3", name: "SOFTSKILL TRAINING", sem: 4 },

            // Set B (CCS/OBT)
            { code: "CCS336", name: "SOFTWARE TESTING AND AUTOMATION", sem: 6 },
            { code: "CCS356", name: "OBJECT ORIENTED SOFTWARE ENGINEERING", sem: 6 }, // Correct code?
            { code: "OBT352", name: "FOOD NUTRIENTS AND HEALTH", sem: 6 },
            { code: "CCS354", name: "NETWORK SECURITY", sem: 6 },
            { code: "CS3491_2", name: "EMBEDDED SYSTEMS AND IOT", sem: 6 }, // CS3491 is duplicated in list? Using alias.

            // Labs (Sem 4)
            { code: "CS3491_LAB", name: "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING LABORATORY", sem: 4 },
            { code: "CS3481", name: "DATABASE MANAGEMENT SYSTEM LABORATORY", sem: 4 }, // Replaces LAB1
            { code: "CS3461", name: "OPERATING SYSTEMS LABORATORY", sem: 4 }, // Replaces LAB2
            { code: "CS3401_LAB", name: "ALGORITHMS LABORATORY", sem: 4 },
            { code: "SOFTSKILL", name: "SOFTSKILL TRAINING", sem: 4 }, // Replaces LAB3/SS

            // Labs (Sem 6)
            { code: "CCS336_LAB", name: "SOFTWARE TESTING LABORATORY", sem: 6 },
            { code: "CCS356_LAB", name: "OBJECT ORIENTED SOFTWARE ENGINEERING LABORATORY", sem: 6 }, // Replaces LAB4
            { code: "CCS354_LAB", name: "NETWORK SECURITY LABORATORY", sem: 6 },
            { code: "CS3691_LAB", name: "EMBEDDED SYSTEMS AND IOT LABORATORY", sem: 6 },
            { code: "NM_LAB", name: "NAAN MUDHALVAN LAB", sem: 6 }
        ];

        for (const sub of subjects) {
            const check = await pool.query("SELECT id FROM subjects WHERE subject_code = $1", [sub.code]);
            if (check.rows.length === 0) {
                await pool.query(
                    "INSERT INTO subjects (subject_code, subject_name, semester) VALUES ($1, $2, $3)",
                    [sub.code, sub.name, sub.sem]
                );
                console.log(`Inserted Subject: ${sub.name}`);
            }
        }

        console.log("Seeding Complete!");
        pool.end();
    } catch (err) {
        console.error("Seeding Error:", err);
    }
}

seedData();
