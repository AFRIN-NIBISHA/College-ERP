const db = require('./db');

// Helper to pad numbers
const pad = (num, size) => {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
};

const arrangeStaff = async () => {
    console.log("Starting Staff ID Re-sequencing...");

    try {
        await db.query('BEGIN');

        // 1. Fetch all staff to be re-ordered
        // Exclude Office, Demo, and arguably Admin accounts if any
        // Assuming we want to reorder existing 'FAC...' and weird names into proper FAC001...

        const res = await db.query(`
            SELECT id, staff_id, name, designation 
            FROM staff 
            WHERE 
                staff_id NOT LIKE 'OFF%' 
                AND staff_id NOT LIKE 'ST_DEMO%'
                AND name NOT ILIKE '%Office%'
                AND name NOT ILIKE '%Admin%'
            ORDER BY name ASC
        `);

        console.log(`Found ${res.rows.length} staff to re-sequence.`);

        // 2. Assign Temporary IDs to avoid unique constraint violations
        console.log("Phase 1: Assigning Temporary IDs...");
        for (let i = 0; i < res.rows.length; i++) {
            const staff = res.rows[i];
            const tempId = `TEMP_FAC_${pad(i + 1, 3)}`;

            await db.query('UPDATE staff SET staff_id = $1 WHERE id = $2', [tempId, staff.id]);
            // process.stdout.write('.');
        }
        console.log("\nPhase 1 Complete.");

        // 3. Assign Final Sequential IDs
        console.log("Phase 2: Assigning Final IDs (FAC001...)...");
        const mapping = [];
        for (let i = 0; i < res.rows.length; i++) {
            const staff = res.rows[i];
            const newId = `FAC${pad(i + 1, 3)}`;

            await db.query('UPDATE staff SET staff_id = $1 WHERE id = $2', [newId, staff.id]);
            mapping.push({ name: staff.name, old_id: staff.staff_id, new_id: newId });
        }

        await db.query('COMMIT');
        console.log("\n✅ Re-sequencing Successful!");

        console.log("\n--- New Staff ID Mapping ---");
        console.table(mapping);

    } catch (err) {
        await db.query('ROLLBACK');
        console.error("❌ Re-sequencing Failed:", err);
    } finally {
        process.exit(0);
    }
};

arrangeStaff();
