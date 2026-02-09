const db = require('./db');

const fixDesignations = async () => {
    console.log("Fixing missing designations...");

    try {
        // Update all NULL or empty designations to 'Assistant Professor'
        // Exclude Office Admin and Demo Staff if their names match known patterns
        const query = `
            UPDATE staff 
            SET designation = 'Assistant Professor' 
            WHERE (designation IS NULL OR designation = '') 
            AND name NOT ILIKE '%Office%' 
            AND name NOT ILIKE '%Admin%'
            AND staff_id NOT LIKE 'OFF%'
        `;

        const res = await db.query(query);
        console.log(`✅ Updated ${res.rowCount} staff records with default designation 'Assistant Professor'.`);

        // Verify
        const verify = await db.query("SELECT name, designation FROM staff WHERE designation = 'Assistant Professor' LIMIT 5");
        console.log("Sample updated records:");
        console.table(verify.rows);

    } catch (err) {
        console.error("❌ Failed to update designations:", err);
    } finally {
        process.exit(0);
    }
};

fixDesignations();
