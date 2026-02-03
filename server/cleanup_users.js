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

async function cleanUsers() {
    try {
        console.log("--- Cleaning UP Credentials ---");

        // 1. Delete all users who are NOT the official roles
        // We preserve 'admin' just in case, plus Staff, Principal, HOD, Office.
        // Also preserve any user that has a linked 'students' or 'staff' profile?
        // Actually, for strict security, let's delete anything that isn't the 4 key roles.

        console.log("Deleting unauthorized users...");
        const deleteQuery = `
            DELETE FROM users 
            WHERE username NOT IN ('Staff', 'Principal', 'HOD', 'Office', 'admin')
            RETURNING username;
        `;
        const res = await pool.query(deleteQuery);
        console.log(`Deleted ${res.rowCount} users:`, res.rows.map(r => r.username));

        // 2. Ensure official users exist with correct passwords
        const credentials = [
            { username: 'Staff', password: 'staff@123', role: 'staff' },
            { username: 'Principal', password: 'principal@123', role: 'principal' },
            { username: 'HOD', password: 'hod@123', role: 'hod' },
            { username: 'Office', password: 'office@123', role: 'office' }
        ];

        for (const cred of credentials) {
            // Upsert (Update if exists, Insert if not)
            // Note: Postgres doesn't have simple UPSERT on non-unique unless constrained.
            // Username should be unique though.

            // Check existence
            const check = await pool.query("SELECT * FROM users WHERE username = $1", [cred.username]);
            if (check.rows.length === 0) {
                await pool.query(
                    "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
                    [cred.username, cred.password, cred.role]
                );
                console.log(`Created: ${cred.username}`);
            } else {
                await pool.query(
                    "UPDATE users SET password = $1, role = $2 WHERE username = $3",
                    [cred.password, cred.role, cred.username]
                );
                console.log(`Updated: ${cred.username}`);
            }
        }

        console.log("Cleanup Complete. Only official users remain.");
        pool.end();
    } catch (err) {
        console.error(err);
    }
}

cleanUsers();
