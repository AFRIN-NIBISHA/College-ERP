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

async function debugAuth() {
    try {
        console.log("--- Users (Role: Office) ---");
        const officeUsers = await pool.query("SELECT * FROM users WHERE role = 'office'");
        console.table(officeUsers.rows);

        if (officeUsers.rows.length > 0) {
            const userId = officeUsers.rows[0].id;
            console.log(`\n--- Checking Staff entry for UserID ${userId} ---`);
            const staffEntry = await pool.query("SELECT * FROM staff WHERE user_id = $1", [userId]);
            console.table(staffEntry.rows);
        }

        console.log("\n--- All Staff Phones ---");
        const allStaff = await pool.query("SELECT id, name, user_id, phone FROM staff");
        console.table(allStaff.rows);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

debugAuth();
