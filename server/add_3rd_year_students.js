const db = require('./db');

async function add3rdYearStudents() {
    try {
        console.log("Adding 3rd Year A Section students...");

        const students = [
            { roll_no: '21CSA001', name: 'Alice Johnson', year: 3, section: 'A', email: 'alice@college.edu', phone: '9876543210' },
            { roll_no: '21CSA002', name: 'Bob Smith', year: 3, section: 'A', email: 'bob@college.edu', phone: '9876543211' },
            { roll_no: '21CSA003', name: 'Charlie Brown', year: 3, section: 'A', email: 'charlie@college.edu', phone: '9876543212' },
            { roll_no: '21CSA004', name: 'Diana Prince', year: 3, section: 'A', email: 'diana@college.edu', phone: '9876543213' },
            { roll_no: '21CSA005', name: 'Edward Norton', year: 3, section: 'A', email: 'edward@college.edu', phone: '9876543214' }
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

        console.log("3rd Year A Section students added successfully!");

    } catch (error) {
        console.error("Error adding students:", error);
    } finally {
        process.exit(0);
    }
}

add3rdYearStudents();
