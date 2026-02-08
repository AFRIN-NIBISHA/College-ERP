const db = require('./db');

async function approveSubject(requestId, subjectCode) {
    const field = subjectCode.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_status';
    console.log(`\n--- Approving ${subjectCode} (${field}) ---`);

    try {
        // 1. Add Column if missing
        await db.query(`ALTER TABLE no_dues ADD COLUMN IF NOT EXISTS "${field}" VARCHAR(20) DEFAULT 'Pending'`);

        // 2. Update Field
        const res = await db.query(`UPDATE no_dues SET "${field}" = 'Approved' WHERE id = $1 RETURNING id`, [requestId]);
        console.log("Update Result:", res.rowCount);

        // 3. Trigger Completion Logic (Mimicking index.js)
        const check = await db.query("SELECT * FROM no_dues WHERE id = $1", [requestId]);
        const r = check.rows[0];

        const studInfo = await db.query("SELECT year, section FROM students WHERE id = $1", [r.student_id]);
        const { year, section } = studInfo.rows[0];

        console.log(`Fetching subjects for Year ${year} Section ${section}...`);

        const subjectsRes = await db.query(`
            SELECT DISTINCT s.subject_code, s.subject_name 
            FROM timetable t 
            JOIN subjects s ON t.subject_id = s.id 
            WHERE t.year = $1 AND t.section = $2
        `, [year, section]);

        const filteredSubjects = subjectsRes.rows.filter(sub => {
            const name = sub.subject_name.toLowerCase();
            return !name.includes('soft skill') && !name.includes('softskill') && !name.includes('nptel');
        });

        const relevantFields = filteredSubjects.map(sub =>
            sub.subject_code.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_status'
        );

        console.log(`Relevant Fields: ${relevantFields.join(', ')}`);

        let allApproved = true;
        for (const f of relevantFields) {
            const val = r[f];
            if (val !== 'Approved') {
                console.log(`  x Field ${f} is ${val}`);
                allApproved = false;
            } else {
                console.log(`  ✓ Field ${f} is Approved`);
            }
        }

        if (allApproved) {
            console.log(">>> ALL APPROVED! Updating staff_status to Approved.");
            await db.query("UPDATE no_dues SET staff_status = 'Approved' WHERE id = $1", [requestId]);
        } else {
            console.log(">>> Pending approvals remaining.");
        }

    } catch (err) {
        console.error("SIMULATION ERROR:", err);
    }
}

async function run() {
    // Request ID 14 (Afrin)
    await approveSubject(14, 'CCS336_STA');
    process.exit();
}

run();
