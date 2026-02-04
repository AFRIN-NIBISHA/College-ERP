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

async function checkStaffPhones() {
    try {
        const res = await pool.query("SELECT id, name, phone FROM staff");
        console.log("Current Staff Phones:", res.rows);

        // Update with dummy phones if missing
        for (const s of res.rows) {
            if (!s.phone) {
                // Generate dummy phone based on ID to be deterministic
                const dummyPhone = `98765${s.id.toString().padStart(5, '0')}`;
                await pool.query("UPDATE staff SET phone = $1 WHERE id = $2", [dummyPhone, s.id]);
                console.log(`Updated ${s.name} with phone ${dummyPhone}`);
            }
        }

        // Also add 'is_setup' column to users if not exists
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_setup BOOLEAN DEFAULT FALSE");
        console.log("Ensured 'is_setup' column in users table.");

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkStaffPhones();
