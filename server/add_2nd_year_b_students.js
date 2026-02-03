const db = require('./db');

async function add2ndYearBStudents() {
    try {
        console.log("Adding 2nd Year B Section students...");

        const students = [
            { roll_no: '22CSB001', name: 'Robert Wilson', year: 2, section: 'B', email: 'robert@college.edu', phone: '9876543220' },
            { roll_no: '22CSB002', name: 'Emily Davis', year: 2, section: 'B', email: 'emily@college.edu', phone: '9876543221' },
            { roll_no: '22CSB003', name: 'Michael Miller', year: 2, section: 'B', email: 'michael@college.edu', phone: '9876543222' },
            { roll_no: '22CSB004', name: 'Lisa Anderson', year: 2, section: 'B', email: 'lisa@college.edu', phone: '9876543223' },
            { roll_no: '22CSB005', name: 'James Taylor', year: 2, section: 'B', email: 'james@college.edu', phone: '9876543224' }
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

        console.log("2nd Year B Section students added successfully!");

    } catch (error) {
        console.error("Error adding students:", error);
    } finally {
        process.exit(0);
    }
}

add2ndYearBStudents();
