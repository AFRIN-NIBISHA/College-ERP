const { Pool } = require('pg');
const http = require('http');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

const checkData = async () => {
    try {
        console.log("Checking DB directly...");
        const resStudents = await pool.query("SELECT id, name, roll_no, year, section FROM students WHERE year = 3 AND section = 'A'");
        console.log(`DB Students (Year 3 Sec A): ${resStudents.rows.length}`);

        console.log("\nChecking API (http://localhost:5000/api/students?year=3&section=A)...");

        http.get('http://localhost:5000/api/students?year=3&section=A', (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`API Response Status: ${res.statusCode}`);
                console.log(`API Response Body: ${data}`);
                pool.end();
            });
        }).on('error', (err) => {
            console.error("API Call Error:", err.message);
            pool.end();
        });

    } catch (err) {
        console.error("Error:", err);
        pool.end();
    }
};

checkData();
