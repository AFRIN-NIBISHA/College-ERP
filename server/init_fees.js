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
        console.log("Initializing Fees Table...");

        // 1. Create Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS fees (
                id SERIAL PRIMARY KEY,
                student_id INT REFERENCES students(id) ON DELETE CASCADE,
                total_amount DECIMAL(10, 2) NOT NULL DEFAULT 85000.00,
                paid_amount DECIMAL(10, 2) DEFAULT 0.00,
                status VARCHAR(20) DEFAULT 'Pending', -- Paid, Partial, Pending
                last_payment_date DATE,
                UNIQUE(student_id)
            );
        `);
        console.log("Fees table verified.");

        // 2. Seed Data for existing students
        const students = await pool.query("SELECT id, name FROM students");
        console.log(`Found ${students.rows.length} students. Checking fee records...`);

        for (const s of students.rows) {
            const feeCheck = await pool.query("SELECT id FROM fees WHERE student_id = $1", [s.id]);
            if (feeCheck.rows.length === 0) {
                // Randomize status
                const rand = Math.random();
                let status = 'Pending';
                let paid = 0;
                let total = 85000;

                if (rand > 0.6) {
                    status = 'Paid';
                    paid = total;
                } else if (rand > 0.3) {
                    status = 'Partial';
                    paid = 40000;
                }

                await pool.query(`
                    INSERT INTO fees (student_id, total_amount, paid_amount, status, last_payment_date)
                    VALUES ($1, $2, $3, $4, CURRENT_DATE - (floor(random() * 30)::int))
                `, [s.id, total, paid, status]);
                console.log(`-> Added fee record for ${s.name}: ${status}`);
            }
        }

        console.log("Fee Initialization Complete.");
    } catch (err) {
        console.error("Error initializing fees:", err);
    } finally {
        pool.end();
    }
}

initFees();
