const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function testApi() {
    const year = '3';
    const section = 'A';

    try {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[istTime.getDay()];

        // Mocking the same logic as index.js
        const result = await pool.query(
            `SELECT cd.*, s.name as in_charge_name, s.phone_number as in_charge_phone,
                    fa.status as attendance_status,
                    t.year as current_year,
                    t.section as current_section
             FROM class_details cd
             LEFT JOIN staff s ON cd.staff_id = s.id
             LEFT JOIN faculty_attendance fa ON s.id = fa.staff_id AND fa.date = CURRENT_DATE
             LEFT JOIN timetable t ON s.id = t.staff_id AND t.day = $1 AND t.period = $2
             WHERE cd.year = $3 AND cd.section = $4`,
            [currentDay, 0, year, section]
        );

        console.log("RESULT:", JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
testApi();
