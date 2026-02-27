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

async function fixSchema() {
    try {
        console.log("Applying Schema Fixes...");

        // 1. Add mobile_number column to users if missing
        try {
            await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(15);");
            console.log("✅ Added mobile_number column.");
        } catch (e) {
            console.log("⚠️ mobile_number add failed (might exist):", e.message);
        }

        // 2. Remove strict Role Check constraint to allow HOD, Principal, Office
        try {
            // Find constraint name usually users_role_check
            await pool.query("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;");
            console.log("✅ Dropped role check constraint.");
        } catch (e) {
            console.log("⚠️ Drop constraint failed:", e.message);
        }
        // 3. Fix Internal Marks Unique Constraint
        try {
            await pool.query(`
                ALTER TABLE internal_marks DROP CONSTRAINT IF EXISTS internal_marks_student_id_subject_code_key;
                ALTER TABLE internal_marks DROP CONSTRAINT IF EXISTS internal_marks_student_id_subject_code_academic_year_key;
                ALTER TABLE internal_marks ADD CONSTRAINT internal_marks_student_id_subject_code_academic_year_key UNIQUE (student_id, subject_code, academic_year);
            `);
            console.log("✅ Fixed internal_marks constraint.");
        } catch (e) {
            console.log("⚠️ Internal marks constraint fix failed:", e.message);
        }

        console.log("Schema Fixes Applied Successfully.");
        pool.end();
    } catch (err) {
        console.error("Critical Error:", err);
    }
}

fixSchema();
