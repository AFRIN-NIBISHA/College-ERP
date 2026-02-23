-- Database Schema for DMI Engineering College - CSE Department

-- Users table (Handles login for Admin, Staff, Student)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- In production, hash this!
    role VARCHAR(20) CHECK (role IN ('admin', 'staff', 'student', 'hod', 'principal', 'office')) NOT NULL,
    is_setup BOOLEAN DEFAULT FALSE
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50) DEFAULT 'CSE',
    year INT NOT NULL, -- 1, 2, 3, 4
    section VARCHAR(10), -- A, B, C
    email VARCHAR(100),
    phone VARCHAR(15),
    dob DATE,
    bus_no VARCHAR(50),
    bus_driver_name VARCHAR(100),
    bus_driver_phone VARCHAR(15),
    bus_starting_point VARCHAR(255),
    bus_ending_point VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student On Duty (OD) table
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

-- Staff table
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

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    subject_code VARCHAR(50) UNIQUE NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    semester INT NOT NULL,
    credits INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marks table
CREATE TABLE IF NOT EXISTS marks (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    exam_type VARCHAR(20) DEFAULT 'Semester', -- Internal, Semester, Model
    marks_obtained DECIMAL(5, 2),
    max_marks DECIMAL(5, 2) DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Internal Marks Table
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

-- Attendance table
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

-- Fees Table
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

-- No Due table
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

-- Notices/Announcements
CREATE TABLE IF NOT EXISTS notices (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty Attendance
CREATE TABLE IF NOT EXISTS faculty_attendance (
    id SERIAL PRIMARY KEY,
    staff_id INT REFERENCES staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Present', 'Absent', 'On Duty')),
    substitute_id INT REFERENCES staff(id) ON DELETE SET NULL, -- If absent, who is the substitute?
    UNIQUE(staff_id, date)
);

-- Class Timetable
CREATE TABLE IF NOT EXISTS timetable (
    id SERIAL PRIMARY KEY,
    year INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    day VARCHAR(15) NOT NULL, -- Monday, Tuesday...
    period INT NOT NULL, -- 1 to 8
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    staff_id INT REFERENCES staff(id) ON DELETE SET NULL,
    subject_name_text VARCHAR(100),
    staff_name_text VARCHAR(100),
    subject_code_text VARCHAR(50),
    subject_credit_text VARCHAR(10),
    UNIQUE(year, section, day, period)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'marks', 'attendance', 'fees', 'od', 'info'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class Details / Incharge Table
CREATE TABLE IF NOT EXISTS class_details (
    id SERIAL PRIMARY KEY,
    year INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    staff_id INT REFERENCES staff(id) ON DELETE SET NULL,
    rep_name VARCHAR(100),
    UNIQUE(year, section)
);

-- Push Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    subscription TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bus management
CREATE TABLE IF NOT EXISTS bus (
    id SERIAL PRIMARY KEY,
    bus_number VARCHAR(50) UNIQUE NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    driver_phone VARCHAR(15),
    starting_point VARCHAR(255),
    ending_point VARCHAR(255)
);

