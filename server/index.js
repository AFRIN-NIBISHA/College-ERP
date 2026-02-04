const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Initialize Tables (Quick fix to ensure schema exists without separate script issues)
const initDb = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) CHECK (role IN ('admin', 'staff', 'student')) NOT NULL
            );
            CREATE TABLE IF NOT EXISTS students (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                roll_no VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                department VARCHAR(50) DEFAULT 'CSE',
                year INT NOT NULL,
                section VARCHAR(10),
                email VARCHAR(100),
                phone VARCHAR(15),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS staff (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                staff_id VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                designation VARCHAR(50),
                department VARCHAR(50) DEFAULT 'CSE',
                email VARCHAR(100),
                phone VARCHAR(15),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS subjects (
                id SERIAL PRIMARY KEY,
                subject_code VARCHAR(20) UNIQUE NOT NULL,
                subject_name VARCHAR(100) NOT NULL,
                semester INT NOT NULL,
                credits INT DEFAULT 3
            );
            CREATE TABLE IF NOT EXISTS marks (
                id SERIAL PRIMARY KEY,
                student_id INT REFERENCES students(id) ON DELETE CASCADE,
                subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
                exam_type VARCHAR(20) DEFAULT 'Semester',
                marks_obtained DECIMAL(5, 2),
                max_marks DECIMAL(5, 2) DEFAULT 100,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS faculty_attendance (
                id SERIAL PRIMARY KEY,
                staff_id INT REFERENCES staff(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                status VARCHAR(20) CHECK (status IN ('Present', 'Absent', 'On Duty')),
                substitute_id INT REFERENCES staff(id),
                UNIQUE(staff_id, date)
            );
            CREATE TABLE IF NOT EXISTS timetable (
                id SERIAL PRIMARY KEY,
                year INT NOT NULL,
                section VARCHAR(10) NOT NULL,
                day VARCHAR(15) NOT NULL,
                period INT NOT NULL,
                subject_id INT REFERENCES subjects(id),
                staff_id INT REFERENCES staff(id),
                UNIQUE(year, section, day, period)
            );
            CREATE TABLE IF NOT EXISTS internal_marks (
                id SERIAL PRIMARY KEY,
                student_id INT REFERENCES students(id) ON DELETE CASCADE,
                subject_code VARCHAR(20) NOT NULL,
                ia1 INT DEFAULT 0,
                ia2 INT DEFAULT 0,
                ia3 INT DEFAULT 0,
                assign1 INT DEFAULT 0,
                assign2 INT DEFAULT 0,
                assign3 INT DEFAULT 0,
                assign4 INT DEFAULT 0,
                UNIQUE(student_id, subject_code)
            );
            CREATE TABLE IF NOT EXISTS fees (
                id SERIAL PRIMARY KEY,
                student_id INT REFERENCES students(id) ON DELETE CASCADE,
                total_fee DECIMAL(10, 2) DEFAULT 0,
                paid_amount DECIMAL(10, 2) DEFAULT 0,
                payment_date DATE,
                payment_mode VARCHAR(50),
                receipt_no VARCHAR(50),
                status VARCHAR(20) DEFAULT 'Pending'
            );
            
            CREATE TABLE IF NOT EXISTS no_dues (
                id SERIAL PRIMARY KEY,
                student_id INT REFERENCES students(id) ON DELETE CASCADE,
                semester INT NOT NULL,
                office_status VARCHAR(20) DEFAULT 'Pending',
                staff_status VARCHAR(20) DEFAULT 'Pending',
                hod_status VARCHAR(20) DEFAULT 'Pending',
                principal_status VARCHAR(20) DEFAULT 'Pending',
                status VARCHAR(20) DEFAULT 'Pending',
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, semester)
            );

             CREATE TABLE IF NOT EXISTS student_od (
                id SERIAL PRIMARY KEY,
                student_id INT REFERENCES students(id) ON DELETE CASCADE,
                date_from DATE NOT NULL,
                date_to DATE NOT NULL,
                reason TEXT,
                no_of_days INT,
                status VARCHAR(20) DEFAULT 'Pending',
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Ensure columns exist if table was created prevously
            ALTER TABLE fees ADD COLUMN IF NOT EXISTS total_fee DECIMAL(10, 2) DEFAULT 0;
            ALTER TABLE fees ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10, 2) DEFAULT 0;
            ALTER TABLE fees ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Pending';
        `);
        console.log("Schema verified/updated.");
    } catch (err) {
        console.error("Schema init error:", err);
    }
};

initDb();

// Helper: Create Notification
const createNotification = async (userId, title, message, type = 'info') => {
    try {
        if (!userId) return; // Can't notify if no user ID
        await db.query(
            "INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)",
            [userId, title, message, type]
        );
        console.log(`Notification created for User ${userId}: ${title}`);
    } catch (err) {
        console.error("Error creating notification:", err);
    }
};

// Helper: Get User ID from Student ID
const getUserFromStudent = async (studentId) => {
    const res = await db.query("SELECT user_id FROM students WHERE id = $1", [studentId]);
    return res.rows[0]?.user_id;
};

// ... (Existing Routes)

app.get('/api/subjects', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM subjects ORDER BY subject_code");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
app.get('/api/staff', async (req, res) => {
    try {
        const result = await db.query("SELECT DISTINCT ON (LOWER(name)) * FROM staff ORDER BY LOWER(name)");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/staff', async (req, res) => {
    const { staff_id, name, designation, department, email, phone } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO staff (staff_id, name, designation, department, email, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [staff_id, name, designation, department, email, phone]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') return res.status(400).json({ message: 'Staff ID already exists' });
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/staff/:id', async (req, res) => {
    const { id } = req.params;
    const { staff_id, name, designation, department, email, phone } = req.body;
    try {
        const result = await db.query(
            "UPDATE staff SET staff_id = $1, name = $2, designation = $3, department = $4, email = $5, phone = $6 WHERE id = $7 RETURNING *",
            [staff_id, name, designation, department, email, phone, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Staff not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/staff/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("DELETE FROM staff WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Staff not found' });
        res.json({ message: 'Staff deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/fees', async (req, res) => {
    const { year, section, student_id } = req.query;
    try {
        let query = `
            SELECT s.id as student_id, s.name, s.roll_no, s.department, s.year, s.section, 
                   COALESCE(f.total_fee, 50000) as total_fee, 
                   COALESCE(f.paid_amount, 0) as paid_amount, 
                   COALESCE(f.status, 'Pending') as status,
                   f.payment_date, f.payment_mode, f.receipt_no
            FROM students s
            LEFT JOIN fees f ON s.id = f.student_id
            WHERE 1=1
        `;
        const params = [];

        if (student_id) {
            params.push(student_id);
            query += ` AND s.id = $${params.length}`;
        }
        if (year) {
            params.push(year);
            query += ` AND s.year = $${params.length}`;
        }
        if (section) {
            params.push(section);
            query += ` AND s.section = $${params.length}`;
        }

        const result = await db.query(query + " ORDER BY s.roll_no", params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/fees', async (req, res) => {
    const { student_id, total_fee, paid_amount, payment_date, payment_mode, receipt_no, status } = req.body;
    try {
        const check = await db.query("SELECT * FROM fees WHERE student_id = $1", [student_id]);

        if (check.rows.length > 0) {
            await db.query(
                `UPDATE fees SET 
                    total_fee = $1, paid_amount = $2, payment_date = $3, 
                    payment_mode = $4, receipt_no = $5, status = $6 
                WHERE student_id = $7`,
                [total_fee, paid_amount, payment_date, payment_mode, receipt_no, status, student_id]
            );
        } else {
            await db.query(
                `INSERT INTO fees (student_id, total_fee, paid_amount, payment_date, payment_mode, receipt_no, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [student_id, total_fee, paid_amount, payment_date, payment_mode, receipt_no, status]
            );
        }
        res.json({ message: "Fee record updated" });

        // Notify
        const userId = await getUserFromStudent(student_id);
        if (userId) {
            await createNotification(userId, 'Fees Updated', `Your fee details have been updated. Status: ${status}`, 'fees');
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Sync missing fees
app.post('/api/fees/sync', async (req, res) => {
    try {
        const students = await db.query("SELECT id FROM students");
        let count = 0;
        for (const student of students.rows) {
            const check = await db.query("SELECT id FROM fees WHERE student_id = $1", [student.id]);
            if (check.rows.length === 0) {
                await db.query(
                    "INSERT INTO fees (student_id, total_fee, paid_amount, status) VALUES ($1, 50000, 0, 'Pending')",
                    [student.id]
                );
                count++;
            }
        }
        res.json({ message: `Synced ${count} missing fee records` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 9. Faculty Attendance Endpoints
app.post('/api/attendance/faculty', async (req, res) => {
    const { date, records } = req.body; // records: [{ staffId, status, substituteId }]
    try {
        await db.query('BEGIN');
        for (const record of records) {
            await db.query(
                `INSERT INTO faculty_attendance (staff_id, date, status, substitute_id) 
                 VALUES ($1, $2, $3, $4) 
                 ON CONFLICT (staff_id, date) 
                 DO UPDATE SET status = EXCLUDED.status, substitute_id = EXCLUDED.substitute_id`,
                [record.staffId, date, record.status, record.substituteId || null]
            );
        }
        await db.query('COMMIT');
        res.json({ message: 'Faculty attendance saved' });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/attendance/faculty', async (req, res) => {
    const { date } = req.query;
    try {
        const result = await db.query(`
            SELECT fa.*, s.name as staff_name, sub.name as substitute_name 
            FROM faculty_attendance fa
            JOIN staff s ON fa.staff_id = s.id
            LEFT JOIN staff sub ON fa.substitute_id = sub.id
            WHERE fa.date = $1
        `, [date]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 10. Timetable Endpoints
app.get('/api/timetable', async (req, res) => {
    const { year, section } = req.query;
    try {
        const result = await db.query(`
            SELECT t.*, s.subject_name, st.name as staff_name, s.subject_code,
                   t.subject_id as subjectId, t.staff_id as staffId
            FROM timetable t
            LEFT JOIN subjects s ON t.subject_id = s.id
            LEFT JOIN staff st ON t.staff_id = st.id
            WHERE t.year = $1 AND t.section = $2
            ORDER BY 
                CASE 
                    WHEN day = 'Monday' THEN 1
                    WHEN day = 'Tuesday' THEN 2
                    WHEN day = 'Wednesday' THEN 3
                    WHEN day = 'Thursday' THEN 4
                    WHEN day = 'Friday' THEN 5
                END, t.period
        `, [year, section]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/timetable', async (req, res) => {
    const { year, section, entries } = req.body; // entries: [{ day, period, subjectId, staffId }]
    try {
        await db.query('BEGIN');
        for (const entry of entries) {
            await db.query(
                `INSERT INTO timetable (year, section, day, period, subject_id, staff_id)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (year, section, day, period)
                 DO UPDATE SET subject_id = EXCLUDED.subject_id, staff_id = EXCLUDED.staff_id`,
                [year, section, entry.day, entry.period, entry.subjectId, entry.staffId]
            );
        }
        await db.query('COMMIT');
        res.json({ message: 'Timetable updated' });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start Server
// (Moved app.listen to the end of file)


app.get('/api/students', async (req, res) => {
    const { year, section, id } = req.query;
    try {
        let query = "SELECT * FROM students WHERE 1=1";
        const params = [];

        if (id) {
            params.push(id);
            query += ` AND id = $${params.length}`;
        } else {
            if (year) {
                params.push(year);
                query += ` AND year = $${params.length}`;
            }
            if (section) {
                params.push(section);
                query += ` AND section = $${params.length}`;
            }
        }

        query += " ORDER BY roll_no";
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 3. Add Student
app.post('/api/students', async (req, res) => {
    const { roll_no, name, year, section, email, phone } = req.body;
    try {
        await db.query('BEGIN');

        const result = await db.query(
            "INSERT INTO students (roll_no, name, department, year, section, email, phone) VALUES ($1, $2, 'CSE', $3, $4, $5, $6) RETURNING *",
            [roll_no, name, year, section, email, phone]
        );

        const newStudent = result.rows[0];

        // Auto-create fee record
        await db.query(
            "INSERT INTO fees (student_id, total_fee, paid_amount, status) VALUES ($1, 50000, 0, 'Pending')",
            [newStudent.id]
        );

        await db.query('COMMIT');
        res.json(newStudent);
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ message: 'Student with this Roll Number already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// 3.1 Update Student
app.put('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    const { roll_no, name, year, section, email, phone } = req.body;
    try {
        const result = await db.query(
            "UPDATE students SET roll_no = $1, name = $2, year = $3, section = $4, email = $5, phone = $6 WHERE id = $7 RETURNING *",
            [roll_no, name, year, section, email, phone, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ message: 'Student with this Roll Number already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// 3.2 Delete Student
app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("DELETE FROM students WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 4. Get Dashboard Stats
app.get('/api/stats', async (req, res) => {
    try {
        const studentCount = await db.query("SELECT COUNT(*) FROM students WHERE department = 'CSE'");
        const staffCount = await db.query("SELECT COUNT(*) FROM staff WHERE department = 'CSE'");
        const subjectCount = await db.query("SELECT COUNT(*) FROM subjects");

        res.json({
            students: parseInt(studentCount.rows[0].count),
            staff: parseInt(staffCount.rows[0].count),
            subjects: parseInt(subjectCount.rows[0].count)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 5. Notices Endpoints
app.get('/api/notices', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM notices ORDER BY date_posted DESC LIMIT 5");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/notices', async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO notices (title, content) VALUES ($1, $2) RETURNING *",
            [title, content]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/notices/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("DELETE FROM notices WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Notice not found' });
        res.json({ message: 'Notice deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 6. Reports Endpoint (Existing code...)
// 6. Reports Endpoint
app.get('/api/reports/students', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM students ORDER BY year, section, roll_no");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 7. Attendance Endpoints

// Save Attendance (Bulk Update/Insert)
// Save Attendance (Period-wise)
app.post('/api/attendance', async (req, res) => {
    const { date, records, period } = req.body; // period is 1-8 or undefined (legacy)

    // Validate period
    let periodCol = null;
    if (period && period >= 1 && period <= 8) {
        periodCol = `period_${period}`;
    }

    try {
        await db.query('BEGIN');

        for (const [studentId, status] of Object.entries(records)) {
            if (periodCol) {
                // Upsert Period Attendance
                // We use dynamic column name safely because we whitelist period 1-8 above
                const query = `
                    INSERT INTO attendance (student_id, date, status, ${periodCol}) 
                    VALUES ($1, $2, 'Present', $3) 
                    ON CONFLICT (student_id, date) 
                    DO UPDATE SET ${periodCol} = EXCLUDED.${periodCol}
                `;
                // Note: We default main 'status' to 'Present' on insert, but don't overwrite it on update unless we want to logic it out.
                // Logic: Just update the specific period. The main 'status' remains 'Present' (default) if inserted new.

                await db.query(query, [studentId, date, status]);
            } else {
                // Legacy / Overall fallback (if no period selected)
                await db.query(
                    `INSERT INTO attendance (student_id, date, status) 
                     VALUES ($1, $2, $3) 
                     ON CONFLICT (student_id, date) 
                     DO UPDATE SET status = EXCLUDED.status`,
                    [studentId, date, status]
                );
            }
        }

        await db.query('COMMIT');

        // Notification logic... (Skip for period updates to avoid spam, or condense?)
        // Let's notify only if absent? Or just mute for period updates.

        res.json({ message: 'Attendance saved successfully' });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Personal Attendance for Student
app.get('/api/attendance/personal', async (req, res) => {
    const { student_id } = req.query;
    try {
        const result = await db.query(`
            SELECT date, status 
            FROM attendance 
            WHERE student_id = $1 
            ORDER BY date DESC
            LIMIT 50
        `, [student_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Attendance Report (Aggregated)
app.get('/api/attendance/report', async (req, res) => {
    const { year, section, month } = req.query;
    try {
        let queryParams = [year, section];
        let dateCondition = "";

        if (month) {
            queryParams.push(month);
            dateCondition = `AND EXTRACT(MONTH FROM a.date) = $3`;
        }

        const query = `
            SELECT 
                s.id, s.roll_no, s.name,
                COUNT(a.date) as total_days,
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
                SUM(CASE WHEN a.status = 'On Duty' THEN 1 ELSE 0 END) as od_days
            FROM students s
            LEFT JOIN attendance a ON s.id = a.student_id ${dateCondition}
            WHERE s.year = $1 AND s.section = $2
            GROUP BY s.id, s.roll_no, s.name
            ORDER BY s.roll_no
        `;

        const result = await db.query(query, queryParams);

        // Calculate percentage
        const report = result.rows.map(row => {
            const total = parseInt(row.total_days);
            const present = parseInt(row.present_days);
            const od = parseInt(row.od_days);

            // Total attended = Present + OD
            const attended = present + od;

            const percentage = total > 0 ? ((attended / total) * 100).toFixed(2) : 0;

            return {
                ...row,
                present_days: attended, // Show OD as present or keep separate? User asked for "Present". Usually OD is present.
                // Let's keep original fields but maybe display OD separately in frontend if needed?
                // User said "evalo days vanthu... absent...". I will just sum them for simpler view.
                percentage
            };
        });

        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- METADATA ENDPOINTS ---
app.get('/api/staff', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM staff ORDER BY name");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/subjects', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM subjects ORDER BY subject_code");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- MARKS ENDPOINTS ---

// Get marks for a specific class and subject
app.get('/api/marks', async (req, res) => {
    const { year, section, subject_code, student_id } = req.query;
    try {
        // 1. Get Students (Filter by ID if provided, otherwise Year/Section)
        let sQuery = "SELECT id, name, roll_no FROM students WHERE 1=1";
        const sParams = [];

        if (student_id) {
            sParams.push(student_id);
            sQuery += ` AND id = $${sParams.length}`;
        } else {
            if (year) { sParams.push(year); sQuery += ` AND year = $${sParams.length}`; }
            if (section) { sParams.push(section); sQuery += ` AND section = $${sParams.length}`; }
        }
        sQuery += " ORDER BY roll_no";

        const students = await db.query(sQuery, sParams);

        if (students.rows.length === 0) return res.json([]);

        // 2. Get Marks
        let mQuery = "SELECT * FROM internal_marks WHERE subject_code = $1";
        const mParams = [subject_code];

        if (student_id) {
            mParams.push(student_id);
            mQuery += ` AND student_id = $${mParams.length}`;
        } else {
            if (year && section) {
                mParams.push(year);
                mParams.push(section);
                mQuery += ` AND student_id IN (SELECT id FROM students WHERE year = $${mParams.length - 1} AND section = $${mParams.length})`;
            }
        }

        const marks = await db.query(mQuery, mParams);

        // 3. Merge
        const result = students.rows.map(student => {
            const markEntry = marks.rows.find(m => m.student_id === student.id) || {};
            return {
                ...student,
                ia1: markEntry.ia1 || '',
                ia2: markEntry.ia2 || '',
                ia3: markEntry.ia3 || '',
                assign1: markEntry.assign1 || '',
                assign2: markEntry.assign2 || '',
                assign3: markEntry.assign3 || '',
                assign4: markEntry.assign4 || ''
            };
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});



// Update marks (Bulk update/Upsert)
app.post('/api/marks', async (req, res) => {
    const { subject_code, marksData } = req.body; // marksData = [{ student_id, ia1, ... }]
    try {
        const studentIds = [];
        for (const entry of marksData) {
            await db.query(`
                INSERT INTO internal_marks (student_id, subject_code, ia1, ia2, ia3, assign1, assign2, assign3, assign4)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (student_id, subject_code) 
                DO UPDATE SET 
                    ia1 = EXCLUDED.ia1, 
                    ia2 = EXCLUDED.ia2, 
                    ia3 = EXCLUDED.ia3,
                    assign1 = EXCLUDED.assign1,
                    assign2 = EXCLUDED.assign2,
                    assign3 = EXCLUDED.assign3,
                    assign4 = EXCLUDED.assign4
            `, [
                entry.student_id,
                subject_code,
                entry.ia1 || 0,
                entry.ia2 || 0,
                entry.ia3 || 0,
                entry.assign1 || 0,
                entry.assign2 || 0,
                entry.assign3 || 0,
                entry.assign4 || 0
            ]);
            studentIds.push(entry.student_id);
        }

        // Notify students about marks
        if (studentIds.length > 0) {
            const userRes = await db.query("SELECT user_id FROM students WHERE id = ANY($1)", [studentIds]);
            for (const row of userRes.rows) {
                if (row.user_id) {
                    await createNotification(row.user_id, 'Marks Updated', `Marks updated for subject ${subject_code}`, 'marks');
                }
            }
        }

        res.json({ message: "Marks updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to save marks" });
    }
});
// --- LOGIN & AUTH ---
app.post('/api/login', async (req, res) => {
    console.log("HIT /api/login");
    const { username, password, role } = req.body;

    try {
        // 1. Emergency Admin Check (Strict)
        if (username === 'admin' && password === 'admin123') {
            console.log("Admin Login Success");
            return res.json({
                message: 'Login successful',
                user: { username: 'admin', role: 'admin', id: 1 }
            });
        }

        // 2. Database User Check (Standard Flow)
        const result = await db.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);

        let user = null;
        if (result.rows.length > 0) {
            user = result.rows[0];
            // Password Check
            if (user.password !== password) {
                console.log(`Login Failed: Password mismatch for ${username}`);
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        }

        // 3. FALLBACK: Student Legacy Login (Name + RollNo)
        // Check if user is trying to login as student using Name and RollNo
        // Here, frontend sends Name as 'username' and RollNo as 'password'
        if (!user && (role === 'student' || role === 'student'.toLowerCase())) {
            console.log(`[Legacy Login] Attempting for Username: '${username}' with Password/RollNo: '${password}'`);

            // Strategy: Look up by RollNo (password) first, as it's likely unique/structured
            const studentRes = await db.query("SELECT * FROM students WHERE roll_no = $1", [password.trim()]);

            if (studentRes.rows.length > 0) {
                const student = studentRes.rows[0];
                // Verify Name (Case insensitive, allowed to be partial match if user is lazy?)
                // Let's require the input name to be contained in the DB name or vice versa to be safe but flexible
                const nInput = username.trim().toLowerCase();
                const nDb = student.name.toLowerCase();

                // Check strict-ish equality first, then loose
                if (nDb === nInput || nDb.includes(nInput) || nInput.includes(nDb)) {
                    console.log("Legacy Student Login Success:", student.name);

                    user = {
                        id: student.user_id || 99999,
                        username: student.roll_no,
                        role: 'student',
                        password: '',
                        profileId: student.id,
                        name: student.name,
                        year: student.year,
                        section: student.section
                    };
                } else {
                    console.log(`Legacy Login Fail: RollNo found, but Name mismatch. DB: '${student.name}', Input: '${username}'`);
                }
            } else {
                console.log("[Legacy Login] No student found with this Roll No (Password).");
            }
        }

        if (!user) {
            console.log(`Login Failed: User ${username} not found in Users or Students table`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 4. Fetch Profile ID (if not already set by legacy fallback)
        let profileId = user.profileId;
        if (!profileId) {
            if (user.role === 'student') {
                const sRes = await db.query("SELECT id FROM students WHERE user_id = $1", [user.id]);
                if (sRes.rows.length > 0) profileId = sRes.rows[0].id;
            } else if (['staff', 'hod', 'principal', 'office'].includes(user.role)) {
                const sRes = await db.query("SELECT id FROM staff WHERE user_id = $1", [user.id]);
                if (sRes.rows.length > 0) profileId = sRes.rows[0].id;
            }
        }

        res.json({
            message: 'Login successful',
            user: { ...user, profileId }
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});


// --- SEEDING ENDPOINT (For Live Server) ---
app.post('/api/admin/seed', async (req, res) => {
    try {
        console.log("Seeding Database via API...");

        // 1. Staff
        const staffList = [
            { name: "Mr.ARUN VENKADESH", id: "FAC001" },
            { name: "Mrs.STEPHY CHRISTINA", id: "FAC002" },
            { name: "Mrs.RAJU", id: "FAC003" },
            { name: "Mrs.SAHAYA REEMA", id: "FAC004" },
            { name: "Mrs.MONISHA RAJU", id: "FAC005" },
            { name: "Dr. JOHNCY ROSE", id: "FAC006" },
            { name: "Mrs.DHANYA RAJU", id: "FAC007" },
            { name: "Dr. EDWIN ALBERT", id: "FAC008" },
            { name: "Dr. JEBA STARLING", id: "FAC009" },
            { name: "Dr.A.Ancy Femila", id: "FAC010" },
            { name: "Mrs.JENET RAJEE", id: "FAC011" },
            { name: "Mrs.SINDHU", id: "FAC012" },
            { name: "Dr.Bobby Denis", id: "FAC013" },
            { name: "Mrs. BINISHA", id: "FAC014" },
            { name: "Mrs. ANTO BABIYOLA", id: "FAC015" },
            { name: "Mrs. RAJA KALA", id: "FAC016" },
            { name: "Dr. ABISHA MANO", id: "FAC017" },
            { name: "Mrs. SHEEBA D", id: "FAC018" },
            { name: "Mrs.BENILA", id: "FAC019" }
        ];

        let staffCount = 0;
        for (const s of staffList) {
            const username = s.name.split(' ')[0] + s.id;
            let userId;

            // Check User
            const userRes = await db.query("SELECT id FROM users WHERE username = $1", [username]);
            if (userRes.rows.length === 0) {
                const newU = await db.query(
                    "INSERT INTO users (username, password, role) VALUES ($1, $2, 'staff') RETURNING id",
                    [username, 'password123']
                );
                userId = newU.rows[0].id;
            } else {
                userId = userRes.rows[0].id;
            }

            // Check Staff
            const staffCheck = await db.query("SELECT id FROM staff WHERE staff_id = $1", [s.id]);
            if (staffCheck.rows.length === 0) {
                await db.query(
                    "INSERT INTO staff (user_id, staff_id, name, department) VALUES ($1, $2, $3, 'CSE')",
                    [userId, s.id, s.name]
                );
                staffCount++;
            }
        }

        // 2. Subjects
        const subjects = [
            { code: "CS3452", name: "THEORY OF COMPUTATION", sem: 4 },
            { code: "CS3491", name: "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING", sem: 4 },
            { code: "CS3451", name: "INTRODUCTION TO OPERATING SYSTEM", sem: 4 },
            { code: "CS3401", name: "ALGORITHMS", sem: 4 },
            { code: "CS3492", name: "DATABASE MANAGEMENT SYSTEM", sem: 4 },
            { code: "GE3451", name: "ENVIRONMENTAL SCIENCES AND SUSTAINABILITY", sem: 4 },
            { code: "NM", name: "NAAN MUDHALVAN", sem: 4 },
            { code: "LAB1", name: "DATABASE MANAGEMENT SYSTEM LABORATORY", sem: 4 },
            { code: "LAB2", name: "OPERATING SYSTEMS LABORATORY", sem: 4 },
            { code: "LAB3", name: "SOFTSKILL TRAINING", sem: 4 },
            { code: "CCS336", name: "SOFTWARE TESTING AND AUTOMATION", sem: 6 },
            { code: "CCS356", name: "OBJECT ORIENTED SOFTWARE ENGINEERING", sem: 6 },
            { code: "OBT352", name: "FOOD NUTRIENTS AND HEALTH", sem: 6 },
            { code: "CCS354", name: "NETWORK SECURITY", sem: 6 },
            { code: "CS3491_2", name: "EMBEDDED SYSTEMS AND IOT", sem: 6 },
            { code: "LAB4", name: "OBJECT ORIENTED SOFTWARE ENGINEERING LAB", sem: 6 }
        ];

        let subjectCount = 0;
        for (const sub of subjects) {
            const check = await db.query("SELECT id FROM subjects WHERE subject_code = $1", [sub.code]);
            if (check.rows.length === 0) {
                await db.query(
                    "INSERT INTO subjects (subject_code, subject_name, semester) VALUES ($1, $2, $3)",
                    [sub.code, sub.name, sub.sem]
                );
                subjectCount++;
            }
        }

        res.json({ message: `Seeding Complete! Added ${staffCount} new staff and ${subjectCount} new subjects.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Seeding failed', error: err.message });
    }
});

// --- TIMETABLE SEEDING ENDPOINT ---
app.post('/api/admin/seed-timetable', async (req, res) => {
    try {
        console.log("Master Seed: Starting...");

        // --- STEP 1: ENSURE STAFF & SUBJECTS EXIST ---
        // (Copying essential logic from seed_data to ensure dependencies)

        // 1. Staff List
        const staffList = [
            { name: "Mr.ARUN VENKADESH", id: "FAC001" },
            { name: "Mrs.STEPHY CHRISTINA", id: "FAC002" },
            { name: "Mrs.RAJU", id: "FAC003" },
            { name: "Mrs.SAHAYA REEMA", id: "FAC004" },
            { name: "Mrs.MONISHA RAJU", id: "FAC005" },
            { name: "Dr. JOHNCY ROSE", id: "FAC006" },
            { name: "Mrs.DHANYA RAJU", id: "FAC007" },
            { name: "Dr. EDWIN ALBERT", id: "FAC008" },
            { name: "Dr. JEBA STARLING", id: "FAC009" },
            { name: "Dr.A.Ancy Femila", id: "FAC010" },
            { name: "Mrs.JENET RAJEE", id: "FAC011" },
            { name: "Mrs.SINDHU", id: "FAC012" },
            { name: "Dr.Bobby Denis", id: "FAC013" },
            { name: "Mrs. BINISHA", id: "FAC014" },
            { name: "Mrs. ANTO BABIYOLA", id: "FAC015" },
            { name: "Mrs. RAJA KALA", id: "FAC016" },
            { name: "Dr. ABISHA MANO", id: "FAC017" },
            { name: "Mrs. SHEEBA D", id: "FAC018" },
            { name: "Mrs.BENILA", id: "FAC019" }
        ];

        let staffAdded = 0;
        for (const s of staffList) {
            const username = s.name.split(' ')[0] + s.id;
            let userId;

            // Ensure User
            const userRes = await db.query("SELECT id FROM users WHERE username = $1", [username]);
            if (userRes.rows.length === 0) {
                const newU = await db.query(
                    "INSERT INTO users (username, password, role) VALUES ($1, $2, 'staff') RETURNING id",
                    [username, 'password123']
                );
                userId = newU.rows[0].id;
            } else {
                userId = userRes.rows[0].id;
            }

            // Ensure Staff Profile
            const staffCheck = await db.query("SELECT id FROM staff WHERE staff_id = $1", [s.id]);
            if (staffCheck.rows.length === 0) {
                await db.query(
                    "INSERT INTO staff (user_id, staff_id, name, department) VALUES ($1, $2, $3, 'CSE')",
                    [userId, s.id, s.name]
                );
                staffAdded++;
            }
        }
        console.log(`Step 1: Verified Staff (Added ${staffAdded})`);

        // 2. Subject List
        const subjects = [
            { code: "CS3452", name: "THEORY OF COMPUTATION", sem: 4 },
            { code: "CS3491", name: "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING", sem: 4 },
            { code: "CS3451", name: "INTRODUCTION TO OPERATING SYSTEM", sem: 4 },
            { code: "CS3401", name: "ALGORITHMS", sem: 4 },
            { code: "CS3492", name: "DATABASE MANAGEMENT SYSTEM", sem: 4 },
            { code: "GE3451", name: "ENVIRONMENTAL SCIENCES AND SUSTAINABILITY", sem: 4 },
            { code: "NM", name: "NAAN MUDHALVAN", sem: 4 },
            { code: "LAB1", name: "DATABASE MANAGEMENT SYSTEM LABORATORY", sem: 4 },
            { code: "LAB2", name: "OPERATING SYSTEMS LABORATORY", sem: 4 },
            { code: "LAB3", name: "SOFTSKILL TRAINING", sem: 4 },
            { code: "CCS336", name: "SOFTWARE TESTING AND AUTOMATION", sem: 6 },
            { code: "CCS356", name: "OBJECT ORIENTED SOFTWARE ENGINEERING", sem: 6 },
            { code: "OBT352", name: "FOOD NUTRIENTS AND HEALTH", sem: 6 },
            { code: "CCS354", name: "NETWORK SECURITY", sem: 6 },
            { code: "CS3491_2", name: "EMBEDDED SYSTEMS AND IOT", sem: 6 },
            { code: "LAB4", name: "OBJECT ORIENTED SOFTWARE ENGINEERING LAB", sem: 6 }
        ];

        let subjectAdded = 0;
        for (const sub of subjects) {
            const check = await db.query("SELECT id FROM subjects WHERE subject_code = $1", [sub.code]);
            if (check.rows.length === 0) {
                await db.query(
                    "INSERT INTO subjects (subject_code, subject_name, semester) VALUES ($1, $2, $3)",
                    [sub.code, sub.name, sub.sem]
                );
                subjectAdded++;
            }
        }
        console.log(`Step 2: Verified Subjects (Added ${subjectAdded})`);


        // --- STEP 2: SEED TIMETABLE ---

        const getSub = async (code) => {
            const res = await db.query("SELECT id FROM subjects WHERE subject_code = $1", [code]);
            return res.rows[0]?.id;
        };
        const getStaff = async (namePart) => {
            const res = await db.query("SELECT id FROM staff WHERE name ILIKE $1", [`%${namePart}%`]);
            return res.rows[0]?.id;
        };

        const sections = ['A', 'B'];

        // Year 2 (Sem 4)
        const patternYear2 = {
            'Monday': ['CS3401', 'CS3492', 'CS3452', 'CS3451', 'LAB1', 'LAB1', 'LAB3', 'CS3491'],
            'Tuesday': ['CS3452', 'NM', 'NM', 'CS3491', 'LAB1', 'NM', 'CS3452', 'CS3401'],
            'Wednesday': ['CS3491', 'GE3451', 'CS3401', 'CS3492', 'LAB2', 'LAB2', 'CS3452', 'NM'],
            'Thursday': ['CS3451', 'CS3492', 'CS3401', 'CS3491', 'CS3452', 'LAB3', 'CS3451', 'GE3451'],
            'Friday': ['CS3492', 'CS3451', 'CS3492', 'CS3452', 'CS3401', 'GE3451', 'CS3451', 'CS3491']
        };

        // Year 3 (Sem 6)
        const patternYear3 = {
            'Monday': ['CCS336', 'CCS354', 'CCS336', 'CCS336', 'OBT352', 'NM', 'CCS356', 'CS3691'],
            'Tuesday': ['CS3691', 'CCS356', 'CCS336', 'Softskill', 'CCS354', 'CCS336', 'CCS356', 'CS3691'],
            'Wednesday': ['CCS354', 'CCS336', 'CCS356', 'CS3691', 'CS3691', 'CCS336', 'OBT352', 'LAB4'],
            'Thursday': ['OBT352', 'CCS354', 'CS3691', 'CCS336', 'CCS336', 'OBT352', 'CS3691', 'CCS356'],
            'Friday': ['CCS356', 'CCS336', 'CCS354', 'NS', 'CCS336', 'CCS336', 'CCS336', 'OBT352']
        };

        const staffMap = {
            'CS3452': 'ARUN', 'CS3491': 'STEPHY', 'CS3451': 'RAJU',
            'CS3401': 'SAHAYA', 'CS3492': 'MONISHA', 'GE3451': 'JOHNCY',
            'NM': 'DHANYA', 'LAB1': 'MONISHA', 'LAB2': 'RAJU', 'LAB3': 'Bobby',

            'CCS336': 'BINISHA', 'CCS356': 'SHEEBA', 'OBT352': 'SINDU',
            'CCS354': 'RAJA', 'CS3491_2': 'ABISHA', 'CS3691': 'ABISHA',
            'LAB4': 'ANTO', 'Softskill': 'Bobby'
        };

        let count = 0;
        let errors = [];

        // Helper to loop and insert
        const processPattern = async (year, pattern) => {
            for (const section of sections) {
                for (const [day, codes] of Object.entries(pattern)) {
                    for (let i = 0; i < codes.length; i++) {
                        const code = codes[i];
                        if (!code) continue;
                        const period = i + 1;

                        const queryCode = code === 'CS3691' ? 'CS3491_2' : code;

                        const subId = await getSub(queryCode);
                        const staffId = await getStaff(staffMap[queryCode] || staffMap[code] || 'ARUN');

                        if (subId && staffId) {
                            await db.query(
                                `INSERT INTO timetable (year, section, day, period, subject_id, staff_id)
                                 VALUES ($1, $2, $3, $4, $5, $6)
                                 ON CONFLICT (year, section, day, period) 
                                 DO UPDATE SET subject_id = EXCLUDED.subject_id, staff_id = EXCLUDED.staff_id`,
                                [year, section, day, period, subId, staffId]
                            );
                            count++;
                        } else {
                            if (!subId) errors.push(`Missing Subject: ${queryCode}`);
                            if (!staffId) errors.push(`Missing Staff for: ${queryCode}`);
                        }
                    }
                }
            }
        };

        await processPattern(2, patternYear2);
        await processPattern(3, patternYear3);

        res.json({
            message: `Repair Complete! Added ${staffAdded} Staff, ${subjectAdded} Subjects, and updated ${count} Timetable slots.`,
            errors: [...new Set(errors)] // Unique errors
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Seeding failed', error: err.message });
    }
});

// --- LOGIN & AUTH ---
app.post('/api/login/student', async (req, res) => {
    const { name, roll_no, year, section } = req.body;
    console.log('Student Login Attempt:', { name, roll_no, year, section });

    try {
        // Case insensitive match for name and roll_no
        const result = await db.query(
            "SELECT * FROM students WHERE name ILIKE $1 AND roll_no ILIKE $2 AND year = $3 AND section = $4",
            [name.trim(), roll_no.trim(), year, section]
        );

        if (result.rows.length === 0) {
            console.log("Student login failed: No match found");
            return res.status(401).json({ message: 'Student details not found. Please check your inputs.' });
        }

        const student = result.rows[0];
        console.log("Student login success:", student.name);

        res.json({
            message: 'Login successful',
            user: {
                id: student.user_id || 0, // 0 as fallback
                username: student.roll_no,
                role: 'student',
                profileId: student.id,
                name: student.name,
                year: student.year,
                section: student.section // Vital for Timetable
            }
        });
    } catch (err) {
        console.error("Student Login Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- NO DUE MODULE ---
app.post('/api/no-due/request', async (req, res) => {
    const { student_id, semester } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO no_dues (student_id, semester) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *",
            [student_id, semester]
        );

        if (result.rows.length > 0) {
            // Fetch student details for notification
            const studentRes = await db.query("SELECT name, roll_no FROM students WHERE id = $1", [student_id]);
            if (studentRes.rows.length > 0) {
                const { name, roll_no } = studentRes.rows[0];

                // Fetch all office users
                const officeUsers = await db.query("SELECT id FROM users WHERE role = 'office'");

                // Notify each office user
                for (const user of officeUsers.rows) {
                    await db.query(
                        "INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)",
                        [user.id, 'New No Due Request', `Student ${name} (${roll_no}) has requested No Due clearance.`, 'info']
                    );
                }
            }
        }

        res.json({ message: 'Request submitted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/no-due', async (req, res) => {
    const { student_id, role } = req.query;
    try {
        // Updated query to include Fee Details
        let query = `
            SELECT nd.*, s.name, s.roll_no, s.year, s.section, s.department,
                   f.total_amount, f.paid_amount, f.status as fee_status
            FROM no_dues nd
            JOIN students s ON nd.student_id = s.id
            LEFT JOIN fees f ON nd.student_id = f.student_id
            WHERE 1=1
        `;
        const params = [];

        if (role === 'student' && student_id) {
            params.push(student_id);
            query += ` AND nd.student_id = $${params.length}`;
        }

        query += " ORDER BY nd.created_at DESC";
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Init Fees Table (Migration Endpoint)
app.post('/api/admin/init-fees', async (req, res) => {
    try {
        console.log("Initializing Fees Table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS fees (
                id SERIAL PRIMARY KEY,
                student_id INT REFERENCES students(id) ON DELETE CASCADE,
                total_amount DECIMAL(10, 2) NOT NULL DEFAULT 85000.00,
                paid_amount DECIMAL(10, 2) DEFAULT 0.00,
                status VARCHAR(20) DEFAULT 'Pending',
                last_payment_date DATE,
                UNIQUE(student_id)
            );
        `);

        // Seed
        const students = await db.query("SELECT id FROM students");
        let count = 0;
        for (const s of students.rows) {
            const check = await db.query("SELECT id FROM fees WHERE student_id = $1", [s.id]);
            if (check.rows.length === 0) {
                await db.query(`
                    INSERT INTO fees (student_id, total_amount, paid_amount, status, last_payment_date)
                    VALUES ($1, 85000, 0, 'Pending', NOW())
                 `, [s.id]);
                count++;
            }
        }

        res.json({ message: `Fees table ready. Seeded ${count} records.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Init failed' });
    }
});

app.delete('/api/no-due/:id', async (req, res) => {
    const { id } = req.params;
    console.log("=== No Due Delete Request ===");
    console.log("Request ID:", id);

    try {
        // First check if the No Due request exists
        const checkResult = await db.query("SELECT * FROM no_dues WHERE id = $1", [id]);
        if (checkResult.rows.length === 0) {
            console.log("❌ No Due request not found");
            return res.status(404).json({ message: 'No Due request not found' });
        }

        console.log("Found No Due request:", checkResult.rows[0]);

        // Delete the request
        const result = await db.query("DELETE FROM no_dues WHERE id = $1", [id]);
        console.log("✅ Delete successful. Rows affected:", result.rowCount);

        res.json({ message: 'No Due request deleted successfully' });
    } catch (err) {
        console.error("❌ Error deleting No Due request:", err);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

app.put('/api/no-due/:id/approve', async (req, res) => {
    const { id } = req.params;
    console.log("=== No Due Approval Request ===");
    console.log("Request params:", { id });
    console.log("Request body:", req.body);
    console.log("Content-Type:", req.get('Content-Type'));

    const { field, status, remarks } = req.body;

    try {
        let updateField = '';

        // Handle field parameter (for subject-wise approvals)
        if (field) {
            updateField = field;
            console.log("Using field parameter:", field);
        } else {
            // Handle stage parameter (for traditional approvals)
            const stage = req.body.stage;
            console.log("Field not provided, checking stage:", stage);
            if (stage === 'office') updateField = 'office_status';
            else if (stage === 'staff') updateField = 'staff_status';
            else if (stage === 'hod') updateField = 'hod_status';
            else if (stage === 'principal') updateField = 'principal_status';
        }

        console.log("Determined updateField:", updateField);

        if (!updateField) {
            console.log("❌ Invalid field/stage error");
            console.log("❌ Full request body:", req.body);
            console.log("❌ Field parameter:", field);
            console.log("❌ Stage parameter:", req.body.stage);
            return res.status(400).json({ message: 'Invalid field/stage', received: { field, stage: req.body.stage } });
        }

        // Validate status
        if (!status || !['Approved', 'Rejected'].includes(status)) {
            console.log("❌ Invalid status:", status);
            return res.status(400).json({ message: 'Invalid status', received: status });
        }

        // Update status and remarks
        const updateQuery = `UPDATE no_dues SET ${updateField} = $1, remarks = COALESCE($2, remarks) WHERE id = $3`;
        console.log("Executing query:", updateQuery);
        console.log("Query params:", [status, remarks || null, id]);

        try {
            const result = await db.query(updateQuery, [status, remarks || null, id]);
            console.log("✅ Update successful. Rows affected:", result.rowCount);

            // Verify the update
            const checkResult = await db.query(`SELECT ${updateField} FROM no_dues WHERE id = $1`, [id]);
            console.log(`✅ Verified ${updateField} is now:`, checkResult.rows[0][updateField]);
        } catch (dbError) {
            console.error("❌ Database update failed:", dbError);
            console.error("❌ Database error details:", dbError.message);
            console.error("❌ Query that failed:", updateQuery);
            console.error("❌ Query params:", [status, remarks || null, id]);
            return res.status(500).json({ message: 'Database update failed', details: dbError.message });
        }

        // Check if all subject approvals are done for HOD eligibility
        const check = await db.query("SELECT * FROM no_dues WHERE id = $1", [id]);
        const r = check.rows[0];

        if (status === 'Rejected') {
            await db.query("UPDATE no_dues SET status = 'Rejected' WHERE id = $1", [id]);
            console.log("Status set to Rejected");
        } else {
            // Check if all subject columns are approved
            const subjectColumns = [
                'ccs336_status', 'ccs337_status', 'ccs338_status', 'ccs354_status',
                'ccs356_status', 'cs3491_status', 'nm001_status', 'nm002_status',
                'obt352_status', 'ss001_status'
            ];

            // Helper to create notification
            const createNotification = async (userId, title, message, type = 'info') => {
                try {
                    if (!userId) return;
                    await db.query(
                        "INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)",
                        [userId, title, message, type]
                    );
                } catch (err) {
                    console.error("Notification Error:", err);
                }
            };

            // ... Code to update status ...
            if (updateField.startsWith('office_status') && status === 'Approved') {
                // Notify Staffs
                // 1. Get Student details
                const studRes = await db.query(`
               SELECT s.id, s.year, s.section, s.name, s.roll_no 
               FROM no_dues nd 
               JOIN students s ON nd.student_id = s.id 
               WHERE nd.id = $1
           `, [id]);

                if (studRes.rows.length > 0) {
                    const student = studRes.rows[0];

                    // 2. Get Staffs for this class from timetable
                    // We select distinct staff_ids handling subjects for this student's year/sec
                    const staffRes = await db.query(`
                   SELECT DISTINCT st.user_id 
                   FROM timetable t
                   JOIN staff st ON t.staff_id = st.id
                   WHERE t.year = $1 AND t.section = $2
                   AND st.user_id IS NOT NULL
               `, [student.year, student.section]);

                    for (const row of staffRes.rows) {
                        await createNotification(
                            row.user_id,
                            'No Due Request',
                            `Clearance request from ${student.name} (${student.roll_no}) is ready for subject approval.`,
                            'info'
                        );
                    }
                }
            }

            // Check if all subject approvals are done
            const check = await db.query("SELECT * FROM no_dues WHERE id = $1", [id]);
            const r = check.rows[0];

            // subjectColumns is already defined above

            const allSubjectsApproved = subjectColumns.every(col => r[col] === 'Approved');

            if (status === 'Approved' && updateField.endsWith('_status') && !['office_status', 'hod_status', 'principal_status'].includes(updateField)) {
                // It was a subject approval
                if (allSubjectsApproved) {
                    // Notify HOD
                    const hodRes = await db.query("SELECT id FROM users WHERE role = 'hod'");
                    for (const row of hodRes.rows) {
                        await createNotification(
                            row.id,
                            'No Due Request',
                            `All subjects approved for a student. HOD approval pending.`,
                            'info'
                        );
                    }
                }
            }

            if (updateField === 'hod_status' && status === 'Approved') {
                // Notify Principal
                const prinRes = await db.query("SELECT id FROM users WHERE role = 'principal'");
                for (const row of prinRes.rows) {
                    await createNotification(
                        row.id,
                        'No Due Request',
                        `HOD approved a No Due request. Principal approval pending.`,
                        'info'
                    );
                }
            }

            if (updateField === 'principal_status' && status === 'Approved') {
                // Notify Student
                const studRes = await db.query(`
               SELECT s.user_id 
               FROM no_dues nd 
               JOIN students s ON nd.student_id = s.id 
               WHERE nd.id = $1
           `, [id]);

                if (studRes.rows.length > 0) {
                    await createNotification(
                        studRes.rows[0].user_id,
                        'No Due Approved',
                        `Your No Due clearance has been fully approved!`,
                        'success'
                    );
                }

                // Auto-complete status
                await db.query("UPDATE no_dues SET status = 'Approved' WHERE id = $1", [id]);
            }
        } // Close else block

        console.log("✅ Sending success response");
        res.json({ message: 'Updated successfully', field: updateField, status });
    } catch (err) {
        console.error("❌ No Due Approval Error:", err);
        console.error("Error stack:", err.stack);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

// --- STUDENT OD ENDPOINTS ---
app.post('/api/od/apply', async (req, res) => {
    const { student_id, date_from, date_to, reason, no_of_days } = req.body;
    try {
        await db.query(
            "INSERT INTO student_od (student_id, date_from, date_to, reason, no_of_days) VALUES ($1, $2, $3, $4, $5)",
            [student_id, date_from, date_to, reason, no_of_days]
        );
        res.json({ message: 'OD Request submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/od', async (req, res) => {
    const { student_id } = req.query;
    try {
        let query = `
            SELECT od.*, s.name, s.roll_no, s.department, s.year, s.section
            FROM student_od od
            JOIN students s ON od.student_id = s.id
            WHERE 1=1
        `;
        const params = [];
        if (student_id) {
            params.push(student_id);
            query += ` AND od.student_id = $${params.length}`;
        }
        query += " ORDER BY od.created_at DESC";
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});



app.put('/api/od/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, remarks } = req.body;
    try {
        await db.query("UPDATE student_od SET status = $1, remarks = $2 WHERE id = $3", [status, remarks, id]);

        // Notify Student
        const odReq = await db.query("SELECT student_id FROM student_od WHERE id = $1", [id]);
        if (odReq.rows.length > 0) {
            const studentId = odReq.rows[0].student_id;
            const userId = await getUserFromStudent(studentId);
            if (userId) {
                await createNotification(userId, 'OD Request Update', `Your OD request has been ${status}`, 'od');
            }
        }

        res.json({ message: 'OD Request updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/od/:id', async (req, res) => {
    const { id } = req.params;
    console.log("=== OD Delete Request ===");
    console.log("Request ID:", id);

    try {
        // First check if the OD request exists
        const checkResult = await db.query("SELECT * FROM student_od WHERE id = $1", [id]);
        if (checkResult.rows.length === 0) {
            console.log("❌ OD request not found");
            return res.status(404).json({ message: 'OD request not found' });
        }

        console.log("Found OD request:", checkResult.rows[0]);

        // Delete the request
        const result = await db.query("DELETE FROM student_od WHERE id = $1", [id]);
        console.log("✅ Delete successful. Rows affected:", result.rowCount);

        res.json({ message: 'OD Request deleted successfully' });
    } catch (err) {
        console.error("❌ Error deleting OD request:", err);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

app.get('/api/student/subjects', async (req, res) => {
    const { year, section } = req.query;
    try {
        const result = await db.query(`
            SELECT DISTINCT s.subject_code, s.subject_name, st.name as staff_name, s.credits
            FROM timetable t
            JOIN subjects s ON t.subject_id = s.id
            JOIN staff st ON t.staff_id = st.id
            WHERE t.year = $1 AND t.section = $2
            ORDER BY s.subject_code
        `, [year, section]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- AUTHENTICATION & REGISTRATION ---

// In-memory OTP Store (Production should use Redis or DB)
const otpStore = new Map();

const axios = require('axios'); // Ensure axios is required at top or here

app.post('/api/auth/register-check', async (req, res) => {
    const { name, mobile, role } = req.body;
    try {
        // Check if user already exists
        const userCheck = await db.query("SELECT * FROM users WHERE mobile_number = $1 OR username = $2", [mobile, name]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User with this Name or Mobile already exists.' });
        }

        // Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4 Digit for SMS
        otpStore.set(mobile, otp);

        console.log(`[OTP GENERATED] For ${name} (${mobile}): ${otp}`);

        // --- SEND SMS (Fast2SMS Integration) ---
        const apiKey = process.env.FAST2SMS_API_KEY;

        if (apiKey) {
            try {
                // Using Fast2SMS 'otp' route which uses default template "Your OTP is XXXXX"
                const smsRes = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
                    params: {
                        authorization: apiKey,
                        variables_values: otp,
                        route: 'otp',
                        numbers: mobile
                    }
                });
                console.log("SMS API Response:", smsRes.data);
            } catch (smsErr) {
                console.error("SMS Send Failed:", smsErr.message);
                // Don't fail the request, just log it. The user can see OTP in console if local.
                // In production, this would be critical.
            }
        } else {
            console.log("⚠️ No FAST2SMS_API_KEY found in .env. SMS not sent. Check Server Logs for OTP.");
        }

        res.json({ message: 'OTP sent to ' + mobile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/register-verify', async (req, res) => {
    const { name, mobile, otp, password, role } = req.body;
    try {
        // Verify OTP
        const storedOtp = otpStore.get(mobile);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ message: 'Invalid or Expired OTP' });
        }

        // Create User
        // Note: In a real app, hash the password!
        const result = await db.query(
            "INSERT INTO users (username, password, role, mobile_number) VALUES ($1, $2, $3, $4) RETURNING id",
            [name, password, role, mobile]
        );

        const userId = result.rows[0].id;

        // Also create entry in Staff/Student table if needed

        // Clear OTP
        otpStore.delete(mobile);

        res.json({ message: 'Registration Successful! You can now login.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Registration failed. Try a different name.' });
    }
});

// --- LOGIN & AUTH ---
app.post('/api/login', async (req, res) => {
    console.log("HIT /api/login");
    console.log("Body:", req.body);

    const { username, password } = req.body;

    // Emergency manual check
    if (username === 'admin' && password === 'admin123') {
        console.log("Using Manual Admin Login");
        return res.json({
            message: 'Login successful',
            user: { username: 'admin', role: 'admin', id: 1 }
        });
    }

    try {
        const result = await db.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
        if (result.rows.length === 0) {
            console.log("User not found in DB");
            return res.status(401).json({ message: 'Invalid credentials (DB-USER)' });
        }

        const user = result.rows[0];
        if (user.password !== password) {
            console.log("Password mismatch in DB");
            return res.status(401).json({ message: 'Invalid credentials (DB-PASS)' });
        }

        let profileId = null;
        if (user.role === 'student') {
            const sRes = await db.query("SELECT id FROM students WHERE user_id = $1", [user.id]);
            if (sRes.rows.length > 0) profileId = sRes.rows[0].id;
        }

        res.json({
            message: 'Login successful',
            user: { ...user, profileId }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- NOTIFICATIONS ENDPOINTS ---
app.get('/api/notifications', async (req, res) => {
    const { user_id } = req.query;
    try {
        const result = await db.query("SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20", [user_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/notifications/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("UPDATE notifications SET is_read = TRUE WHERE id = $1", [id]);
        res.json({ message: 'Marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- DEPLOYMENT CONFIGURATION ---
// Debugging path
const clientBuildPath = path.resolve(__dirname, '../client/dist');
console.log('Serving static files from:', clientBuildPath);

// Serve static files from the React app
app.use(express.static(clientBuildPath));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


