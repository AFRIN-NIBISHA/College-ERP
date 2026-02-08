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

async function checkHOD() {
    const staffId = '9606cse001';
    const name = 'Mr. EDWIN ALBERT';

    try {
        console.log(`Searching for Staff ID: ${staffId}`);
        const staffRes = await pool.query("SELECT * FROM staff WHERE staff_id = $1", [staffId]);
        console.log("Found Staff:", staffRes.rows);

        if (staffRes.rows.length > 0) {
            const staff = staffRes.rows[0];
            const nInput = name.trim().toLowerCase();
            const nDb = staff.name.toLowerCase();
            console.log(`Comparing Input: '${nInput}' with DB: '${nDb}'`);
            const match = (nDb === nInput || nDb.includes(nInput) || nInput.includes(nDb));
            console.log("Match Result:", match);

            if (staff.user_id) {
                console.log("Checking Users table for user_id:", staff.user_id);
                const userRes = await pool.query("SELECT * FROM users WHERE id = $1", [staff.user_id]);
                console.log("User entry:", userRes.rows);
            }
        } else {
            console.log("Staff ID not found in database.");
            console.log("Listing all staff to see what's there:");
            const allStaff = await pool.query("SELECT staff_id, name FROM staff LIMIT 10");
            console.log(allStaff.rows);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

checkHOD();
