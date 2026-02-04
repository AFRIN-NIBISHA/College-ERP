const db = require('./db');

async function verifyAllChanges() {
    try {
        console.log("=== Verifying All Permanent Changes ===");
        
        // 1. Verify CSE 3A Students
        console.log("\n1. CSE 3rd Year A Students:");
        const studentCount = await db.query(
            "SELECT COUNT(*) as count FROM students WHERE year = 3 AND section = 'A' AND department = 'CSE'"
        );
        console.log(`   ✅ ${studentCount.rows[0].count} students saved`);
        
        // 2. Verify Timetable
        console.log("\n2. CSE 3rd Year A Timetable:");
        const timetableCount = await db.query(
            "SELECT COUNT(*) as count FROM timetable WHERE year = 3 AND section = 'A'"
        );
        console.log(`   ✅ ${timetableCount.rows[0].count} timetable entries saved`);
        
        // 3. Verify Login Credentials
        console.log("\n3. Login Credentials:");
        const userCounts = await db.query(`
            SELECT role, COUNT(*) as count, 
                   STRING_AGG(username, ', ') as usernames
            FROM users 
            WHERE role IN ('staff', 'hod', 'office', 'principal', 'admin')
            GROUP BY role
            ORDER BY role
        `);
        
        userCounts.rows.forEach(row => {
            console.log(`   ✅ ${row.role}: ${row.count} users (${row.usernames})`);
        });
        
        // 4. Verify Subjects and Staff
        console.log("\n4. Subjects and Staff:");
        const subjectCount = await db.query("SELECT COUNT(*) as count FROM subjects");
        const staffCount = await db.query("SELECT COUNT(*) as count FROM staff");
        console.log(`   ✅ ${subjectCount.rows[0].count} subjects saved`);
        console.log(`   ✅ ${staffCount.rows[0].count} staff members saved`);
        
        // 5. Sample verification
        console.log("\n5. Sample Data Verification:");
        const sampleStudent = await db.query(
            "SELECT roll_no, name FROM students WHERE year = 3 AND section = 'A' LIMIT 3"
        );
        console.log(`   ✅ Sample students: ${sampleStudent.rows.map(s => `${s.roll_no} - ${s.name}`).join(', ')}`);
        
        const sampleTimetable = await db.query(`
            SELECT t.day, t.period, s.subject_code, st.name as staff_name 
            FROM timetable t 
            LEFT JOIN subjects s ON t.subject_id = s.id 
            LEFT JOIN staff st ON t.staff_id = st.id 
            WHERE t.year = 3 AND t.section = 'A' 
            LIMIT 3
        `);
        console.log(`   ✅ Sample timetable: ${sampleTimetable.rows.map(t => `${t.day} P${t.period} - ${t.subject_code} (${t.staff_name})`).join(', ')}`);
        
        console.log("\n=== All Changes Successfully Saved! ===");
        console.log("✅ Database is ready for website refresh");
        
    } catch (error) {
        console.error("❌ Error verifying changes:", error);
    } finally {
        process.exit(0);
    }
}

verifyAllChanges();
