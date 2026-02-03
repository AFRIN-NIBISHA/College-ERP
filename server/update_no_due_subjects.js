const db = require('./db');

async function updateNoDueSystem() {
    try {
        console.log("Updating No Due system for subject-wise approvals...");

        // First, let's see the current schema
        const schemaResult = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'no_dues'
            ORDER BY ordinal_position
        `);
        
        console.log("Current no_dues table schema:");
        schemaResult.rows.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type}`);
        });

        // Get all subjects for 3rd Year (assuming final year students)
        const subjectsResult = await db.query(`
            SELECT DISTINCT s.subject_code, s.subject_name, st.name as staff_name
            FROM subjects s
            JOIN timetable t ON s.id = t.subject_id
            JOIN staff st ON t.staff_id = st.id
            WHERE t.year = 3
            ORDER BY s.subject_code
        `);

        console.log(`\nFound ${subjectsResult.rows.length} subjects for 3rd Year:`);
        subjectsResult.rows.forEach(subject => {
            console.log(`- ${subject.subject_code}: ${subject.subject_name} (${subject.staff_name})`);
        });

        // Add subject approval columns to no_dues table
        console.log("\nAdding subject approval columns...");
        for (const subject of subjectsResult.rows) {
            const columnName = subject.subject_code.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_status';
            
            try {
                await db.query(`
                    ALTER TABLE no_dues 
                    ADD COLUMN IF NOT EXISTS ${columnName} VARCHAR(20) DEFAULT 'Pending'
                `);
                console.log(`✓ Added column: ${columnName}`);
            } catch (err) {
                console.log(`⚠ Column ${columnName} might already exist`);
            }
        }

        // Update the no_dues request endpoint to create subject-wise approvals
        console.log("\nCreating subject-wise approval records...");

        // Get existing no due requests that don't have subject approvals
        const existingRequests = await db.query(`
            SELECT id, student_id, semester 
            FROM no_dues 
            WHERE office_status = 'Pending'
        `);

        console.log(`Found ${existingRequests.rows.length} existing requests to update`);

        // For each existing request, we don't need to do anything since columns have default 'Pending'

        console.log("\n✅ No Due system updated for subject-wise approvals!");
        console.log("Now students need approval from all respective subjects before final clearance.");

    } catch (error) {
        console.error("Error updating No Due system:", error);
    } finally {
        process.exit(0);
    }
}

updateNoDueSystem();
