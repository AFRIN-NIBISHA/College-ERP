const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db');
const cron = require('node-cron');
const promoteYear = require('./promote_year');
const webpush = require('web-push');
require('dotenv').config();

// Web Push Setup
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_EMAIL || 'mailto:admin@example.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
} else {
    console.warn("VAPID Keys missing. Push notifications disabled.");
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Helper to get current academic year
async function getCurrentYear() {
    try {
        const res = await db.query("SELECT value FROM settings WHERE key = 'current_academic_year'");
        return res.rows[0]?.value || '2025-2026';
    } catch (e) {
        return '2025-2026';
    }
}

// Initialize Tables (Quick fix to ensure schema exists without separate script issues)
const initDb = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL,
                is_setup BOOLEAN DEFAULT FALSE
            );
            
            -- Ensure role check exists with new roles
            ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
            ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'staff', 'student', 'hod', 'principal', 'office', 'librarian', 'driver'));

            CREATE TABLE IF NOT EXISTS settings (
                key VARCHAR(50) PRIMARY KEY,
                value TEXT NOT NULL
            );
            INSERT INTO settings (key, value) VALUES ('current_academic_year', '2025-2026') ON CONFLICT (key) DO NOTHING;
            
            -- Initialize Default Driver Account
            INSERT INTO users (username, password, role, is_setup) 
            VALUES ('DMI drivers', 'dmidriver@', 'driver', TRUE) 
            ON CONFLICT (username) DO NOTHING;

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
                bus_no VARCHAR(50),
                bus_driver_name VARCHAR(100),
                bus_driver_phone VARCHAR(15),
                bus_starting_point VARCHAR(255),
                bus_ending_point VARCHAR(255),
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
                bus_no VARCHAR(50),
                bus_driver_name VARCHAR(100),
                bus_driver_phone VARCHAR(15),
                bus_starting_point VARCHAR(255),
                bus_ending_point VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS subjects (
                id SERIAL PRIMARY KEY,
                subject_name VARCHAR(255) NOT NULL,
                subject_code VARCHAR(50) UNIQUE NOT NULL,
                semester INT NOT NULL,
                credits INT DEFAULT 3,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Migrations for existing tables
            ALTER TABLE students ADD COLUMN IF NOT EXISTS bus_no VARCHAR(50);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS bus_driver_name VARCHAR(100);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS bus_driver_phone VARCHAR(15);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS bus_starting_point VARCHAR(255);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS bus_ending_point VARCHAR(255);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS father_name VARCHAR(100);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_name VARCHAR(100);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
            ALTER TABLE students ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS religion VARCHAR(50);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS caste VARCHAR(50);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS nationality VARCHAR(50);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS emis_no VARCHAR(50);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS umis_no VARCHAR(50);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS aadhaar_no VARCHAR(20);

            ALTER TABLE staff ADD COLUMN IF NOT EXISTS bus_no VARCHAR(50);
            ALTER TABLE staff ADD COLUMN IF NOT EXISTS bus_driver_name VARCHAR(100);
            ALTER TABLE staff ADD COLUMN IF NOT EXISTS bus_driver_phone VARCHAR(15);
            ALTER TABLE staff ADD COLUMN IF NOT EXISTS bus_starting_point VARCHAR(255);
            ALTER TABLE staff ADD COLUMN IF NOT EXISTS bus_ending_point VARCHAR(255);

            ALTER TABLE bus ADD COLUMN IF NOT EXISTS starting_point VARCHAR(255);
            ALTER TABLE bus ADD COLUMN IF NOT EXISTS ending_point VARCHAR(255);
            ALTER TABLE bus ADD COLUMN IF NOT EXISTS registration_number VARCHAR(50);
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
                substitute_id INT REFERENCES staff(id) ON DELETE SET NULL,
                UNIQUE(staff_id, date)
            );
            CREATE TABLE IF NOT EXISTS timetable (
                id SERIAL PRIMARY KEY,
                year INT NOT NULL,
                section VARCHAR(10) NOT NULL,
                day VARCHAR(15) NOT NULL,
                period INT NOT NULL,
                subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
                staff_id INT REFERENCES staff(id) ON DELETE SET NULL,
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
                academic_year VARCHAR(20) DEFAULT '2025-2026',
                UNIQUE(student_id, subject_code, academic_year)
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
                librarian_status VARCHAR(20) DEFAULT 'Pending',
                hod_status VARCHAR(20) DEFAULT 'Pending',
                principal_status VARCHAR(20) DEFAULT 'Pending',
                status VARCHAR(20) DEFAULT 'Pending',
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, semester)
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

             CREATE TABLE IF NOT EXISTS student_od (
                id SERIAL PRIMARY KEY,
                student_id INT REFERENCES students(id) ON DELETE CASCADE,
                date_from DATE NOT NULL,
                date_to DATE NOT NULL,
                reason TEXT,
                no_of_days DECIMAL(4,1),
                hours INT,
                od_type VARCHAR(10) DEFAULT 'Day', -- 'Hour' or 'Day'
                pending_with VARCHAR(20), -- 'staff', 'hod', 'principal'
                status VARCHAR(20) DEFAULT 'Pending',
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS push_subscriptions (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                subscription TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS class_details (
                id SERIAL PRIMARY KEY,
                year INT NOT NULL,
                section VARCHAR(10) NOT NULL,
                staff_id INT REFERENCES staff(id) ON DELETE SET NULL,
                rep_name VARCHAR(100),
                UNIQUE(year, section)
            );

            CREATE TABLE IF NOT EXISTS notices (
                id SERIAL PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                content TEXT,
                date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS bus (
                id SERIAL PRIMARY KEY,
                bus_number VARCHAR(50) UNIQUE NOT NULL,
                driver_name VARCHAR(100) NOT NULL,
                driver_phone VARCHAR(15),
                starting_point VARCHAR(255),
                ending_point VARCHAR(255)
            );




            -- Ensure columns exist if table was created prevously
            ALTER TABLE fees ADD COLUMN IF NOT EXISTS total_fee DECIMAL(10, 2) DEFAULT 0;
            ALTER TABLE fees ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10, 2) DEFAULT 0;
            ALTER TABLE fees ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Pending';
            ALTER TABLE students ADD COLUMN IF NOT EXISTS dob DATE;
            ALTER TABLE student_od ADD COLUMN IF NOT EXISTS od_type VARCHAR(10) DEFAULT 'Day';
            ALTER TABLE student_od ADD COLUMN IF NOT EXISTS hours INT;
            ALTER TABLE student_od ADD COLUMN IF NOT EXISTS pending_with VARCHAR(20);
            ALTER TABLE timetable ADD COLUMN IF NOT EXISTS subject_name_text VARCHAR(255);
            ALTER TABLE timetable ADD COLUMN IF NOT EXISTS staff_name_text VARCHAR(255);
            ALTER TABLE timetable ADD COLUMN IF NOT EXISTS subject_code_text VARCHAR(50);
            ALTER TABLE timetable ADD COLUMN IF NOT EXISTS subject_credit_text VARCHAR(10);
            ALTER TABLE timetable ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) DEFAULT '2025-2026';
            ALTER TABLE students ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) DEFAULT '2025-2026';
            ALTER TABLE students ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active';
            ALTER TABLE students ADD COLUMN IF NOT EXISTS emis_no VARCHAR(50);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS umis_no VARCHAR(50);
            ALTER TABLE bus ADD COLUMN IF NOT EXISTS photo_data TEXT;
            ALTER TABLE internal_marks ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) DEFAULT '2025-2026';
            ALTER TABLE attendance ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) DEFAULT '2025-2026';
            ALTER TABLE no_dues ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) DEFAULT '2025-2026';
            -- Update existing null academic years to default if they exist
            UPDATE fees SET academic_year = '2025-2026' WHERE academic_year IS NULL;
            UPDATE students SET academic_year = '2025-2026' WHERE academic_year IS NULL;
            UPDATE internal_marks SET academic_year = '2025-2026' WHERE academic_year IS NULL;
            UPDATE no_dues SET academic_year = '2025-2026' WHERE academic_year IS NULL;

            -- Ensure scholarship columns are text for safety
            ALTER TABLE fees ALTER COLUMN scholarship_type TYPE VARCHAR(100);
            ALTER TABLE fees ALTER COLUMN scholarship_details TYPE TEXT;

            -- Ensure Fee Naming Consistency safely
            DO $$ 
            BEGIN 
                -- If total_fee doesn't exist but total_amount does, rename it
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fees' AND column_name = 'total_amount') 
                   AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fees' AND column_name = 'total_fee') THEN
                    ALTER TABLE fees RENAME COLUMN total_amount TO total_fee;
                END IF;
            END $$;
            ALTER TABLE fees ADD COLUMN IF NOT EXISTS total_fee DECIMAL(10, 2) DEFAULT 0;
            ALTER TABLE fees ADD COLUMN IF NOT EXISTS bus_fee DECIMAL(10, 2) DEFAULT 0;
            ALTER TABLE fees ADD COLUMN IF NOT EXISTS scholarship_amount DECIMAL(10, 2) DEFAULT 0;
            ALTER TABLE fees ADD COLUMN IF NOT EXISTS scholarship_amount DECIMAL(10, 2) DEFAULT 0;

            -- Ensure No Due Constraints
            ALTER TABLE no_dues DROP CONSTRAINT IF EXISTS no_dues_student_id_semester_key;
            ALTER TABLE no_dues ADD CONSTRAINT no_dues_student_id_semester_key UNIQUE (student_id, semester);
            
            -- Ensure Internal Marks Constraints
            ALTER TABLE internal_marks ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) DEFAULT '2025-2026';
            ALTER TABLE internal_marks DROP CONSTRAINT IF EXISTS internal_marks_student_id_subject_code_key;
            ALTER TABLE internal_marks DROP CONSTRAINT IF EXISTS internal_marks_student_id_subject_code_key1;
            ALTER TABLE internal_marks DROP CONSTRAINT IF EXISTS internal_marks_student_id_subject_code_academic_year_key;
            ALTER TABLE internal_marks ADD CONSTRAINT internal_marks_student_id_subject_code_academic_year_key UNIQUE (student_id, subject_code, academic_year);
            
            ALTER TABLE no_dues ADD COLUMN IF NOT EXISTS librarian_status VARCHAR(20) DEFAULT 'Pending';

            CREATE TABLE IF NOT EXISTS books (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                isbn VARCHAR(50) UNIQUE,
                category VARCHAR(100),
                total_copies INT DEFAULT 1,
                available_copies INT DEFAULT 1,
                shelf_location VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS book_issues (
                id SERIAL PRIMARY KEY,
                book_id INT REFERENCES books(id) ON DELETE CASCADE,
                student_id INT REFERENCES students(id) ON DELETE CASCADE,
                issue_date DATE DEFAULT CURRENT_DATE,
                due_date DATE NOT NULL,
                return_date DATE,
                fine_amount DECIMAL(10, 2) DEFAULT 0,
                status VARCHAR(20) DEFAULT 'Issued',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            ALTER TABLE students ADD COLUMN IF NOT EXISTS library_status VARCHAR(20) DEFAULT 'Active';

            CREATE TABLE IF NOT EXISTS attendance (
                id SERIAL PRIMARY KEY,
                student_id INT REFERENCES students(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                status VARCHAR(20) DEFAULT 'Present',
                period_1 VARCHAR(20),
                period_2 VARCHAR(20),
                period_3 VARCHAR(20),
                period_4 VARCHAR(20),
                period_5 VARCHAR(20),
                period_6 VARCHAR(20),
                period_7 VARCHAR(20),
                period_8 VARCHAR(20),
                UNIQUE(student_id, date)
            );

            -- Ensure Deletion Cascades
            ALTER TABLE faculty_attendance DROP CONSTRAINT IF EXISTS faculty_attendance_substitute_id_fkey;
            ALTER TABLE faculty_attendance ADD CONSTRAINT faculty_attendance_substitute_id_fkey FOREIGN KEY (substitute_id) REFERENCES staff(id) ON DELETE SET NULL;
            
            ALTER TABLE timetable DROP CONSTRAINT IF EXISTS timetable_staff_id_fkey;
            ALTER TABLE timetable ADD CONSTRAINT timetable_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL;

            ALTER TABLE timetable DROP CONSTRAINT IF EXISTS timetable_subject_id_fkey;
            ALTER TABLE timetable ADD CONSTRAINT timetable_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;

            -- Manual Timetable Entry Support
            ALTER TABLE timetable ADD COLUMN IF NOT EXISTS subject_name_text VARCHAR(100);
            ALTER TABLE timetable ADD COLUMN IF NOT EXISTS staff_name_text VARCHAR(100);

            -- Ensure Attendance Periods Exist
            ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_1 VARCHAR(20);
            ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_2 VARCHAR(20);
            ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_3 VARCHAR(20);
            ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_4 VARCHAR(20);
            ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_5 VARCHAR(20);
            ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_6 VARCHAR(20);
            ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_7 VARCHAR(20);
            ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_8 VARCHAR(20);

            -- Ensure Attendance Unique Constraint
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_student_id_date_key') THEN
                    ALTER TABLE attendance ADD CONSTRAINT attendance_student_id_date_key UNIQUE (student_id, date);
                END IF;
            END $$;
        `);
        console.log("Schema verified/updated.");

        // Safe Seeding for Class Incharges (if table is empty)
        const classCount = await db.query("SELECT COUNT(*) FROM class_details");
        if (parseInt(classCount.rows[0].count) === 0) {
            console.log("Seeding default class incharge data...");
            // Try to find Raja Kala
            const rajaRes = await db.query("SELECT id FROM staff WHERE name ILIKE '%Raja Kala%' LIMIT 1");
            if (rajaRes.rows.length > 0) {
                const rajaId = rajaRes.rows[0].id;
                await db.query("INSERT INTO class_details (year, section, staff_id) VALUES (3, 'A', $1) ON CONFLICT DO NOTHING", [rajaId]);
                console.log("Seeded Raja Kala for 3rd Year A");
            }
        }

        // Seed Abisha Mano for Login
        await db.query(`
            INSERT INTO staff (staff_id, name, department) 
            VALUES ('9606ECE001', 'Mrs. ABISHA MANO', 'ECE') 
            ON CONFLICT (staff_id) DO UPDATE SET name = EXCLUDED.name, department = EXCLUDED.department
        `);


        // Ensure all students have user accounts for push notifications
        const orphanStudents = await db.query("SELECT id, roll_no, name FROM students WHERE user_id IS NULL");
        if (orphanStudents.rows.length > 0) {
            console.log(`Fixing ${orphanStudents.rows.length} orphan students...`);
            for (const s of orphanStudents.rows) {
                const username = s.roll_no.toLowerCase();
                const studentUser = await db.query("SELECT id FROM users WHERE username = $1", [username]);
                let uid;
                if (studentUser.rows.length > 0) {
                    uid = studentUser.rows[0].id;
                } else {
                    const newUser = await db.query("INSERT INTO users (username, password, role) VALUES ($1, $2, 'student') RETURNING id", [username, s.roll_no]);
                    uid = newUser.rows[0].id;
                }
                await db.query("UPDATE students SET user_id = $1 WHERE id = $2", [uid, s.id]);
            }
            console.log("All orphan students fixed.");
        }
    } catch (err) {
        console.error("Schema init error:", err);
    }
};

initDb();

// --- AUTOMATION: Annual Student Promotion ---
// Runs at 00:00 on June 1st every year
cron.schedule('0 0 1 6 *', async () => {
    console.log('[CRON] Running scheduled annual promotion...');
    try {
        await promoteYear();
        console.log('[CRON] Annual promotion completed successfully.');
    } catch (err) {
        console.error('[CRON] Annual promotion failed:', err);
    }
});

// Admin-only Manual Promotion Trigger
app.post('/api/admin/promote-students', async (req, res) => {
    const { auth_key } = req.body;
    // Simple safety check - in production use proper middleware
    if (auth_key !== 'DMI_ADMIN_PROMOTE_2026') {
        return res.status(403).json({ message: 'Unauthorized. Invalid security key.' });
    }

    try {
        await promoteYear();
        res.json({ message: 'Manual promotion completed successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Promotion failed.', error: err.message });
    }
});

// Helper: Create Notification
const createNotification = async (userId, title, message, type = 'info') => {
    try {
        if (!userId) {
            console.log(`Skipping notification: No userId provided for "${title}"`);
            return;
        }

        const userRes = await db.query("SELECT role FROM users WHERE id = $1", [userId]);
        if (userRes.rows.length > 0) {
            const userRole = userRes.rows[0].role;
            if (userRole === 'driver' && type !== 'bus' && type !== 'notice') {
                console.log(`Skipping non-bus notification for driver ${userId}: ${title}`);
                return;
            }
        }

        // 1. Save to Database
        await db.query(
            "INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)",
            [userId, title, message, type]
        );
        console.log(`Notification created for User ${userId}: ${title}`);

        // 2. Send Push Notification to all registered devices for this user
        const subRes = await db.query("SELECT subscription FROM push_subscriptions WHERE user_id = $1", [userId]);

        const payload = JSON.stringify({
            title: title,
            body: message,
            icon: '/logo192.png', // Optional: link to your app logo
            data: { url: '/notifications' }
        });

        for (const row of subRes.rows) {
            try {
                await webpush.sendNotification(row.subscription, payload);
                console.log(`Push sent to User ${userId}`);
            } catch (pushErr) {
                console.error(`Failed to send push to User ${userId}:`, pushErr.statusCode);
                if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                    // Subscription expired or gone - remove it
                    await db.query("DELETE FROM push_subscriptions WHERE subscription = $1", [JSON.stringify(row.subscription)]);
                }
            }
        }
    } catch (err) {
        console.error("Error creating notification:", err);
    }
};

// Get Notifications
app.get('/api/notifications', async (req, res) => {
    const { userId, role } = req.query;
    try {
        let query = "SELECT * FROM notifications WHERE 1=1";
        const params = [];

        if (role === 'student' && userId) {
            params.push(userId);
            query += ` AND user_id = $${params.length}`;
        } else if (userId && role !== 'admin') {
            // For staff/HOD/etc, they might want their specific notifications too
            params.push(userId);
            query += ` AND user_id = $${params.length}`;
        }
        // Admin gets all if no userId provided, or we can filter

        query += " ORDER BY created_at DESC LIMIT 50";
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper: Get User ID from Student ID
const getUserFromStudent = async (studentId) => {
    const res = await db.query("SELECT user_id FROM students WHERE id = $1", [studentId]);
    return res.rows[0]?.user_id;
};

app.get('/api/subjects', async (req, res) => {
    const { semester, year, section } = req.query;
    try {
        let query;
        let params = [];

        if (year && section) {
            // Fetch subjects assigned in the timetable for this class
            // Include both known subjects and custom text entries
            query = `
                SELECT 
                    MIN(COALESCE(s.id, (999000 + t.id))) as id,
                    COALESCE(s.subject_name, t.subject_name_text) as subject_name,
                    COALESCE(s.subject_code, COALESCE(t.subject_code_text, 'Custom')) as subject_code,
                    MAX(COALESCE(s.semester, 0)) as semester,
                    MAX(COALESCE(s.credits, 3)) as credits
                FROM timetable t
                LEFT JOIN subjects s ON t.subject_id = s.id
                WHERE TRIM(t.year::text) = TRIM($1::text) AND UPPER(TRIM(t.section)) = UPPER(TRIM($2))
                GROUP BY 
                    COALESCE(s.subject_name, t.subject_name_text),
                    COALESCE(s.subject_code, COALESCE(t.subject_code_text, 'Custom'))
            `;
            params = [year, section];
        } else {
            query = "SELECT * FROM subjects";
            if (semester) {
                params.push(semester);
                query += ` WHERE semester = $1`;
            }
        }

        query += " ORDER BY subject_code";
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error("Subjects Fetch Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});



app.post('/api/subjects', async (req, res) => {
    const { subject_code, subject_name, semester, credits } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO subjects (subject_code, subject_name, semester, credits) VALUES ($1, $2, $3, $4) RETURNING *",
            [subject_code, subject_name, semester || 1, credits || 3]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') return res.status(400).json({ message: 'Subject Code already exists' });
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/subjects/:id', async (req, res) => {
    const { id } = req.params;
    const { subject_code, subject_name, semester, credits } = req.body;
    try {
        const result = await db.query(
            "UPDATE subjects SET subject_code = $1, subject_name = $2, semester = $3, credits = $4 WHERE id = $5 RETURNING *",
            [subject_code, subject_name, semester, credits, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Subject not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/subjects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM subjects WHERE id = $1", [id]);
        res.json({ message: 'Subject deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/staff', async (req, res) => {
    try {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[istTime.getDay()];
        const hours = istTime.getHours();
        const minutes = istTime.getMinutes();
        const timeVal = hours * 60 + minutes;

        let currentPeriod = null;
        if (timeVal >= 525 && timeVal < 600) currentPeriod = 1; // 8:45 - 10:00 (Adjusted based on standard slots)
        else if (timeVal >= 600 && timeVal < 650) currentPeriod = 2; // 10:00 - 10:50
        else if (timeVal >= 660 && timeVal < 710) currentPeriod = 3; // 11:00 - 11:50
        else if (timeVal >= 710 && timeVal < 765) currentPeriod = 4; // 11:50 - 12:45
        else if (timeVal >= 810 && timeVal < 860) currentPeriod = 5; // 1:30 - 2:20
        else if (timeVal >= 860 && timeVal < 910) currentPeriod = 6; // 2:20 - 3:10
        else if (timeVal >= 910 && timeVal < 960) currentPeriod = 7; // 3:10 - 4:00
        else if (timeVal >= 960 && timeVal < 1010) currentPeriod = 8; // 4:00 - 4:50

        const query = `
            SELECT 
                s.*,
                fa.status as attendance_status,
                t.year as current_year,
                t.section as current_section,
                sub.subject_code as current_subject
            FROM staff s
            LEFT JOIN faculty_attendance fa ON s.id = fa.staff_id AND fa.date = CURRENT_DATE
            LEFT JOIN timetable t ON s.id = t.staff_id AND t.day = $1 AND t.period = $2
            LEFT JOIN subjects sub ON t.subject_id = sub.id
            ORDER BY s.staff_id
        `;

        const result = await db.query(query, [currentDay, currentPeriod || 0]);

        // Add a "live_status" field for frontend convenience
        const enrichedRows = result.rows.map(row => {
            let status = 'In Staffroom';
            if (row.attendance_status === 'Absent') {
                status = 'Absent';
            } else if (row.current_year) {
                status = `In Class (${row.current_year}${row.current_section})`;
            } else if (row.attendance_status === 'On Duty') {
                status = 'On Duty';
            }
            return { ...row, live_status: status };
        });

        res.json(enrichedRows);
    } catch (err) {
        console.error("Staff Fetch Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/staff', async (req, res) => {
    const { staff_id, name, designation, department, email, phone, bus_no, bus_driver_name, bus_driver_phone, bus_starting_point, bus_ending_point } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO staff (staff_id, name, designation, department, email, phone, bus_no, bus_driver_name, bus_driver_phone, bus_starting_point, bus_ending_point) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
            [staff_id, name, designation, department, email, phone, bus_no, bus_driver_name, bus_driver_phone, bus_starting_point, bus_ending_point]
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
    const { staff_id, name, designation, department, email, phone, bus_no, bus_driver_name, bus_driver_phone, bus_starting_point, bus_ending_point } = req.body;
    try {
        const result = await db.query(
            "UPDATE staff SET staff_id = $1, name = $2, designation = $3, department = $4, email = $5, phone = $6, bus_no = $7, bus_driver_name = $8, bus_driver_phone = $9, bus_starting_point = $10, bus_ending_point = $11 WHERE id = $12 RETURNING *",
            [staff_id, name, designation, department, email, phone, bus_no, bus_driver_name, bus_driver_phone, bus_starting_point, bus_ending_point, id]
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
        // Find user_id first to delete fully
        const staffRes = await db.query("SELECT user_id FROM staff WHERE id = $1", [id]);
        if (staffRes.rows.length === 0) return res.status(404).json({ message: 'Staff not found' });

        const userId = staffRes.rows[0].user_id;

        if (userId) {
            // Deleting user will cascade to staff table
            await db.query("DELETE FROM users WHERE id = $1", [userId]);
        } else {
            // Fallback for staff without users
            await db.query("DELETE FROM staff WHERE id = $1", [id]);
        }

        res.json({ message: 'Staff deleted successfully' });
    } catch (err) {
        console.error("Staff Delete Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/fees', async (req, res) => {
    const { year, section, student_id } = req.query;
    try {
        let query = `
            SELECT s.id as student_id, s.name, s.roll_no, s.department, s.year, s.section, 
                   f.total_fee, f.paid_amount, f.bus_fee, f.scholarship_amount,
                   COALESCE(f.status, 'Pending') as status,
                   f.payment_date, f.payment_mode, f.receipt_no,
                   f.scholarship_type, f.scholarship_details
            FROM students s
            LEFT JOIN fees f ON s.id = f.student_id AND (f.academic_year = (SELECT value FROM settings WHERE key = 'current_academic_year' LIMIT 1) OR f.academic_year IS NULL)
            WHERE 1=1
        `;
        const params = [];

        if (student_id) {
            params.push(student_id);
            query += ` AND (s.id::text = $${params.length} OR s.roll_no ILIKE $${params.length})`;
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
    const { student_id, total_fee, paid_amount, bus_fee, scholarship_amount, payment_date, payment_mode, receipt_no, status, scholarship_type, scholarship_details } = req.body;
    try {
        const academicYear = await getCurrentYear();

        // Find existing record for THIS year OR any legacy record for this student
        const check = await db.query(
            "SELECT * FROM fees WHERE student_id = $1 AND (academic_year = $2 OR academic_year IS NULL) LIMIT 1",
            [student_id, academicYear]
        );

        if (check.rows.length > 0) {
            await db.query(
                `UPDATE fees SET 
                    total_fee = $1, paid_amount = $2, payment_date = $3, 
                    payment_mode = $4, receipt_no = $5, status = $6,
                    scholarship_type = $8, scholarship_details = $9,
                    academic_year = $10, bus_fee = $11, scholarship_amount = $12
                WHERE id = $7`,
                [total_fee, paid_amount, payment_date, payment_mode, receipt_no, status, check.rows[0].id, scholarship_type, scholarship_details, academicYear, bus_fee, scholarship_amount]
            );
        } else {
            await db.query(
                `INSERT INTO fees (student_id, total_fee, paid_amount, payment_date, payment_mode, receipt_no, status, scholarship_type, scholarship_details, academic_year, bus_fee, scholarship_amount)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [student_id, total_fee, paid_amount, payment_date, payment_mode, receipt_no, status, scholarship_type, scholarship_details, academicYear, bus_fee, scholarship_amount]
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
            SELECT t.*, 
                   COALESCE(t.subject_name_text, s.subject_name) as subject_name, 
                   COALESCE(t.staff_name_text, st.name) as staff_name, 
                   s.subject_code,
                   t.subject_id as "subjectId", 
                   t.staff_id as "staffId",
                   t.subject_name_text as "subjectNameText",
                   t.staff_name_text as "staffNameText",
                   t.subject_code_text as "subjectCodeText",
                   t.subject_credit_text as "subjectCreditText"
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
                `INSERT INTO timetable (year, section, day, period, subject_id, staff_id, subject_name_text, staff_name_text, subject_code_text, subject_credit_text)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 ON CONFLICT (year, section, day, period)
                 DO UPDATE SET 
                    subject_id = EXCLUDED.subject_id, 
                    staff_id = EXCLUDED.staff_id,
                    subject_name_text = EXCLUDED.subject_name_text,
                    staff_name_text = EXCLUDED.staff_name_text,
                    subject_code_text = EXCLUDED.subject_code_text,
                    subject_credit_text = EXCLUDED.subject_credit_text`,
                [year, section, entry.day, entry.period, entry.subjectId || null, entry.staffId || null, entry.subjectNameText || null, entry.staffNameText || null, entry.subjectCodeText || null, entry.subjectCreditText || null]
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

app.delete('/api/timetable/subject', async (req, res) => {
    const { year, section, subjectName } = req.body;
    try {
        console.log(`Deleting subject '${subjectName}' for ${year}-${section}`);
        // Delete by subject name text match
        await db.query(
            "DELETE FROM timetable WHERE year = $1 AND section = $2 AND subject_name_text = $3",
            [year, section, subjectName]
        );
        res.json({ message: 'Subject entries deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start Server
// (Moved app.listen to the end of file)


app.get('/api/students', async (req, res) => {
    const { year, section, id, student_id } = req.query;
    try {
        let query = "SELECT * FROM students WHERE 1=1";
        const params = [];

        const targetId = id || student_id;

        if (targetId) {
            params.push(targetId);
            query += ` AND (id::text = $${params.length} OR roll_no ILIKE $${params.length})`;
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

// Specialized endpoint for Drivers - Limited fields for privacy
app.get('/api/students/bus-list', async (req, res) => {
    try {
        // Return name, roll_no, bus_no, starting_point, year, department, and driver_name
        const result = await db.query(
            "SELECT id, name, roll_no, bus_no, bus_starting_point, year, department, bus_driver_name FROM students WHERE bus_no IS NOT NULL AND bus_no != '' ORDER BY bus_no, roll_no"
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching student bus list:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 3. Add Student
app.post('/api/students', async (req, res) => {
    const {
        roll_no, name, year, section, email, phone, dob,
        bus_no, bus_driver_name, bus_driver_phone, bus_starting_point, bus_ending_point,
        emis_no, umis_no, aadhaar_no,
        father_name, mother_name, address, blood_group, religion, caste, nationality
    } = req.body;
    try {
        await db.query('BEGIN');

        const result = await db.query(
            `INSERT INTO students (
                roll_no, name, department, year, section, email, phone, dob, 
                bus_no, bus_driver_name, bus_driver_phone, bus_starting_point, bus_ending_point, 
                emis_no, umis_no, aadhaar_no,
                father_name, mother_name, address, blood_group, religion, caste, nationality
            ) VALUES ($1, $2, 'CSE', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $22, $15, $16, $17, $18, $19, $20, $21) RETURNING *`,
            [
                roll_no, name, year, section, email, phone, dob,
                bus_no, bus_driver_name, bus_driver_phone, bus_starting_point, bus_ending_point,
                emis_no, umis_no,
                father_name, mother_name, address, blood_group, religion, caste, nationality, aadhaar_no
            ]
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
    const {
        roll_no, name, year, section, email, phone, dob,
        bus_no, bus_driver_name, bus_driver_phone, bus_starting_point, bus_ending_point,
        emis_no, umis_no, aadhaar_no,
        father_name, mother_name, address, blood_group, religion, caste, nationality
    } = req.body;
    try {
        const result = await db.query(
            `UPDATE students SET 
                roll_no = $1, name = $2, year = $3, section = $4, email = $5, phone = $6, dob = $7, 
                bus_no = $8, bus_driver_name = $9, bus_driver_phone = $10, bus_starting_point = $11, bus_ending_point = $12, 
                emis_no = $14, umis_no = $15, aadhaar_no = $23,
                father_name = $16, mother_name = $17, address = $18, blood_group = $19, religion = $20, caste = $21, nationality = $22
            WHERE id = $13 RETURNING *`,
            [
                roll_no, name, year, section, email, phone, dob,
                bus_no, bus_driver_name, bus_driver_phone, bus_starting_point, bus_ending_point,
                id, emis_no, umis_no,
                father_name, mother_name, address, blood_group, religion, caste, nationality, aadhaar_no
            ]
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
        const notice = result.rows[0];

        // Notify all active users about the new notice asynchronously
        (async () => {
            try {
                const users = await db.query("SELECT id FROM users");
                for (const u of users.rows) {
                    await createNotification(u.id, 'New Notice', title, 'notice');
                }
            } catch (e) {
                console.error("Notice notification error:", e);
            }
        })();

        res.json(notice);
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
        const currentYear = await getCurrentYear();
        const result = await db.query("SELECT * FROM students WHERE academic_year = $1 OR status = 'Active' ORDER BY year, section, roll_no", [currentYear]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 7. Attendance Endpoints
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
                // We need to build a list of all period columns EXCEPT the current one
                const otherPeriods = [1, 2, 3, 4, 5, 6, 7, 8]
                    .filter(p => p !== period)
                    .map(p => `attendance.period_${p}`)
                    .join(', ');

                const academicYear = await getCurrentYear();
                const query = `
                    INSERT INTO attendance (student_id, date, status, ${periodCol}, academic_year) 
                    VALUES ($1, $2, $3, $3, $4) 
                    ON CONFLICT (student_id, date, academic_year) 
                    DO UPDATE SET 
                        ${periodCol} = EXCLUDED.${periodCol},
                        status = CASE 
                            WHEN EXCLUDED.${periodCol} = 'Absent' OR 'Absent' IN (${otherPeriods}) THEN 'Absent'
                            WHEN EXCLUDED.${periodCol} = 'On Duty' OR 'On Duty' IN (${otherPeriods}) THEN 'On Duty'
                            ELSE 'Present'
                        END
                `;

                await db.query(query, [studentId, date, status, academicYear]);
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
    const { year, section, month, student_id } = req.query;
    try {
        const currentYear = await getCurrentYear();
        let queryParams = [currentYear];
        let dateCondition = "";
        let whereConditions = ["a.academic_year = $1"];

        if (year) {
            queryParams.push(year);
            whereConditions.push(`s.year = $${queryParams.length}`);
        }
        if (section) {
            queryParams.push(section);
            whereConditions.push(`s.section = $${queryParams.length}`);
        }
        if (student_id) {
            queryParams.push(student_id);
            whereConditions.push(`(s.id::text = $${queryParams.length} OR s.roll_no ILIKE $${queryParams.length})`);
        }

        if (month) {
            queryParams.push(month);
            dateCondition = `AND EXTRACT(MONTH FROM a.date) = $${queryParams.length}`;
        }

        const whereClause = whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : "";

        const query = `
            SELECT 
                s.id, s.roll_no, s.name,
                COUNT(a.date) as total_days,
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
                SUM(CASE WHEN a.status = 'On Duty' THEN 1 ELSE 0 END) as od_days
            FROM students s
            LEFT JOIN attendance a ON s.id = a.student_id ${dateCondition}
            ${whereClause}
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

// --- MARKS ENDPOINTS ---

// Get marks for a specific class and subject
app.get('/api/marks', async (req, res) => {
    const { year, section, subject_code, student_id } = req.query;
    try {
        const currentYear = await getCurrentYear();
        // 1. Get Students (Filter by ID if provided, otherwise Year/Section)
        let sQuery = "SELECT id, name, roll_no, year FROM students WHERE academic_year = $1";
        const sParams = [currentYear];

        if (student_id) {
            sParams.push(student_id);
            sQuery += ` AND (id::text = $${sParams.length} OR roll_no ILIKE $${sParams.length})`;
        } else {
            if (year) { sParams.push(year); sQuery += ` AND year = $${sParams.length}`; }
            if (section) { sParams.push(section); sQuery += ` AND section = $${sParams.length}`; }
        }
        sQuery += " ORDER BY roll_no";

        const students = await db.query(sQuery, sParams);

        if (students.rows.length === 0) return res.json([]);

        // 2. Get Marks
        let mQuery = "SELECT m.*, s.subject_name FROM internal_marks m JOIN subjects s ON m.subject_code = s.subject_code WHERE m.academic_year = $1";
        const mParams = [currentYear];

        if (subject_code) {
            mParams.push(subject_code);
            mQuery += ` AND m.subject_code = $${mParams.length}`;
        }

        if (student_id) {
            mParams.push(student_id);
            mQuery += ` AND m.student_id = $${mParams.length}`;
        } else {
            if (year && section) {
                mParams.push(year);
                mParams.push(section);
                mQuery += ` AND m.student_id IN (SELECT id FROM students WHERE year = $${mParams.length - 1} AND section = $${mParams.length})`;
            }
        }

        const marks = await db.query(mQuery, mParams);

        // 3. Merge
        // If subject_code is provided, return student-centric list (original behavior)
        if (subject_code) {
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
            return res.json(result);
        } else {
            // If no subject_code, return mark-centric list (for "all subjects" view)
            // If it's a single student, return their subject-wise marks
            if (student_id && students.rows.length === 1) {
                // Return all subjects for this student
                const student = students.rows[0];
                const studentYear = parseInt(student.year);

                // Determine relevant semesters
                let yearSemesters = [1, 2, 3, 4, 5, 6, 7, 8]; // Default
                if (studentYear === 1) yearSemesters = [1, 2];
                else if (studentYear === 2) yearSemesters = [3, 4];
                else if (studentYear === 3) yearSemesters = [5, 6];
                else if (studentYear === 4) yearSemesters = [7, 8];

                const allSubjects = await db.query("SELECT * FROM subjects WHERE semester = ANY($1) ORDER BY subject_code", [yearSemesters]);

                const result = allSubjects.rows.map(sub => {
                    const markEntry = marks.rows.find(m => m.subject_code === sub.subject_code) || {};
                    return {
                        ...student,
                        subject_code: sub.subject_code,
                        subject_name: sub.subject_name,
                        ia1: markEntry.ia1 ?? '',
                        ia2: markEntry.ia2 ?? '',
                        ia3: markEntry.ia3 ?? '',
                        assign1: markEntry.assign1 ?? '',
                        assign2: markEntry.assign2 ?? '',
                        assign3: markEntry.assign3 ?? '',
                        assign4: markEntry.assign4 ?? ''
                    };
                });
                return res.json(result);
            } else {
                // If it's for a class, return everything (maybe not used yet, but good to have)
                // Flatten: Student Name, Subject Name, Marks
                const result = marks.rows.map(m => {
                    const student = students.rows.find(s => s.id === m.student_id);
                    return {
                        ...m,
                        name: student?.name,
                        roll_no: student?.roll_no
                    };
                });
                return res.json(result);
            }
        }
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
            const academicYear = await getCurrentYear();
            await db.query(`
                INSERT INTO internal_marks (student_id, subject_code, ia1, ia2, ia3, assign1, assign2, assign3, assign4, academic_year)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (student_id, subject_code, academic_year) 
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
                entry.assign4 || 0,
                academicYear
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
// (Redundant Login endpoint removed)


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
            { code: "CS3491_LAB", name: "AIML LABORATORY", sem: 4 },
            { code: "CS3461", name: "OPERATING SYSTEMS LABORATORY", sem: 4 },
            { code: "CS3481", name: "DBMS LABORATORY", sem: 4 },
            { code: "CS3401_LAB", name: "ALGORITHMS LABORATORY", sem: 4 },
            { code: "SOFTSKILL", name: "SOFTSKILL TRAINING", sem: 4 },
            { code: "CCS336", name: "SOFTWARE TESTING AND AUTOMATION", sem: 6 },
            { code: "CCS356", name: "OBJECT ORIENTED SOFTWARE ENGINEERING", sem: 6 },
            { code: "OBT352", name: "FOOD NUTRIENTS AND HEALTH", sem: 6 },
            { code: "CCS354", name: "NETWORK SECURITY", sem: 6 },
            { code: "CS3491_2", name: "EMBEDDED SYSTEMS AND IOT", sem: 6 },
            { code: "LAB4", name: "OBJECT ORIENTED SOFTWARE ENGINEERING LAB", sem: 6 },
            { code: "LIB", name: "LIBRARY", sem: 6 },
            { code: "SEM", name: "SEMINAR", sem: 6 },
            { code: "CO", name: "COUNSELING", sem: 6 },
            { code: "PL", name: "PLACEMENT", sem: 6 },
            { code: "NPTEL", name: "NPTEL", sem: 4 }
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
            { code: "CS3491_LAB", name: "AIML LABORATORY", sem: 4 },
            { code: "CS3461", name: "OPERATING SYSTEMS LABORATORY", sem: 4 },
            { code: "CS3481", name: "DBMS LABORATORY", sem: 4 },
            { code: "CS3401_LAB", name: "ALGORITHMS LABORATORY", sem: 4 },
            { code: "SOFTSKILL", name: "SOFTSKILL TRAINING", sem: 4 },
            { code: "CCS336", name: "SOFTWARE TESTING AND AUTOMATION", sem: 6 },
            { code: "CCS356", name: "OBJECT ORIENTED SOFTWARE ENGINEERING", sem: 6 },
            { code: "OBT352", name: "FOOD NUTRIENTS AND HEALTH", sem: 6 },
            { code: "CCS354", name: "NETWORK SECURITY", sem: 6 },
            { code: "CS3491_2", name: "EMBEDDED SYSTEMS AND IOT", sem: 6 },
            { code: "LAB4", name: "OBJECT ORIENTED SOFTWARE ENGINEERING LAB", sem: 6 },
            { code: "LIB", name: "LIBRARY", sem: 6 },
            { code: "SEM", name: "SEMINAR", sem: 6 },
            { code: "CO", name: "COUNSELING", sem: 6 },
            { code: "PL", name: "PLACEMENT", sem: 6 },
            { code: "NPTEL", name: "NPTEL", sem: 4 }
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

        // Year 2 (Sem 4) - Based on Image 1 (Section B)
        const patternYear2 = {
            'Monday': ['CS3401', 'CS3492', 'CS3452', 'CS3451', 'CS3401', 'CS3451', 'LAB3', 'CS3491'],
            'Tuesday': ['CS3452', 'NM', 'NM', 'NM', 'LAB1_AIML', 'LAB1_AIML', 'CS3452', 'CS3401'],
            'Wednesday': ['CS3492', 'GE3451', 'CS3491', 'CS3492', 'LAB1_ALG', 'LAB1_ALG', 'CS3452', 'NPTEL'],
            'Thursday': ['CS3451', 'CS3492', 'CS3401', 'CS3491', 'CS3452', 'LAB2', 'LAB2', 'LAB2'],
            'Friday': ['CS3491', 'CS3451', 'CS3492', 'GE3451', 'CS3451', 'LAB1', 'LAB1', 'LAB1']
        };

        // Year 3 (Sem 6) - Based on Image 3 (Section A)
        const patternYear3 = {
            'Monday': ['CCS336', 'CCS354', 'CCS336', 'CCS336', 'CO', 'NM', 'CCS356', 'CS3491_2'],
            'Tuesday': ['CS3491_2', 'CCS356', 'CCS336', 'LIB', 'CCS354', 'CCS336', 'CCS356', 'CS3491_2'],
            'Wednesday': ['CCS354', 'CCS336', 'CCS356', 'CS3491_2', 'CS3491_2', 'CCS336', 'SEM', 'LAB4'],
            'Thursday': ['LIB', 'CCS354', 'CS3491_2', 'CCS336', 'CCS336', 'CO', 'CS3491_2', 'CCS356'],
            'Friday': ['CCS356', 'CCS336', 'CCS354', 'LIB', 'PL', 'CCS336', 'CCS336', 'OBT352']
        };

        const staffMap = {
            'CS3452': 'EDWIN', 'CS3491': 'STEPHY', 'CS3451': 'RAJU',
            'CS3401': 'SAHAYA', 'CS3492': 'MONISHA', 'GE3451': 'JEBA',
            'NM': 'DHANYA', 'LAB1': 'MONISHA', 'LAB2': 'RAJU', 'LAB3': 'Bobby',
            'NPTEL': 'MONISHA',

            'CCS336': 'BINISHA', 'CCS356': 'SHEEBA', 'OBT352': 'ARUN VENKADESH',
            'CCS354': 'RAJA', 'CS3491_2': 'ABISHA', 'CS3691': 'ABISHA',
            'LAB4': 'ANTO', 'LIB': 'Demo Staff', 'SEM': 'Demo Staff',
            'CO': 'Demo Staff', 'PL': 'Demo Staff'
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
    const { roll_no, dob, year, section } = req.body;
    console.log('Student Login Attempt:', { roll_no, dob, year, section });

    try {
        // Match roll_no and dob
        const result = await db.query(
            "SELECT * FROM students WHERE roll_no ILIKE $1 AND dob = $2 AND year = $3 AND section = $4",
            [roll_no.trim(), dob, year, section]
        );

        if (result.rows.length === 0) {
            console.log("Student login failed: No match found");
            return res.status(401).json({ message: 'Student details not found or DOB is incorrect.' });
        }

        const student = result.rows[0];
        console.log("Student login success:", student.name);

        res.json({
            message: 'Login successful',
            user: {
                id: student.user_id || 0,
                username: student.roll_no,
                role: 'student',
                profileId: student.id,
                name: student.name,
                roll_no: student.roll_no,
                email: student.email,
                phone: student.phone,
                dob: student.dob,
                year: student.year,
                section: student.section,
                department: student.department || 'CSE'
            }
        });
    } catch (err) {
        console.error("Student Login Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- NO DUE MODULE ---
// --- NO DUE MODULE ---
app.post('/api/no-due/request', async (req, res) => {
    const { student_id, semester } = req.body;
    try {
        console.log(`No Due Request: Student ${student_id}, Sem ${semester}`);

        if (!student_id || !semester) {
            return res.status(400).json({ message: 'Missing student ID or semester' });
        }

        // Cleanup ghost requests (where student_id might have been null previously)
        await db.query("DELETE FROM no_dues WHERE student_id IS NULL");

        // UPSERT: Insert or Update if exists
        const query = `
            INSERT INTO no_dues (student_id, semester, office_status, librarian_status, created_at)
            VALUES ($1, $2, 'Pending', 'Pending', NOW())
            ON CONFLICT (student_id, semester) 
            DO UPDATE SET 
                office_status = 'Pending', 
                created_at = NOW() -- optional: bump timestamp
            RETURNING *;
        `;

        const result = await db.query(query, [student_id, semester]);

        if (result.rows.length > 0) {
            const row = result.rows[0];
            console.log("Request Processed:", row.id);

            // Fetch student details for notification
            const studentRes = await db.query("SELECT name, roll_no FROM students WHERE id = $1", [student_id]);

            if (studentRes.rows.length > 0) {
                const { name, roll_no } = studentRes.rows[0];

                // Fetch all office users
                const officeUsers = await db.query("SELECT id FROM users WHERE role = 'office'");

                // Notify each office user
                for (const user of officeUsers.rows) {
                    await createNotification(
                        user.id,
                        'New No Due Request',
                        `Student ${name} (${roll_no}) has requested No Due clearance.`,
                        'info'
                    );
                }
                console.log(`Notified ${officeUsers.rows.length} Office users.`);
            }
        }

        res.json({ message: 'Request submitted successfully' });
    } catch (err) {
        console.error("No Due Request Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/no-due', async (req, res) => {
    const { student_id, role, year, section, profile_id } = req.query;
    try {
        let query = `
            SELECT 
                nd.*, 
                nd.status as nodue_overall_status,
                COALESCE(nd.created_at, s.created_at) as created_at,
                s.name, s.roll_no, s.year, s.section, s.department,
                f.total_fee, f.paid_amount, f.status as fee_status,
                f.scholarship_type, f.scholarship_details, f.scholarship_amount,
                (
                    SELECT JSON_AGG(JSON_BUILD_OBJECT('title', b.title, 'due_date', bi.due_date))
                    FROM book_issues bi
                    JOIN books b ON bi.book_id = b.id
                    WHERE bi.student_id = s.id AND bi.status = 'Issued'
                ) as library_pending_books
            FROM students s
            LEFT JOIN no_dues nd ON s.id = nd.student_id
            LEFT JOIN fees f ON s.id = f.student_id AND f.academic_year = (SELECT value FROM settings WHERE key = 'current_academic_year' LIMIT 1)
            WHERE 1=1
        `;
        const params = [];

        if (student_id) {
            params.push(student_id);
            query += ` AND (s.id::text = $${params.length} OR s.roll_no ILIKE $${params.length})`;
        }

        if (year) {
            params.push(year);
            query += ` AND s.year = $${params.length}`;
        }
        if (section) {
            params.push(section);
            query += ` AND s.section = $${params.length}`;
        }

        // Staff Filtering: Only show students for whom the staff member has subjects in the timetable
        if (role === 'staff' && profile_id) {
            params.push(profile_id);
            // Relaxed check: Staff can see if they are linked via ID OR Name in the timetable for that class
            // Handles missing or differing prefixes (e.g., Mr. ARUN VENKADESH vs Mrs. Arun Venkadesh)
            query += ` 
                AND (s.year, s.section) IN (
                    SELECT DISTINCT t.year, t.section 
                    FROM timetable t 
                    LEFT JOIN staff st ON t.staff_id = st.id
                    WHERE t.staff_id = $${params.length} 
                    OR t.staff_name_text = (SELECT name FROM staff WHERE id = $${params.length})
                    OR LOWER(t.staff_name_text) LIKE '%' || SPLIT_PART((SELECT LOWER(name) FROM staff WHERE id = $${params.length}), ' ', 2) || '%'
                )
                AND nd.office_status = 'Approved'
            `;
        }

        if (role === 'student' && !student_id) {
            return res.json([]);
        }

        query += ` 
            ORDER BY 
                CASE WHEN nd.status IS NULL THEN 1 ELSE 0 END,
                nd.created_at DESC NULLS LAST, 
                s.roll_no ASC
        `;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error("No Due Report Error:", err);
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
            else if (stage === 'librarian') updateField = 'librarian_status';
            else if (stage === 'hod') updateField = 'hod_status';
            else if (stage === 'principal') updateField = 'principal_status';
        }

        console.log("Determined updateField:", updateField);

        // Looser validation: allow any field that is either a standard stage or ends with _status
        const isStandardStage = ['office_status', 'staff_status', 'librarian_status', 'hod_status', 'principal_status'].includes(updateField);
        const isSubjectStatus = updateField.endsWith('_status');

        if (!updateField || (!isStandardStage && !isSubjectStatus)) {
            console.log("❌ Invalid field/stage error");
            console.log("❌ Received updateField:", updateField);
            return res.status(400).json({
                message: 'Invalid field/stage',
                received: updateField,
                details: "Field must be a standard stage or end with _status"
            });
        }

        // Validate status
        if (!status || !['Approved', 'Rejected'].includes(status)) {
            console.log("❌ Invalid status:", status);
            return res.status(400).json({ message: 'Invalid status', received: status });
        }

        // --- ENFORCE SEQUENTIAL APPROVAL ---
        const currentCheck = await db.query("SELECT * FROM no_dues WHERE id = $1", [id]);
        if (currentCheck.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
        const requestRow = currentCheck.rows[0];

        if (status === 'Approved') {
            if (updateField === 'staff_status') {
                if (requestRow.office_status !== 'Approved') {
                    return res.status(400).json({ message: 'Cannot approve Staff stage before Office approval' });
                }
                if (requestRow.staff_status !== 'Approved') {
                    return res.status(400).json({ message: 'Cannot approve HOD stage before Staff approval' });
                }
                if (requestRow.librarian_status !== 'Approved') {
                    return res.status(400).json({ message: 'Cannot approve HOD stage before Librarian approval' });
                }
            } else if (updateField === 'librarian_status') {
                if (requestRow.office_status !== 'Approved') {
                    return res.status(400).json({ message: 'Cannot approve Librarian stage before Office approval' });
                }
            } else if (updateField === 'principal_status') {
                if (requestRow.hod_status !== 'Approved') {
                    return res.status(400).json({ message: 'Cannot approve Principal stage before HOD approval' });
                }
            } else if (updateField.endsWith('_status') && !isStandardStage) {
                // Subject wise approval
                if (requestRow.office_status !== 'Approved') {
                    return res.status(400).json({ message: 'Cannot approve subjects before Office approval' });
                }
            }
        }

        // Update status and remarks
        try {
            // Dynamic column check: Ensure the column exists before updating
            if (updateField.endsWith('_status') && !['office_status', 'staff_status', 'hod_status', 'principal_status'].includes(updateField)) {
                // Wrap in double quotes for SQL safety
                await db.query(`ALTER TABLE no_dues ADD COLUMN IF NOT EXISTS "${updateField}" VARCHAR(20) DEFAULT 'Pending'`);
                console.log(`Verified column "${updateField}" exists in no_dues table.`);
            }

            // Wrap column name in double quotes to handle names starting with numbers or other special cases
            const updateQuery = `UPDATE no_dues SET "${updateField}" = $1, remarks = COALESCE($2, remarks) WHERE id = $3`;
            console.log("Executing query:", updateQuery);
            console.log("Query params:", [status, remarks || null, id]);

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
        const studentUserId = await getUserFromStudent(r.student_id);

        if (status === 'Rejected') {
            await db.query("UPDATE no_dues SET status = 'Rejected' WHERE id = $1", [id]);
            console.log("Status set to Rejected");
        } else {
            // 1. Office Approved -> Notify Staff & Student
            if (updateField === 'office_status' && status === 'Approved') {
                await createNotification(studentUserId, 'No Due Update', 'Office has approved your No Due request. Now awaiting Subject Staff approvals.', 'info');

                // Get Staffs for this class from timetable
                const studRes = await db.query(`SELECT year, section FROM students WHERE id = $1`, [r.student_id]);
                if (studRes.rows.length > 0) {
                    const { year, section } = studRes.rows[0];
                    const staffRes = await db.query(`
                        SELECT DISTINCT st.user_id 
                        FROM timetable t
                        JOIN staff st ON t.staff_id = st.id
                        WHERE t.year = $1 AND t.section = $2
                        AND st.user_id IS NOT NULL
                    `, [year, section]);

                    for (const row of staffRes.rows) {
                        try {
                            if (row.user_id) {
                                await createNotification(
                                    row.user_id,
                                    'No Due Request',
                                    `Clearance request for Class ${year}-${section} is ready for subject approval.`,
                                    'info'
                                ).catch(e => console.error("Notification push failed (non-fatal):", e.message));
                            }
                        } catch (notifErr) {
                            console.error("Failed to notify staff (non-fatal):", notifErr);
                        }
                    }
                }

                // Notify Librarian
                const librarianUsers = await db.query("SELECT id FROM users WHERE role = 'librarian'");
                for (const row of librarianUsers.rows) {
                    try {
                        await createNotification(
                            row.id,
                            'No Due Request',
                            `Clearance request for Student ${r.student_id} is ready for library approval.`,
                            'info'
                        ).catch(e => console.error("Notification push failed (non-fatal):", e.message));
                    } catch (libErr) {
                    }
                }
            }

            // 2. Subject Approval -> Check if All Relevant Subjects are Done
            const isSubjectField = updateField.endsWith('_status') && !['office_status', 'staff_status', 'hod_status', 'principal_status', 'status'].includes(updateField);

            if (status === 'Approved' && isSubjectField) {
                // Get relevant subjects for THIS student's year/section
                const studInfo = await db.query("SELECT year, section FROM students WHERE id = $1", [r.student_id]);
                if (studInfo.rows.length > 0) {
                    const { year, section } = studInfo.rows[0];

                    // Fetch subjects from timetable (matching frontend filtering logic)
                    const subjectsRes = await db.query(`
                        SELECT DISTINCT 
                            COALESCE(s.subject_code, 'MANUAL') as subject_code, 
                            COALESCE(s.subject_name, t.subject_name_text) as subject_name
                        FROM timetable t 
                        LEFT JOIN subjects s ON t.subject_id = s.id 
                        WHERE t.year = $1 AND t.section = $2
                    `, [year, section]);

                    const filteredSubjects = subjectsRes.rows.filter(sub => {
                        const name = sub.subject_name.toLowerCase();
                        return !name.includes('soft skill') && !name.includes('softskill') && !name.includes('nptel');
                    });

                    const relevantFields = filteredSubjects.map(sub => {
                        // Fallback for manual subjects: generate key from name
                        const code = sub.subject_code !== 'MANUAL' ? sub.subject_code : (sub.subject_name || 'unknown');
                        return code.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_status';
                    });

                    console.log(`Checking completion for student (${year}-${section}). Relevant subjects:`, relevantFields);

                    const allApproved = relevantFields.every(f => r[f] === 'Approved' || f === updateField); // include current if not yet updated in 'r'

                    if (allApproved && relevantFields.length > 0) {
                        // Update overall staff_status to Approved
                        await db.query("UPDATE no_dues SET staff_status = 'Approved' WHERE id = $1", [id]);
                        console.log("Overall staff_status updated to Approved (Timetable-based check)");

                        // CHECK LIBRARIAN STATUS TOO BEFORE NOTIFYING HOD
                        const updatedRow = (await db.query("SELECT * FROM no_dues WHERE id = $1", [id])).rows[0];

                        if (updatedRow.librarian_status === 'Approved') {
                            await createNotification(studentUserId, 'No Due Update', 'All subject staffs and Librarian have approved. Sent to HOD.', 'info');

                            // Notify HOD
                            const hodRes = await db.query("SELECT id FROM users WHERE role = 'hod'");
                            for (const row of hodRes.rows) {
                                await createNotification(
                                    row.id,
                                    'No Due Request',
                                    `All subjects and Library approved for a student. HOD approval pending.`,
                                    'info'
                                );
                            }
                        } else {
                            await createNotification(studentUserId, 'No Due Update', 'All subject staffs have approved. Waiting for Librarian.', 'info');
                        }
                    }
                }
            }

            // 2.5 Librarian Approval -> Check if Staff is also done
            if (updateField === 'librarian_status' && status === 'Approved') {
                if (r.staff_status === 'Approved') {
                    await createNotification(studentUserId, 'No Due Update', 'Librarian and all staffs have approved. Sent to HOD.', 'info');
                    // Notify HOD
                    const hodRes = await db.query("SELECT id FROM users WHERE role = 'hod'");
                    for (const row of hodRes.rows) {
                        await createNotification(
                            row.id,
                            'No Due Request',
                            `Librarian and all subjects approved for a student. HOD approval pending.`,
                            'info'
                        );
                    }
                } else {
                    await createNotification(studentUserId, 'No Due Update', 'Librarian has approved. Waiting for subject staff approvals.', 'info');
                }
            }

            // 3. HOD Approved -> Notify Principal & Student
            if (updateField === 'hod_status' && status === 'Approved') {
                await createNotification(studentUserId, 'No Due Update', 'HOD has approved. Sent to Principal.', 'info');

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

            // 4. Principal Approved -> Notify Student (Final)
            if (updateField === 'principal_status' && status === 'Approved') {
                await createNotification(studentUserId, 'No Due Complete', 'Principal has approved! Your No Due Certificate is ready.', 'success');
                // Also Update Final Status
                await db.query("UPDATE no_dues SET status = 'Completed' WHERE id = $1", [id]);
            }
        }

        console.log("✅ Sending success response");
        res.json({ message: 'Updated successfully', field: updateField, status });
    } catch (err) {
        console.error("❌ No Due Approval Critical Error:", err);
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        console.error("Error Stack:", err.stack);

        // Return the specific error to the client for debugging
        res.status(500).json({
            message: `Server Error: ${err.message}`,
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// --- STUDENT OD ENDPOINTS ---
app.post('/api/od/apply', async (req, res) => {
    const { student_id, date_from, date_to, reason, no_of_days, hours, od_type } = req.body;
    try {
        console.log('OD Apply Request:', { student_id, od_type, no_of_days, hours });

        // Logic: Hour -> Staff, 1 Day -> HOD, >1 Day -> Principal
        let pendingWith = 'staff';
        if (od_type === 'Hour') {
            pendingWith = 'staff';
        } else {
            const daysCount = parseFloat(no_of_days || 0);
            if (daysCount === 1) {
                pendingWith = 'hod';
            } else if (daysCount > 1) {
                pendingWith = 'principal';
            } else {
                pendingWith = 'staff';
            }
        }

        const effectiveDateTo = (od_type === 'Hour' || !date_to) ? date_from : date_to;

        // --- Overlap Check: Prevent multiple ODs for the same date/time ---
        const existingOD = await db.query(
            `SELECT * FROM student_od 
             WHERE student_id = $1 
             AND status != 'Rejected' 
             AND date_from <= $2 
             AND date_to >= $3`,
            [student_id, effectiveDateTo, date_from]
        );

        if (existingOD.rows.length > 0) {
            const conflict = existingOD.rows[0];
            const conflictType = conflict.od_type;
            const fromStr = new Date(conflict.date_from).toLocaleDateString();
            const toStr = new Date(conflict.date_to).toLocaleDateString();

            return res.status(400).json({
                message: `Overlap detected! You already have a ${conflictType} OD request for this period (${fromStr} - ${toStr}). Current status: ${conflict.status}. Duplicate requests are not allowed.`
            });
        }

        const sanitizedData = [
            student_id,
            date_from || null,
            effectiveDateTo || null,
            reason || null,
            (no_of_days === "" || no_of_days === undefined) ? null : no_of_days,
            (hours === "" || hours === undefined) ? null : hours,
            od_type || 'Day',
            pendingWith
        ];

        const result = await db.query(
            "INSERT INTO student_od (student_id, date_from, date_to, reason, no_of_days, hours, od_type, pending_with) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            sanitizedData
        );

        const newOD = result.rows[0];
        console.log('OD Created Successfully:', newOD.id);

        // --- Notification Logic (Wrapped in try-catch to avoid failing the main request) ---
        try {
            if (pendingWith === 'staff') {
                // Find Class Incharge from class_details
                const stud = await db.query("SELECT year, section FROM students WHERE id = $1", [student_id]);
                if (stud.rows.length > 0) {
                    const { year, section } = stud.rows[0];
                    const inchargeRes = await db.query(
                        "SELECT staff_id FROM class_details WHERE year = $1 AND UPPER(TRIM(section)) = UPPER(TRIM($2))",
                        [year, section]
                    );
                    if (inchargeRes.rows.length > 0) {
                        const staffProfileId = inchargeRes.rows[0].staff_id;
                        // Find the name of this incharge to notify ALL their linked accounts
                        const staffNameRes = await db.query("SELECT name FROM staff WHERE id = $1", [staffProfileId]);
                        if (staffNameRes.rows.length > 0) {
                            const staffName = staffNameRes.rows[0].name;
                            // Notify ALL accounts with this name (case-insensitive) that have a linked user_id
                            const allStaffAccounts = await db.query(
                                "SELECT user_id FROM staff WHERE UPPER(TRIM(name)) = UPPER(TRIM($1)) AND user_id IS NOT NULL",
                                [staffName]
                            );
                            for (const staffRow of allStaffAccounts.rows) {
                                await createNotification(staffRow.user_id, 'New OD Request', `A student in your class has applied for ${od_type} OD.`, 'od');
                            }

                        }
                    }

                }
            } else {
                const usersToNotify = await db.query("SELECT id as user_id FROM users WHERE role = $1", [pendingWith]);
                for (const user of usersToNotify.rows) {
                    await createNotification(
                        user.user_id,
                        'New OD Request',
                        `A new OD request requires ${pendingWith} approval.`,
                        'od'
                    );
                }
            }
        } catch (notifErr) {
            console.error("Delayed Notification Error (Request still succeeded):", notifErr.message);
            // We don't throw here, the OD is already saved.
        }

        res.json({ message: 'OD Request submitted successfully', pending_with: pendingWith, id: newOD.id });
    } catch (err) {
        console.error("OD Apply Error:", err);
        res.status(500).json({
            message: 'Server error: ' + err.message,
            details: err.message,
            hint: 'Database insertion or lookup failed before notification.'
        });
    }
});


app.get('/api/od', async (req, res) => {
    const { student_id, role, profile_id } = req.query;
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

        // Filtering Logic for Staff/HOD/Principal
        if (['staff', 'hod', 'principal'].includes(role) && profile_id) {
            const staffRes = await db.query("SELECT name FROM staff WHERE id = $1", [profile_id]);
            const staffName = staffRes.rows.length > 0 ? staffRes.rows[0].name : null;

            let conditions = [];

            // 1. Visibility for Incharge (Match by name to handle duplicates)
            if (staffName) {
                params.push(staffName);
                conditions.push(`(s.year, UPPER(TRIM(s.section))) IN (
                    SELECT cd.year, UPPER(TRIM(cd.section)) 
                    FROM class_details cd
                    JOIN staff st ON cd.staff_id = st.id
                    WHERE UPPER(TRIM(st.name)) = UPPER(TRIM($${params.length}))
                )`);

            } else {
                params.push(profile_id);
                conditions.push(`(s.year, UPPER(TRIM(s.section))) IN (SELECT year, UPPER(TRIM(section)) FROM class_details WHERE staff_id = $${params.length})`);
            }

            // 2. Global pending visibility based on role
            if (role === 'hod') conditions.push("od.pending_with = 'hod'");
            else if (role === 'principal') conditions.push("od.pending_with = 'principal'");

            query += ` AND (${conditions.join(' OR ')})`;
        }


        query += " ORDER BY od.created_at DESC";
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error("OD Fetch Error:", err);
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
            SELECT DISTINCT 
                COALESCE(s.subject_code, 'MANUAL') as subject_code, 
                COALESCE(s.subject_name, t.subject_name_text) as subject_name, 
                COALESCE(st.name, t.staff_name_text) as staff_name, 
                st.id as staff_profile_id, 
                s.credits
            FROM timetable t
            LEFT JOIN subjects s ON t.subject_id = s.id
            LEFT JOIN staff st ON t.staff_id = st.id
            WHERE t.year = $1 AND t.section = $2
            AND (s.id IS NOT NULL OR t.subject_name_text IS NOT NULL)
            ORDER BY subject_code
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

// OTP Store use already required modules


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
// --- LOGIN & AUTH ---
app.post('/api/login', async (req, res) => {
    console.log("HIT /api/login");
    const { username, password, role } = req.body;

    // Emergency manual check
    if (username === 'admin' && password === 'admin123') {
        console.log("Using Manual Admin Login");
        return res.json({
            message: 'Login successful',
            user: { username: 'admin', role: role || 'admin', id: 1 }
        });
    }

    if (username === 'DMI drivers' && password === 'dmidriver@') {
        console.log("Using Manual Driver Login");
        return res.json({
            message: 'Login successful',
            user: { username: 'DMI drivers', role: 'driver', id: 9999 }
        });
    }

    try {
        // 1. Try Standard User Login
        const result = await db.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            if (user.password !== password) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            let profileId = null;
            let year = null;
            let section = null;
            let name = null;
            if (user.role === 'student') {
                const sRes = await db.query("SELECT id, name, year, section FROM students WHERE user_id = $1", [user.id]);
                if (sRes.rows.length > 0) {
                    profileId = sRes.rows[0].id;
                    name = sRes.rows[0].name;
                    year = sRes.rows[0].year?.toString().trim();
                    section = sRes.rows[0].section?.toString().trim().toUpperCase();
                }
            } else if (['staff', 'hod', 'principal', 'office'].includes(user.role)) {
                const stRes = await db.query("SELECT id, name FROM staff WHERE user_id = $1", [user.id]);
                if (stRes.rows.length > 0) {
                    profileId = stRes.rows[0].id;
                    name = stRes.rows[0].name;
                }
            }

            return res.json({
                message: 'Login successful',
                user: { ...user, profileId, name, year, section }
            });
        }

        // 2. Fallback: Staff Legacy Login (StaffID + Name)
        if (['staff', 'hod', 'principal', 'office'].includes(role)) {
            console.log(`[Staff Legacy Login] Attempting for StaffID: '${username}' with Name: '${password}'`);

            // Allow optional college code prefix 9606
            let cleanId = username.trim();
            if (cleanId.startsWith('9606')) {
                cleanId = cleanId.substring(4);
            }

            const staffRes = await db.query("SELECT * FROM staff WHERE LOWER(staff_id) = LOWER($1) OR LOWER(staff_id) = LOWER($2)", [username.trim(), cleanId]);
            if (staffRes.rows.length > 0) {
                const staff = staffRes.rows[0];
                const normalize = (str) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

                const nInput = normalize(password);
                const nDb = normalize(staff.name);

                console.log(`[Staff Legacy Login] Comparing Normalized: Input='${nInput}', DB='${nDb}'`);

                if (nDb === nInput || nDb.includes(nInput) || nInput.includes(nDb)) {
                    console.log("Staff Legacy Login Success:", staff.name);
                    return res.json({
                        message: 'Login successful',
                        user: {
                            id: staff.user_id || (88000 + staff.id),
                            username: staff.staff_id,
                            role: role,
                            profileId: staff.id,
                            name: staff.name,
                            department: staff.department
                        }
                    });
                }
            }
        }

        // 3. Fallback: Legacy Student Login (Check students table directly)
        // ONLY if role is student to avoid casting errors with staff names into DOB dates
        if (role === 'student') {
            console.log("Checking Legacy Student Login:", username);
            const sRes = await db.query("SELECT * FROM students WHERE roll_no = $1 AND dob = $2", [username, password]);

            if (sRes.rows.length > 0) {
                const student = sRes.rows[0];
                console.log("Legacy Student Found:", student.name);

                // Create a virtual user object
                return res.json({
                    message: 'Login successful',
                    user: {
                        id: student.user_id || 999999, // Fallback ID if not linked
                        username: student.roll_no,
                        role: 'student',
                        profileId: student.id, // THE MOST IMPORTANT FIELD
                        is_legacy: true,
                        name: student.name,
                        year: student.year?.toString().trim(),
                        section: student.section?.toString().trim().toUpperCase()
                    }
                });
            }
        }

        console.log("User not found in DB (Standard or Legacy)");
        return res.status(401).json({ message: 'Invalid credentials' });

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

// --- CLASS DETAILS ---
app.get('/api/class-details', async (req, res) => {
    let { year, section } = req.query;
    if (!year || !section) return res.json({});

    try {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[istTime.getDay()];
        const hours = istTime.getHours();
        const minutes = istTime.getMinutes();
        const timeVal = hours * 60 + minutes;

        let currentPeriod = 0;
        if (timeVal >= 525 && timeVal < 600) currentPeriod = 1;
        else if (timeVal >= 600 && timeVal < 650) currentPeriod = 2;
        else if (timeVal >= 660 && timeVal < 710) currentPeriod = 3;
        else if (timeVal >= 710 && timeVal < 765) currentPeriod = 4;
        else if (timeVal >= 810 && timeVal < 860) currentPeriod = 5;
        else if (timeVal >= 860 && timeVal < 910) currentPeriod = 6;
        else if (timeVal >= 910 && timeVal < 960) currentPeriod = 7;
        else if (timeVal >= 960 && timeVal < 1010) currentPeriod = 8;

        const result = await db.query(
            `SELECT DISTINCT ON (cd.id)
                    cd.*, s.name as in_charge_name, s.phone_number as in_charge_phone,
                    fa.status as attendance_status,
                    t.year as current_year,
                    t.section as current_section
             FROM class_details cd
             LEFT JOIN staff s ON cd.staff_id = s.id
             LEFT JOIN faculty_attendance fa ON s.id = fa.staff_id AND fa.date = CURRENT_DATE
             LEFT JOIN timetable t ON s.id = t.staff_id AND t.day = $1 AND t.period = $2
             WHERE TRIM(cd.year::text) = TRIM($3::text) AND TRIM(LOWER(cd.section)) = TRIM(LOWER($4))
             ORDER BY cd.id`,
            [currentDay, currentPeriod, year.toString(), section]
        );

        if (result.rows.length > 0) {
            const row = result.rows[0];
            let status = 'In Staffroom';
            if (row.attendance_status === 'Absent') status = 'Absent';
            else if (row.current_year) status = `In Class (${row.current_year}${row.current_section})`;
            else if (row.attendance_status === 'On Duty') status = 'On Duty';

            row.live_status = status;
            res.json(row);
        } else {
            res.json({});
        }
    } catch (err) {
        console.error("Class Details Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- PUSH NOTIFICATION SUBSCRIPTION ---
app.post('/api/notifications/subscribe', async (req, res) => {
    const { userId, subscription } = req.body;
    try {
        if (!userId || !subscription) {
            return res.status(400).json({ message: 'Missing userId or subscription' });
        }

        // Check if subscription already exists for this user to avoid duplicates
        const check = await db.query(
            "SELECT id FROM push_subscriptions WHERE user_id = $1 AND subscription = $2",
            [userId, JSON.stringify(subscription)]
        );

        if (check.rows.length === 0) {
            await db.query(
                "INSERT INTO push_subscriptions (user_id, subscription) VALUES ($1, $2)",
                [userId, JSON.stringify(subscription)]
            );
        }

        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (err) {
        console.error("Subscription Error:", err);
        res.status(500).json({ message: 'Failed to subscribe' });
    }
});

// TEST PUSH
app.post('/api/test-push', async (req, res) => {
    const { userId, title, message } = req.body;
    try {
        await createNotification(userId, title || 'Test Notification', message || 'This is a test push notification from ERP!');
        res.json({ message: 'Push sent' });
    } catch (err) {
        res.status(500).json({ message: 'Failed', error: err.message });
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

// --- DEPLOYMENT CONFIGURATION MOVED TO BOTTOM ---


// --- NEW AUTH FLOW (Mobile -> OTP -> Password) ---

// 1. Check User & Status
app.post('/api/auth/check-user', async (req, res) => {
    const { role, phone } = req.body;
    console.log("Auth Check Request:", { role, phone });

    try {
        if (!role || !phone) {
            return res.status(400).json({ message: 'Missing role or phone number' });
        }

        const roleLower = role.toLowerCase();

        const result = await db.query(`
            SELECT u.id, u.username, u.role, u.is_setup
            FROM users u
            JOIN staff s ON u.id = s.user_id
            WHERE s.phone = $1 AND u.role = $2
        `, [phone, roleLower]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No ${role} account found with mobile number ${phone}` });
        }

        const user = result.rows[0];

        if (!user.is_setup) {
            console.log(`Sending OTP to ${phone} for User ${user.username}`);
            res.json({ status: 'SETUP_REQUIRED', userId: user.id, message: 'OTP Sent successfully' });
        } else {
            res.json({ status: 'PASSWORD_REQUIRED', userId: user.id });
        }

    } catch (err) {
        console.error("Check-User Error:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// 2. Verify OTP (Mock)
app.post('/api/auth/verify-otp', async (req, res) => {
    const { userId, otp } = req.body;
    if (otp === '123456') {
        res.json({ verified: true });
    } else {
        res.status(400).json({ verified: false, message: 'Invalid OTP' });
    }
});

// 3. Set/Reset Password
app.post('/api/auth/setup-password', async (req, res) => {
    const { userId, password } = req.body;
    try {
        await db.query("UPDATE users SET password = $1, is_setup = TRUE WHERE id = $2", [password, userId]);
        res.json({ success: true, message: 'Password set successfully. Please login.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error setting password' });
    }
});

// 4. Login via Phone (Alternative to Username login)
app.post('/api/auth/login-phone', async (req, res) => {
    const { phone, role, password } = req.body;
    try {
        const result = await db.query(`
            SELECT u.* 
            FROM users u
            JOIN staff s ON u.id = s.user_id
            WHERE s.phone = $1 AND u.role = $2
        `, [phone, role.toLowerCase()]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid Password' });
        }

        // Fetch Profile ID
        const profileRes = await db.query("SELECT id FROM staff WHERE user_id = $1", [user.id]);
        const profileId = profileRes.rows[0]?.id;

        res.json({
            message: 'Login successful',
            user: { ...user, profileId }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Bus Tracking System ---

// 1. Get List of Buses
app.get('/api/bus', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM bus ORDER BY bus_number");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add New Bus
app.post('/api/bus', async (req, res) => {
    const { bus_number, driver_name, driver_phone, starting_point, ending_point, photo_data, registration_number, route_pdf } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO bus (bus_number, driver_name, driver_phone, starting_point, ending_point, photo_data, registration_number, route_pdf) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [bus_number, driver_name, driver_phone, starting_point, ending_point, photo_data, registration_number, route_pdf]
        );
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ message: 'Bus number already exists' });
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Bus
app.put('/api/bus/:id', async (req, res) => {
    const { id } = req.params;
    const { bus_number, driver_name, driver_phone, starting_point, ending_point, photo_data, registration_number, route_pdf } = req.body;
    try {
        const result = await db.query(
            "UPDATE bus SET bus_number = $1, driver_name = $2, driver_phone = $3, starting_point = $4, ending_point = $5, photo_data = $7, registration_number = $8, route_pdf = $9 WHERE id = $6 RETURNING *",
            [bus_number, driver_name, driver_phone, starting_point, ending_point, id, photo_data, registration_number, route_pdf]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Bus
app.delete('/api/bus/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM bus WHERE id = $1", [id]);
        res.json({ message: 'Bus deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Library System ---

// Books CRUD
app.get('/api/library/books', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = "SELECT * FROM books WHERE 1=1";
        const params = [];

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (title ILIKE $${params.length} OR author ILIKE $${params.length} OR isbn ILIKE $${params.length})`;
        }

        if (category && category !== 'All') {
            params.push(category);
            query += ` AND category = $${params.length}`;
        }

        query += " ORDER BY title";
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/library/books', async (req, res) => {
    const { title, author, isbn, category, total_copies, shelf_location } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO books (title, author, isbn, category, total_copies, available_copies, shelf_location) VALUES ($1, $2, $3, $4, $5, $5, $6) RETURNING *",
            [title, author, isbn, category, total_copies, shelf_location]
        );
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ message: 'ISBN already exists' });
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/library/books/:id', async (req, res) => {
    const { id } = req.params;
    const { title, author, isbn, category, total_copies, shelf_location } = req.body;
    try {
        const result = await db.query(
            "UPDATE books SET title = $1, author = $2, isbn = $3, category = $4, total_copies = $5, shelf_location = $6 WHERE id = $7 RETURNING *",
            [title, author, isbn, category, total_copies, shelf_location, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/library/books/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM books WHERE id = $1", [req.params.id]);
        res.json({ message: 'Book deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Issue & Return
app.post('/api/library/issue', async (req, res) => {
    const { book_id, roll_no, due_date } = req.body;
    try {
        const studentRes = await db.query("SELECT id, name, library_status FROM students WHERE roll_no = $1", [roll_no]);
        if (studentRes.rows.length === 0) return res.status(404).json({ message: 'Student not found' });
        const student = studentRes.rows[0];

        if (student.library_status === 'Blocked') return res.status(403).json({ message: 'Student is blocked from library' });

        const bookRes = await db.query("SELECT available_copies FROM books WHERE id = $1", [book_id]);
        if (bookRes.rows.length === 0) return res.status(404).json({ message: 'Book not found' });
        if (bookRes.rows[0].available_copies <= 0) return res.status(400).json({ message: 'Book not available' });

        await db.query("BEGIN");
        const issueRes = await db.query(
            "INSERT INTO book_issues (book_id, student_id, due_date, status) VALUES ($1, $2, $3, 'Issued') RETURNING *",
            [book_id, student.id, due_date]
        );

        await db.query("UPDATE books SET available_copies = available_copies - 1 WHERE id = $1", [book_id]);
        await db.query("COMMIT");

        res.json(issueRes.rows[0]);
    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/library/return/:issue_id', async (req, res) => {
    try {
        const { issue_id } = req.params;
        const res1 = await db.query("SELECT * FROM book_issues WHERE id = $1", [issue_id]);
        if (res1.rows.length === 0) return res.status(404).json({ message: 'Issue record not found' });
        const issue = res1.rows[0];

        if (issue.status === 'Returned') return res.status(400).json({ message: 'Already returned' });

        await db.query("BEGIN");
        await db.query("UPDATE book_issues SET status = 'Returned', return_date = CURRENT_DATE WHERE id = $1", [issue_id]);
        await db.query("UPDATE books SET available_copies = available_copies + 1 WHERE id = $1", [issue.book_id]);
        await db.query("COMMIT");

        res.json({ message: 'Book returned successfully' });
    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Settings & Promotion
app.get('/api/settings', async (req, res) => {
    try {
        const results = await db.query("SELECT key, value FROM settings");
        const settings = {};
        results.rows.forEach(row => settings[row.key] = row.value);
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/admin/promote-year', async (req, res) => {
    const { newYear } = req.body;
    if (!newYear) return res.status(400).json({ message: 'New academic year is required' });

    try {
        // Use the existing promoteYear logic but we need to modify it to take an argument
        // Since promote_year.js is already imported as promoteYear
        await promoteYear(newYear);
        res.json({ message: `Successfully promoted to ${newYear}. All historical data preserved.` });
    } catch (err) {
        console.error("Promotion Error:", err);
        res.status(500).json({ message: 'Promotion failed', details: err.message });
    }
});

app.get('/api/library/issues', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT bi.*, b.title, s.name as student_name, s.roll_no
            FROM book_issues bi
            JOIN books b ON bi.book_id = b.id
            JOIN students s ON bi.student_id = s.id
            ORDER BY bi.issue_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/library/my-issues/:student_id', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT bi.*, b.title, b.author
            FROM book_issues bi
            JOIN books b ON bi.book_id = b.id
            WHERE bi.student_id = $1
            ORDER BY bi.issue_date DESC
        `, [req.params.student_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});



// --- DEPLOYMENT CONFIGURATION ---
const clientBuildPath = path.resolve(__dirname, '../client/dist');
console.log('Serving static files from:', clientBuildPath);
app.use(express.static(clientBuildPath));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    // Initialize DB tables and migrations on startup
    await initDb();
});


