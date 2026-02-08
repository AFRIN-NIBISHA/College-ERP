const db = require('./db');

async function approveSubject(requestId, subjectCode, index, total) {
    const field = subjectCode.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_status';
    console.log(`\n[${index}/${total}] Approving ${subjectCode} -> ${field}`);

    try {
        await db.query(`ALTER TABLE no_dues ADD COLUMN IF NOT EXISTS "${field}" VARCHAR(20) DEFAULT 'Pending'`);
        await db.query(`UPDATE no_dues SET "${field}" = 'Approved' WHERE id = $1`, [requestId]);

        // Check logic
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

        console.log(`  Relevant Fields: ${JSON.stringify(relevantFields)}`);

        let pending = [];
        for (const f of relevantFields) {
            if (r[f] !== 'Approved') {
                pending.push(f);
            }
        }

        if (pending.length === 0) {
            console.log("  >>> SUCCESS: All subjects approved. Updating staff_status.");
            await db.query("UPDATE no_dues SET staff_status = 'Approved' WHERE id = $1", [requestId]);
        } else {
            console.log(`  >>> Pending: ${pending.join(', ')}`);
        }

    } catch (err) {
        console.error(err);
    }
}

async function run() {
    const requestId = 13;
    const subjects = ['NM', 'CCS356', 'CCS336_STA', 'CCS354_LAB', 'CCS356_LAB', 'CCS354'];

    // Reset
    await db.query("UPDATE no_dues SET staff_status = 'Pending' WHERE id = $1", [requestId]);

    // Clear all subject statuses to Pending
    for (const sub of subjects) {
        const field = sub.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_status';
        try {
            await db.query(`ALTER TABLE no_dues ADD COLUMN IF NOT EXISTS "${field}" VARCHAR(20) DEFAULT 'Pending'`);
            await db.query(`UPDATE no_dues SET "${field}" = 'Pending' WHERE id = $1`, [requestId]);
        } catch (e) { }
    }

    for (let i = 0; i < subjects.length; i++) {
        await approveSubject(requestId, subjects[i], i + 1, subjects.length);
    }

    process.exit();
}

run();
