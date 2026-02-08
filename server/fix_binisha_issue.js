const db = require('./db');

async function run() {
    try {
        console.log("--- DIANGOSTICS & FIX FOR BINISHA / AFRIN ---");

        // 1. Find Student Afrin
        const studRes = await db.query("SELECT id, name, roll_no, year, section FROM students WHERE name ILIKE '%Afrin%' LIMIT 1");
        if (studRes.rows.length === 0) {
            console.log("Error: Student Afrin not found.");
            process.exit(1);
        }
        const student = studRes.rows[0];
        console.log(`Student Found: ${student.name} (${student.roll_no}) - Year ${student.year} Sec ${student.section}`);

        // 2. Find Staff Binisha
        const staffRes = await db.query("SELECT id, name, user_id FROM staff WHERE name ILIKE '%Binisha%' LIMIT 1");
        if (staffRes.rows.length === 0) {
            console.log("Error: Staff Binisha not found.");
            process.exit(1);
        }
        const staff = staffRes.rows[0];
        console.log(`Staff Found: ${staff.name} (ID: ${staff.id})`);

        // 3. Check Timetable Mapping
        const timeRes = await db.query(
            "SELECT * FROM timetable WHERE staff_id = $1 AND year = $2 AND section = $3",
            [staff.id, student.year, student.section]
        );
        if (timeRes.rows.length === 0) {
            console.log("WARNING: Binisha is NOT in the timetable for this class!");
            // Fix: Add her to timetable for a subject (e.g., CCS336_STA)
            // First check if she teaches any subject generally
            // If not, assign her to CCS336_STA for this class
            console.log("Assigning Binisha to CCS336_STA for this class...");
            const subRes = await db.query("SELECT id FROM subjects WHERE subject_code = 'CCS336_STA'");
            if (subRes.rows.length > 0) {
                await db.query(
                    "INSERT INTO timetable (year, section, day, period, subject_id, staff_id) VALUES ($1, $2, 'Monday', 1, $3, $4)",
                    [student.year, student.section, subRes.rows[0].id, staff.id]
                );
                console.log("Added to Timetable.");
            } else {
                console.log("Error: Subject CCS336_STA not found.");
            }
        } else {
            console.log(`Timetable Match: Binisha teaches ${timeRes.rows.length} slot(s) for this class.`);
        }

        // 4. Check/Create No Due Request
        let ndRes = await db.query("SELECT * FROM no_dues WHERE student_id = $1", [student.id]);
        let ndId;
        if (ndRes.rows.length === 0) {
            console.log("No Due Request missing. Creating one...");
            const insertRes = await db.query(
                "INSERT INTO no_dues (student_id, semester, office_status) VALUES ($1, $2, 'Approved') RETURNING id",
                [student.id, student.year * 2]
            );
            ndId = insertRes.rows[0].id;
            console.log(`Created Request ID: ${ndId}`);
        } else {
            ndId = ndRes.rows[0].id;
            console.log(`Request Found ID: ${ndId}. Office Status: ${ndRes.rows[0].office_status}`);

            // Ensure Office Approved
            if (ndRes.rows[0].office_status !== 'Approved') {
                await db.query("UPDATE no_dues SET office_status = 'Approved' WHERE id = $1", [ndId]);
                console.log("Updated Office Status to Approved.");
            }
        }

        // 5. Check if Binisha's subject column exists in no_dues
        // Assuming CCS336_STA
        const subjectCode = 'CCS336_STA';
        const colName = 'ccs336_sta_status';

        // Ensure column exists
        await db.query(`ALTER TABLE no_dues ADD COLUMN IF NOT EXISTS "${colName}" VARCHAR(20) DEFAULT 'Pending'`);

        // Check current status
        const checkCol = await db.query(`SELECT "${colName}" FROM no_dues WHERE id = $1`, [ndId]);
        console.log(`Current status for ${subjectCode} (${colName}): ${checkCol.rows[0][colName]}`);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
