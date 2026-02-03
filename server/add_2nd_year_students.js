const db = require('./db');

async function add2ndYearStudents() {
    try {
        console.log("Adding 2nd Year A Section students...");

        const students = [
            { roll_no: '22CSA001', name: 'John Doe', year: 2, section: 'A', email: 'john@college.edu', phone: '9876543215' },
            { roll_no: '22CSA002', name: 'Jane Smith', year: 2, section: 'A', email: 'jane@college.edu', phone: '9876543216' },
            { roll_no: '22CSA003', name: 'Mike Johnson', year: 2, section: 'A', email: 'mike@college.edu', phone: '9876543217' },
            { roll_no: '22CSA004', name: 'Sarah Williams', year: 2, section: 'A', email: 'sarah@college.edu', phone: '9876543218' },
            { roll_no: '22CSA005', name: 'David Brown', year: 2, section: 'A', email: 'david@college.edu', phone: '9876543219' }
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

        console.log("2nd Year A Section students added successfully!");

    } catch (error) {
        console.error("Error adding students:", error);
    } finally {
        process.exit(0);
    }
}

add2ndYearStudents();
