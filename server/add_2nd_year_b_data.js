const db = require('./db');

async function add2ndYearBData() {
    try {
        console.log("Adding 2nd Year B Section subjects and staff...");

        // Add new staff members from the timetable
        const staff = [
            { staff_id: 'STF016', name: 'Dr. EDWIN ALBERT', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF017', name: 'Mrs. SAHAYA REEMA', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF018', name: 'Mrs. MONISHA RAJU', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF019', name: 'Dr. JEBA STARLING', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF020', name: 'Mrs. DHANYA RAJ', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF021', name: 'Mrs. JENET BAJEE', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF022', name: 'Mrs. SINDHU', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'STF023', name: 'Dr. A. Ancy Femila', designation: 'Assistant Professor', department: 'CSE' }
        ];

        for (const member of staff) {
            try {
                await db.query(
                    'INSERT INTO staff (staff_id, name, designation, department) VALUES ($1, $2, $3, $4) ON CONFLICT (staff_id) DO NOTHING',
                    [member.staff_id, member.name, member.designation, member.department]
                );
                console.log(`✓ Added staff: ${member.name}`);
            } catch (err) {
                console.log(`⚠ Staff ${member.name} might already exist`);
            }
        }

        console.log("2nd Year B Section staff added successfully!");
        
        // Get the staff IDs for reference
        const staffResult = await db.query('SELECT id, name FROM staff WHERE name IN ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', 
            ['Dr. EDWIN ALBERT', 'Mrs. STEPHY CHRISTINA', 'Mrs. RAJU', 'Mrs. SAHAYA REEMA', 'Mrs. MONISHA RAJU', 'Dr. JEBA STARLING', 'Mrs. DHANYA RAJ', 'Mrs. JENET BAJEE', 'Mrs. SINDHU', 'Dr. A. Ancy Femila', 'Mrs. ALG Staff']);

        console.log("Staff IDs:", staffResult.rows);

    } catch (error) {
        console.error("Error adding data:", error);
    } finally {
        process.exit(0);
    }
}

add2ndYearBData();
