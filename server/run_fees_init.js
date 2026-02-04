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

async function initFees() {
    try {
        console.log("Creating Fees Table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS fees (
                id SERIAL PRIMARY KEY,
                student_id INT REFERENCES students(id) ON DELETE CASCADE,
                total_amount DECIMAL(10, 2) NOT NULL DEFAULT 85000.00,
                paid_amount DECIMAL(10, 2) DEFAULT 0.00,
                status VARCHAR(20) DEFAULT 'Pending',
                last_payment_date DATE,
                UNIQUE(student_id)
            );
        `);
        console.log("Table 'fees' ensured.");

        const students = await pool.query("SELECT id, name FROM students");
        for (const s of students.rows) {
            const check = await pool.query("SELECT id FROM fees WHERE student_id = $1", [s.id]);
            if (check.rows.length === 0) {
                await pool.query(`
                    INSERT INTO fees (student_id, total_amount, paid_amount, status, last_payment_date)
                    VALUES ($1, 85000, 0, 'Pending', NOW())
                 `, [s.id]);
                console.log(`Initialized fee for ${s.name}`);
            }
        }
        console.log("Done.");
    } catch (err) {
        console.error("PG Error:", err.message); // Log message specifically
    } finally {
        pool.end();
    }
}

initFees();
