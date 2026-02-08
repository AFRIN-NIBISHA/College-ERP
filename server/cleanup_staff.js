const db = require('./db');

async function cleanup() {
    try {
        console.log("Starting Staff Deduplication & Linkage Fix...");

        // 1. Get all staff
        const staffRes = await db.query("SELECT * FROM staff");
        const allStaff = staffRes.rows;

        // 2. Group by normalized name
        const normalize = (name) => name.toLowerCase().replace(/^(mr\.|mrs\.|dr\.|ms\.|prof\.)/g, '').replace(/[^a-z]/g, '');

        const groups = {};
        allStaff.forEach(s => {
            const key = normalize(s.name);
            if (!groups[key]) groups[key] = [];
            groups[key].push(s);
        });

        for (const key in groups) {
            const group = groups[key];
            if (group.length <= 1) continue;

            console.log(`\nProcessing group: ${key}`);

            // Find the best record (one with user_id)
            let master = group.find(s => s.user_id !== null);
            if (!master) master = group[0]; // Fallback to first one

            console.log(`Master record: ${master.name} (ID: ${master.id}, UserID: ${master.user_id})`);

            const duplicates = group.filter(s => s.id !== master.id);
            const dupIds = duplicates.map(s => s.id);

            if (dupIds.length > 0) {
                console.log(`Redirecting references from IDs: ${dupIds.join(', ')} to ${master.id}`);

                // Update Timetable
                const tRes = await db.query("UPDATE timetable SET staff_id = $1 WHERE staff_id = ANY($2)", [master.id, dupIds]);
                console.log(`- Updated ${tRes.rowCount} timetable entries.`);

                // Update Faculty Attendance
                const faRes = await db.query("UPDATE faculty_attendance SET staff_id = $1 WHERE staff_id = ANY($2)", [master.id, dupIds]);
                console.log(`- Updated ${faRes.rowCount} faculty attendance entries.`);
                const subRes = await db.query("UPDATE faculty_attendance SET substitute_id = $1 WHERE substitute_id = ANY($2)", [master.id, dupIds]);
                console.log(`- Updated ${subRes.rowCount} substitution entries.`);

                // Update Class Details (Incharge)
                const cdRes = await db.query("UPDATE class_details SET staff_id = $1 WHERE staff_id = ANY($2)", [master.id, dupIds]);
                console.log(`- Updated ${cdRes.rowCount} class incharge records.`);

                // Delete duplicates
                const delRes = await db.query("DELETE FROM staff WHERE id = ANY($1)", [dupIds]);
                console.log(`- Deleted ${delRes.rowCount} duplicate staff records.`);
            }
        }

        console.log("\n--- Cleanup Complete ---");
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

cleanup();
