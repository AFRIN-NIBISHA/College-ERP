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

async function fixOffice() {
    try {
        // 1. Check if Office user exists
        const officeUser = await pool.query("SELECT * FROM users WHERE role = 'office'");
        let officeUserId;

        if (officeUser.rows.length === 0) {
            console.log("Creating Office user...");
            const newOffice = await pool.query("INSERT INTO users (username, password, role, is_setup) VALUES ('office', 'office123', 'office', FALSE) RETURNING id");
            officeUserId = newOffice.rows[0].id;
        } else {
            console.log("Office user exists:", officeUser.rows[0]);
            officeUserId = officeUser.rows[0].id;
        }

        // 2. Check if linked in Staff table
        const staffCheck = await pool.query("SELECT * FROM staff WHERE user_id = $1", [officeUserId]);

        if (staffCheck.rows.length === 0) {
            console.log("Linking Office user to Staff table...");
            // Create a dummy staff entry for Office so auth works
            // Use the phone number from the screenshot: 7806811228
            await pool.query(
                "INSERT INTO staff (staff_id, name, department, designation, user_id, phone) VALUES ($1, $2, $3, $4, $5, $6)",
                ['OFF001', 'Office Admin', 'Administration', 'Office Staff', officeUserId, '7806811228']
            );
            console.log("Created Staff entry for Office with phone 7806811228");
        } else {
            console.log("Staff entry exists:", staffCheck.rows[0]);
            // Ensure phone is set
            await pool.query("UPDATE staff SET phone = '7806811228' WHERE user_id = $1", [officeUserId]);
            console.log("Updated Office phone to 7806811228");
        }

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

fixOffice();
