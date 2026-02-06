const db = require('./db');

async function fixSchema() {
    try {
        console.log("Fixing Staff Deletion Constraints...");

        // 1. Fix faculty_attendance(substitute_id)
        // First drop existing constraint if we can find it, or just try to alter.
        // In PostgreSQL, to change a constraint we usually drop and add.
        // But we don't know the exact name. It's usually something like 'faculty_attendance_substitute_id_fkey'

        await db.query(`
            DO $$ 
            BEGIN 
                -- 1. faculty_attendance(substitute_id)
                IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'faculty_attendance_substitute_id_fkey') THEN
                    ALTER TABLE faculty_attendance DROP CONSTRAINT faculty_attendance_substitute_id_fkey;
                END IF;
                ALTER TABLE faculty_attendance 
                ADD CONSTRAINT faculty_attendance_substitute_id_fkey 
                FOREIGN KEY (substitute_id) REFERENCES staff(id) ON DELETE SET NULL;

                -- 2. timetable(staff_id)
                IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'timetable_staff_id_fkey') THEN
                    ALTER TABLE timetable DROP CONSTRAINT timetable_staff_id_fkey;
                END IF;
                ALTER TABLE timetable 
                ADD CONSTRAINT timetable_staff_id_fkey 
                FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL;

                -- 3. timetable(subject_id) - for good measure
                IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'timetable_subject_id_fkey') THEN
                    ALTER TABLE timetable DROP CONSTRAINT timetable_subject_id_fkey;
                END IF;
                ALTER TABLE timetable 
                ADD CONSTRAINT timetable_subject_id_fkey 
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;

            END $$;
        `);

        console.log("Schema fix applied successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error applying schema fix:", err);
        process.exit(1);
    }
}

fixSchema();
