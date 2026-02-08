const db = require('./db');

async function finalCleanup() {
    try {
        console.log("Deep Cleaning Staff Table...");

        // 1. Get all staff
        const staffRes = await db.query("SELECT * FROM staff");
        const allStaff = staffRes.rows;

        const normalize = (name) => {
            return name.toLowerCase()
                .replace(/^(mr\.|mrs\.|dr\.|ms\.|prof\.)/g, '') // Remove prefixes
                .replace(/\s[a-z]\.?\s/g, ' ') // Remove single letter initials in middle
                .replace(/^[a-z]\.?\s/g, '') // Remove starting initials
                .replace(/\s[a-z]\.?$/g, '') // Remove ending initials
                .replace(/[^a-z]/g, ''); // Keep only alpha
        };

        const groups = {};
        allStaff.forEach(s => {
            const key = normalize(s.name);
            if (!groups[key]) groups[key] = [];
            groups[key].push(s);
        });

        for (const key in groups) {
            const group = groups[key];
            if (group.length <= 1) continue;

            let master = group.find(s => s.user_id !== null);
            if (!master) master = group[0];

            const dupIds = group.filter(s => s.id !== master.id).map(s => s.id);
            if (dupIds.length === 0) continue;

            console.log(`Merging ${group.length} records into ${master.name} (Key: ${key})`);

            await db.query("UPDATE timetable SET staff_id = $1 WHERE staff_id = ANY($2)", [master.id, dupIds]);
            await db.query("UPDATE faculty_attendance SET staff_id = $1 WHERE staff_id = ANY($2)", [master.id, dupIds]);
            await db.query("UPDATE faculty_attendance SET substitute_id = $1 WHERE substitute_id = ANY($2)", [master.id, dupIds]);
            await db.query("UPDATE class_details SET staff_id = $1 WHERE staff_id = ANY($2)", [master.id, dupIds]);
            await db.query("DELETE FROM staff WHERE id = ANY($1)", [dupIds]);
        }

        console.log("Cleanup Done.");
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

finalCleanup();
