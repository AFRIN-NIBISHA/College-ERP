const db = require('./db');

async function recreateTimetablesWithNewStaff() {
    try {
        console.log("Recreating timetables with new CSE staff...");

        // Get staff IDs for mapping
        const staffResult = await db.query('SELECT id, name FROM staff ORDER BY name');
        const staffMap = {};
        staffResult.rows.forEach(s => staffMap[s.name] = s.id);

        console.log("Staff ID mappings:");
        Object.entries(staffMap).forEach(([name, id]) => {
            console.log(`- ${name}: ID ${id}`);
        });

        // Get subjects
        const subjectsResult = await db.query('SELECT id, subject_code FROM subjects');
        const subjectMap = {};
        subjectsResult.rows.forEach(s => subjectMap[s.subject_code] = s.id);

        // 2nd Year A Section Timetable
        const secondYearA = [
            // Monday
            { day: 'Monday', period: 1, subject_code: 'CS3451', staff_name: 'Mrs. T. Raju' },
            { day: 'Monday', period: 2, subject_code: 'CS3491', staff_name: 'Mrs. J. Stefy Christina' },
            { day: 'Monday', period: 3, subject_code: 'CS3452', staff_name: 'Mr. Arun Venkatesh' },
            { day: 'Monday', period: 4, subject_code: 'CS3492', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Monday', period: 5, subject_code: 'CS3491', staff_name: 'Mrs. J. Stefy Christina' },
            { day: 'Monday', period: 6, subject_code: 'CS3401', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Monday', period: 7, subject_code: 'CS3452', staff_name: 'Mr. Arun Venkatesh' },
            { day: 'Monday', period: 8, subject_code: 'CS3492', staff_name: 'Mrs. F. Sahaya Reema' },

            // Tuesday
            { day: 'Tuesday', period: 1, subject_code: 'CS3452', staff_name: 'Mr. Arun Venkatesh' },
            { day: 'Tuesday', period: 2, subject_code: 'NM002', staff_name: 'Mrs. Sheeba' },
            { day: 'Tuesday', period: 3, subject_code: 'NM002', staff_name: 'Mrs. Sheeba' },
            { day: 'Tuesday', period: 4, subject_code: 'NM002', staff_name: 'Mrs. Sheeba' },
            { day: 'Tuesday', period: 5, subject_code: 'CS3401', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Tuesday', period: 6, subject_code: 'CS3461', staff_name: 'Mrs. T. Raju' },
            { day: 'Tuesday', period: 7, subject_code: 'GE3451', staff_name: 'Mrs. Raja Kala P' },
            { day: 'Tuesday', period: 8, subject_code: 'GE3451', staff_name: 'Mrs. Raja Kala P' },

            // Wednesday
            { day: 'Wednesday', period: 1, subject_code: 'CS3491', staff_name: 'Mrs. J. Stefy Christina' },
            { day: 'Wednesday', period: 2, subject_code: 'CS3401', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Wednesday', period: 3, subject_code: 'CS3451', staff_name: 'Mrs. T. Raju' },
            { day: 'Wednesday', period: 4, subject_code: 'CS3452', staff_name: 'Mr. Arun Venkatesh' },
            { day: 'Wednesday', period: 5, subject_code: 'NP001', staff_name: 'Mrs. Sheeba' },
            { day: 'Wednesday', period: 6, subject_code: 'CS3481', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Wednesday', period: 7, subject_code: 'CS3401', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Wednesday', period: 8, subject_code: 'CS3451', staff_name: 'Mrs. T. Raju' },

            // Thursday
            { day: 'Thursday', period: 1, subject_code: 'CS3401', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Thursday', period: 2, subject_code: 'GE3451', staff_name: 'Mrs. Raja Kala P' },
            { day: 'Thursday', period: 3, subject_code: 'CS3451', staff_name: 'Mrs. T. Raju' },
            { day: 'Thursday', period: 4, subject_code: 'CS3492', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Thursday', period: 5, subject_code: 'CS3402', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Thursday', period: 6, subject_code: 'GE3451', staff_name: 'Mrs. Raja Kala P' },
            { day: 'Thursday', period: 7, subject_code: 'CS3492', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Thursday', period: 8, subject_code: 'CS3491', staff_name: 'Mrs. J. Stefy Christina' },

            // Friday
            { day: 'Friday', period: 1, subject_code: 'CS3492', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Friday', period: 2, subject_code: 'CS3452', staff_name: 'Mr. Arun Venkatesh' },
            { day: 'Friday', period: 3, subject_code: 'CS3491', staff_name: 'Mrs. J. Stefy Christina' },
            { day: 'Friday', period: 4, subject_code: 'CS3451', staff_name: 'Mrs. T. Raju' },
            { day: 'Friday', period: 5, subject_code: 'GE3451', staff_name: 'Mrs. Raja Kala P' },
            { day: 'Friday', period: 6, subject_code: 'CS3451', staff_name: 'Mrs. T. Raju' },
            { day: 'Friday', period: 7, subject_code: 'SS002', staff_name: 'Mrs. R. Nishanthi' },
            { day: 'Friday', period: 8, subject_code: 'SS002', staff_name: 'Mrs. R. Nishanthi' }
        ];

        // Insert 2nd Year A timetable
        console.log("\nCreating 2nd Year A Section timetable...");
        for (const entry of secondYearA) {
            const subjectId = subjectMap[entry.subject_code];
            const staffId = staffMap[entry.staff_name];
            
            if (subjectId && staffId) {
                await db.query(`
                    INSERT INTO timetable (year, section, day, period, subject_id, staff_id) 
                    VALUES (2, 'A', $1, $2, $3, $4)
                `, [entry.day, entry.period, subjectId, staffId]);
                
                console.log(`✓ 2nd A: ${entry.day} P${entry.period} - ${entry.subject_code} by ${entry.staff_name}`);
            } else {
                console.log(`⚠ Missing mapping for 2nd A: ${entry.subject_code} or ${entry.staff_name}`);
            }
        }

        // 2nd Year B Section Timetable
        const secondYearB = [
            // Monday
            { day: 'Monday', period: 1, subject_code: 'CS3401', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Monday', period: 2, subject_code: 'CS3492', staff_name: 'Mrs. Y. Monisha Raju' },
            { day: 'Monday', period: 3, subject_code: 'CS3452', staff_name: 'Dr. I. Edwin Albert' },
            { day: 'Monday', period: 4, subject_code: 'CS3451', staff_name: 'Mrs. T. Raju' },
            { day: 'Monday', period: 5, subject_code: 'CS3401', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Monday', period: 6, subject_code: 'CS3451', staff_name: 'Mrs. T. Raju' },
            { day: 'Monday', period: 7, subject_code: 'SS002', staff_name: 'Mrs. R. Nishanthi' },
            { day: 'Monday', period: 8, subject_code: 'CS3491', staff_name: 'Mrs. J. Stefy Christina' },

            // Tuesday
            { day: 'Tuesday', period: 1, subject_code: 'CS3452', staff_name: 'Dr. I. Edwin Albert' },
            { day: 'Tuesday', period: 2, subject_code: 'NM002', staff_name: 'Mrs. Dhanya Raj' },
            { day: 'Tuesday', period: 3, subject_code: 'NM002', staff_name: 'Mrs. Dhanya Raj' },
            { day: 'Tuesday', period: 4, subject_code: 'CS3491', staff_name: 'Mrs. J. Stefy Christina' },
            { day: 'Tuesday', period: 5, subject_code: 'CS3491', staff_name: 'Mrs. J. Stefy Christina' },
            { day: 'Tuesday', period: 6, subject_code: 'CS3402', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Tuesday', period: 7, subject_code: 'CS3402', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Tuesday', period: 8, subject_code: 'CS3452', staff_name: 'Dr. I. Edwin Albert' },

            // Wednesday
            { day: 'Wednesday', period: 1, subject_code: 'CS3492', staff_name: 'Mrs. Y. Monisha Raju' },
            { day: 'Wednesday', period: 2, subject_code: 'GE3451', staff_name: 'Mrs. Raja Kala P' },
            { day: 'Wednesday', period: 3, subject_code: 'CS3451', staff_name: 'Mrs. T. Raju' },
            { day: 'Wednesday', period: 4, subject_code: 'CS3401', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Wednesday', period: 5, subject_code: 'CS3481', staff_name: 'Mrs. Y. Monisha Raju' },
            { day: 'Wednesday', period: 6, subject_code: 'CS3481', staff_name: 'Mrs. Jenet Rajee' },
            { day: 'Wednesday', period: 7, subject_code: 'CS3461', staff_name: 'Mrs. T. Raju' },
            { day: 'Wednesday', period: 8, subject_code: 'CS3461', staff_name: 'Mrs. D. R. Sindhu' },

            // Thursday
            { day: 'Thursday', period: 1, subject_code: 'CS3491', staff_name: 'Mrs. J. Stefy Christina' },
            { day: 'Thursday', period: 2, subject_code: 'CS3452', staff_name: 'Dr. I. Edwin Albert' },
            { day: 'Thursday', period: 3, subject_code: 'CS3492', staff_name: 'Mrs. Y. Monisha Raju' },
            { day: 'Thursday', period: 4, subject_code: 'GE3451', staff_name: 'Mrs. Raja Kala P' },
            { day: 'Thursday', period: 5, subject_code: 'CS3401', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Thursday', period: 6, subject_code: 'CS3451', staff_name: 'Mrs. T. Raju' },
            { day: 'Thursday', period: 7, subject_code: 'CS3492', staff_name: 'Mrs. Y. Monisha Raju' },
            { day: 'Thursday', period: 8, subject_code: 'CS3491', staff_name: 'Mrs. J. Stefy Christina' },

            // Friday
            { day: 'Friday', period: 1, subject_code: 'CS3401', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Friday', period: 2, subject_code: 'CS3451', staff_name: 'Mrs. T. Raju' },
            { day: 'Friday', period: 3, subject_code: 'CS3492', staff_name: 'Mrs. Y. Monisha Raju' },
            { day: 'Friday', period: 4, subject_code: 'CS3452', staff_name: 'Dr. I. Edwin Albert' },
            { day: 'Friday', period: 5, subject_code: 'GE3451', staff_name: 'Mrs. Raja Kala P' },
            { day: 'Friday', period: 6, subject_code: 'CS3491', staff_name: 'Mrs. J. Stefy Christina' },
            { day: 'Friday', period: 7, subject_code: 'CS3401', staff_name: 'Mrs. F. Sahaya Reema' },
            { day: 'Friday', period: 8, subject_code: 'SS002', staff_name: 'Mrs. R. Nishanthi' }
        ];

        // Insert 2nd Year B timetable
        console.log("\nCreating 2nd Year B Section timetable...");
        for (const entry of secondYearB) {
            const subjectId = subjectMap[entry.subject_code];
            const staffId = staffMap[entry.staff_name];
            
            if (subjectId && staffId) {
                await db.query(`
                    INSERT INTO timetable (year, section, day, period, subject_id, staff_id) 
                    VALUES (2, 'B', $1, $2, $3, $4)
                `, [entry.day, entry.period, subjectId, staffId]);
                
                console.log(`✓ 2nd B: ${entry.day} P${entry.period} - ${entry.subject_code} by ${entry.staff_name}`);
            } else {
                console.log(`⚠ Missing mapping for 2nd B: ${entry.subject_code} or ${entry.staff_name}`);
            }
        }

        console.log("\nTimetables recreated successfully with new CSE staff!");

    } catch (error) {
        console.error("Error recreating timetables:", error);
    } finally {
        process.exit(0);
    }
}

recreateTimetablesWithNewStaff();
