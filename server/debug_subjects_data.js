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

async function checkSubjects() {
    try {
        console.log("--- Checking Subjects for Nulls ---");
        const badSubjects = await pool.query("SELECT * FROM subjects WHERE subject_code IS NULL OR subject_name IS NULL");
        console.log(`Found ${badSubjects.rows.length} subjects with null code/name.`);
        if (badSubjects.rows.length > 0) console.table(badSubjects.rows);

        console.log("\n--- Checking for Empty Strings ---");
        const emptySubjects = await pool.query("SELECT * FROM subjects WHERE subject_code = '' OR subject_name = ''");
        console.log(`Found ${emptySubjects.rows.length} subjects with empty strings.`);
        if (emptySubjects.rows.length > 0) console.table(emptySubjects.rows);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkSubjects();
