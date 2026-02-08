const db = require('./db');

async function approveSubject(requestId, subjectCode) {
    const field = subjectCode.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_status';
    console.log(`\n--- Manual Approval: ${subjectCode} (${field}) for Request ${requestId} ---`);

    try {
        // 1. Ensure column
        await db.query(`ALTER TABLE no_dues ADD COLUMN IF NOT EXISTS "${field}" VARCHAR(20) DEFAULT 'Pending'`);

        // 2. Update status
        await db.query(`UPDATE no_dues SET "${field}" = 'Approved' WHERE id = $1`, [requestId]);
        console.log(`Updated ${field} to Approved.`);

        // 3. Check completion
        const check = await db.query("SELECT * FROM no_dues WHERE id = $1", [requestId]);
        const r = check.rows[0];

        const studInfo = await db.query("SELECT year, section FROM students WHERE id = $1", [r.student_id]);
        const { year, section } = studInfo.rows[0];

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

        let allApproved = true;
        let pending = [];
        for (const f of relevantFields) {
            if (r[f] !== 'Approved') {
                allApproved = false;
                pending.push(f);
            }
        }

        if (allApproved) {
            console.log(">>> ALL APPROVED! Updating staff_status to Approved.");
            await db.query("UPDATE no_dues SET staff_status = 'Approved' WHERE id = $1", [requestId]);
        } else {
            console.log(`>>> Pending approvals: ${pending.join(', ')}`);
        }

    } catch (err) {
        console.error("MANUAL APPROVAL ERROR:", err);
    }
}

async function run() {
    await approveSubject(14, 'CCS336_STA');
    process.exit();
}

run();
