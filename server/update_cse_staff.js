const db = require('./db');

async function updateCSEStaffList() {
    try {
        console.log("Updating CSE department staff list...");

        // The specific CSE staff members to keep
        const cseStaffList = [
            { staff_id: 'CSE001', name: 'Dr. I. Edwin Albert', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'CSE002', name: 'Mrs. J. Stefy Christina', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'CSE003', name: 'Mrs. Sheeba', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'CSE004', name: 'Mrs. Y. Monisha Raju', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'CSE005', name: 'Mrs. T. Raju', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'CSE006', name: 'Mrs. F. Sahaya Reema', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'CSE007', name: 'Mrs. R. Binisha', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'CSE008', name: 'Mrs. Raja Kala P', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'CSE009', name: 'Mrs. Anto Babiyola', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'CSE010', name: 'Mrs. R. Nishanthi', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'CSE011', name: 'Mrs. D. R. Sindhu', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'CSE012', name: 'Mr. Arun Venkatesh', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'CSE013', name: 'Mrs. Dhanya Raj', designation: 'Assistant Professor', department: 'CSE' },
            { staff_id: 'CSE014', name: 'Mrs. Jenet Rajee', designation: 'Assistant Professor', department: 'CSE' }
        ];

        // Clear timetable references first (due to foreign key constraints)
        await db.query('DELETE FROM timetable');
        console.log("Cleared timetable references");

        // Clear all existing staff
        await db.query('DELETE FROM staff');
        console.log("Cleared all existing staff records");

        // Add the specific CSE staff members
        for (const staff of cseStaffList) {
            try {
                await db.query(
                    'INSERT INTO staff (staff_id, name, designation, department) VALUES ($1, $2, $3, $4)',
                    [staff.staff_id, staff.name, staff.designation, staff.department]
                );
                console.log(`✓ Added CSE staff: ${staff.name}`);
            } catch (err) {
                console.log(`⚠ Could not add ${staff.name}: ${err.message}`);
            }
        }

        console.log("CSE department staff list updated successfully!");

        // Display the updated staff list
        const result = await db.query('SELECT * FROM staff ORDER BY name');
        console.log("\nUpdated Staff List:");
        result.rows.forEach(staff => {
            console.log(`- ${staff.name} (${staff.staff_id}) - ${staff.designation}`);
        });

    } catch (error) {
        console.error("Error updating staff list:", error);
    } finally {
        process.exit(0);
    }
}

updateCSEStaffList();
