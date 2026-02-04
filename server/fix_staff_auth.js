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

async function fixStaff() {
    try {
        const phone = '7806811228';
        console.log(`Ensuring a STAFF user exists for phone: ${phone}`);

        // 1. Check if a 'staff' user exists
        const staffUser = await pool.query("SELECT * FROM users WHERE role = 'staff' LIMIT 1");

        let staffUserId;
        if (staffUser.rows.length === 0) {
            console.log("Creating new Staff user...");
            const newUser = await pool.query("INSERT INTO users (username, password, role, is_setup) VALUES ('staff_demo', 'pass123', 'staff', FALSE) RETURNING id");
            staffUserId = newUser.rows[0].id;
        } else {
            console.log("Using existing Staff user:", staffUser.rows[0].username);
            staffUserId = staffUser.rows[0].id;
        }

        // 2. Link this staff user to the phone number
        // Check if linkage exists
        const linkage = await pool.query("SELECT * FROM staff WHERE user_id = $1", [staffUserId]);
        if (linkage.rows.length > 0) {
            console.log("Updating phone for existing staff entry...");
            await pool.query("UPDATE staff SET phone = $1 WHERE user_id = $2", [phone, staffUserId]);
        } else {
            console.log("Creating new staff entry linked to user...");
            await pool.query(
                "INSERT INTO staff (staff_id, name, department, designation, user_id, phone) VALUES ($1, $2, 'CSE', 'Assistant Professor', $3, $4)",
                ['ST_DEMO', 'Demo Staff', staffUserId, phone]
            );
        }

        console.log("✅ FIXED: Staff login for 7806811228 should now work.");

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

fixStaff();
