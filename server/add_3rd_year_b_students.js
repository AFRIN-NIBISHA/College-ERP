const db = require('./db');

async function add3rdYearBStudents() {
    try {
        console.log("Adding 3rd Year B Section students...");

        const students = [
            { roll_no: '21CSB001', name: 'Peter Martinez', year: 3, section: 'B', email: 'peter@college.edu', phone: '9876543230' },
            { roll_no: '21CSB002', name: 'Sophia Garcia', year: 3, section: 'B', email: 'sophia@college.edu', phone: '9876543231' },
            { roll_no: '21CSB003', name: 'Daniel Lee', year: 3, section: 'B', email: 'daniel@college.edu', phone: '9876543232' },
            { roll_no: '21CSB004', name: 'Olivia Brown', year: 3, section: 'B', email: 'olivia@college.edu', phone: '9876543233' },
            { roll_no: '21CSB005', name: 'Lucas Wilson', year: 3, section: 'B', email: 'lucas@college.edu', phone: '9876543234' }
        ];

        for (const student of students) {
            try {
                const result = await db.query(
                    'INSERT INTO students (roll_no, name, department, year, section, email, phone) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                    [student.roll_no, student.name, 'CSE', student.year, student.section, student.email, student.phone]
                );
                
                // Auto-create fee record
                await db.query(
                    'INSERT INTO fees (student_id, total_fee, paid_amount, status) VALUES ($1, 50000, 0, \'Pending\')',
                    [result.rows[0].id]
                );
                
                console.log(`✓ Added student: ${student.roll_no} - ${student.name}`);
            } catch (err) {
                console.log(`⚠ Student ${student.roll_no} might already exist`);
            }
        }

        console.log("3rd Year B Section students added successfully!");

    } catch (error) {
        console.error("Error adding students:", error);
    } finally {
        process.exit(0);
    }
}

add3rdYearBStudents();
