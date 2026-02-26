const db = require('./db');
db.query(`
            SELECT 
                nd.*, 
                nd.status as nodue_overall_status,
                s.name, s.roll_no, s.year, s.section, s.department,
                f.total_fee, f.paid_amount, f.status as fee_status,
                f.scholarship_type, f.scholarship_details
            FROM students s
            LEFT JOIN no_dues nd ON s.id = nd.student_id
            LEFT JOIN fees f ON s.id = f.student_id AND f.academic_year = (SELECT value FROM settings WHERE key = 'current_academic_year' LIMIT 1)
            WHERE s.roll_no = '960623104004'
        `).then(r => {
    console.log("RESULT:", JSON.stringify(r.rows));
    process.exit(0);
}).catch(e => {
    console.error("ERROR:", e.message);
    process.exit(1);
});
