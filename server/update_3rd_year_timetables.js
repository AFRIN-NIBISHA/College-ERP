const db = require('./db');

async function update3rdYearTimetables() {
    try {
        console.log("Updating 3rd Year timetables from images...");

        // Clear existing 3rd Year timetables
        await db.query('DELETE FROM timetable WHERE year = 3');
        console.log("Cleared existing 3rd Year timetables");

        // Get staff and subject IDs
        const staffResult = await db.query('SELECT id, name FROM staff ORDER BY name');
        const subjectsResult = await db.query('SELECT id, subject_code FROM subjects ORDER BY subject_code');
        
        const staffMap = {};
        staffResult.rows.forEach(s => staffMap[s.name] = s.id);
        
        const subjectMap = {};
        subjectsResult.rows.forEach(s => subjectMap[s.subject_code] = s.id);

        console.log("Staff mappings:");
        Object.entries(staffMap).forEach(([name, id]) => {
            console.log(`- ${name}: ID ${id}`);
        });

        // 3rd Year A Section Timetable (from first image)
        const thirdYearA = [
            // Monday
            { day: 'Monday', period: 1, subject_code: 'CCS336', staff_name: 'Mrs. R. Binisha' }, // Software Testing
            { day: 'Monday', period: 2, subject_code: 'CCS354', staff_name: 'Mrs. Raja Kala P' }, // Network Security
            { day: 'Monday', period: 3, subject_code: 'CCS336', staff_name: 'Mrs. R. Binisha' }, // Software Testing Lab
            { day: 'Monday', period: 4, subject_code: 'CCS336', staff_name: 'Mrs. R. Binisha' }, // Software Testing Lab
            { day: 'Monday', period: 5, subject_code: 'OBT352', staff_name: 'Mr. Arun Venkatesh' }, // Food Nutrients
            { day: 'Monday', period: 6, subject_code: 'NM002', staff_name: 'Mrs. Sheeba' }, // NAAN MUTHALVAN
            { day: 'Monday', period: 7, subject_code: 'NM002', staff_name: 'Mrs. Sheeba' }, // NAAN MUTHALVAN
            { day: 'Monday', period: 8, subject_code: 'NM002', staff_name: 'Mrs. Sheeba' }, // NAAN MUTHALVAN

            // Tuesday
            { day: 'Tuesday', period: 1, subject_code: 'CS3491', staff_name: 'Dr. I. Edwin Albert' }, // Embedded Systems
            { day: 'Tuesday', period: 2, subject_code: 'CCS356', staff_name: 'Mrs. F. Sahaya Reema' }, // OOSE
            { day: 'Tuesday', period: 3, subject_code: 'CCS336', staff_name: 'Mrs. R. Binisha' }, // Software Testing
            { day: 'Tuesday', period: 4, subject_code: 'SS001', staff_name: 'Mrs. R. Nishanthi' }, // Softskill
            { day: 'Tuesday', period: 5, subject_code: 'CCS354', staff_name: 'Mrs. Raja Kala P' }, // Network Security
            { day: 'Tuesday', period: 6, subject_code: 'CCS337', staff_name: 'Mrs. Anto Babiyola' }, // Cloud Service Management
            { day: 'Tuesday', period: 7, subject_code: 'CCS356', staff_name: 'Mrs. F. Sahaya Reema' }, // OOSE
            { day: 'Tuesday', period: 8, subject_code: 'CS3491', staff_name: 'Dr. I. Edwin Albert' }, // Embedded Systems

            // Wednesday
            { day: 'Wednesday', period: 1, subject_code: 'CCS354', staff_name: 'Mrs. Raja Kala P' }, // Network Security
            { day: 'Wednesday', period: 2, subject_code: 'CCS337', staff_name: 'Mrs. Anto Babiyola' }, // Cloud Service Management
            { day: 'Wednesday', period: 3, subject_code: 'CCS356', staff_name: 'Mrs. F. Sahaya Reema' }, // OOSE Lab
            { day: 'Wednesday', period: 4, subject_code: 'CCS356', staff_name: 'Mrs. F. Sahaya Reema' }, // OOSE Lab
            { day: 'Wednesday', period: 5, subject_code: 'CS3491', staff_name: 'Dr. I. Edwin Albert' }, // Embedded Systems
            { day: 'Wednesday', period: 6, subject_code: 'CCS336', staff_name: 'Mrs. R. Binisha' }, // Software Testing
            { day: 'Wednesday', period: 7, subject_code: 'CCS338', staff_name: 'Mrs. Anto Babiyola' }, // CSM Lab
            { day: 'Wednesday', period: 8, subject_code: 'CCS356', staff_name: 'Mrs. F. Sahaya Reema' }, // OOSE

            // Thursday
            { day: 'Thursday', period: 1, subject_code: 'OBT352', staff_name: 'Mr. Arun Venkatesh' }, // Food Nutrients
            { day: 'Thursday', period: 2, subject_code: 'CCS336', staff_name: 'Mrs. R. Binisha' }, // Software Testing
            { day: 'Thursday', period: 3, subject_code: 'CS3491', staff_name: 'Dr. I. Edwin Albert' }, // Embedded Systems
            { day: 'Thursday', period: 4, subject_code: 'CCS354', staff_name: 'Mrs. Raja Kala P' }, // Network Security
            { day: 'Thursday', period: 5, subject_code: 'CCS356', staff_name: 'Mrs. F. Sahaya Reema' }, // OOSE
            { day: 'Thursday', period: 6, subject_code: 'CCS337', staff_name: 'Mrs. Anto Babiyola' }, // Cloud Service Management
            { day: 'Thursday', period: 7, subject_code: 'CCS338', staff_name: 'Mrs. Anto Babiyola' }, // CSM Lab
            { day: 'Thursday', period: 8, subject_code: 'SS001', staff_name: 'Mrs. R. Nishanthi' }, // Softskill

            // Friday
            { day: 'Friday', period: 1, subject_code: 'CCS354', staff_name: 'Mrs. Raja Kala P' }, // Network Security
            { day: 'Friday', period: 2, subject_code: 'CS3491', staff_name: 'Dr. I. Edwin Albert' }, // Embedded Systems
            { day: 'Friday', period: 3, subject_code: 'CCS336', staff_name: 'Mrs. R. Binisha' }, // Software Testing
            { day: 'Friday', period: 4, subject_code: 'CCS337', staff_name: 'Mrs. Anto Babiyola' }, // Cloud Service Management
            { day: 'Friday', period: 5, subject_code: 'OBT352', staff_name: 'Mr. Arun Venkatesh' }, // Food Nutrients
            { day: 'Friday', period: 6, subject_code: 'CCS337', staff_name: 'Mrs. Anto Babiyola' }, // Cloud Service Management
            { day: 'Friday', period: 7, subject_code: 'SS001', staff_name: 'Mrs. R. Nishanthi' }, // Softskill
            { day: 'Friday', period: 8, subject_code: 'NM001', staff_name: 'Mrs. Sheeba' } // Numerical Methods
        ];

        // Insert 3rd Year A timetable
        console.log("\nCreating 3rd Year A Section timetable...");
        for (const entry of thirdYearA) {
            const subjectId = subjectMap[entry.subject_code];
            const staffId = staffMap[entry.staff_name];
            
            if (subjectId && staffId) {
                await db.query(`
                    INSERT INTO timetable (year, section, day, period, subject_id, staff_id) 
                    VALUES (3, 'A', $1, $2, $3, $4)
                `, [entry.day, entry.period, subjectId, staffId]);
                
                console.log(`✓ 3rd A: ${entry.day} P${entry.period} - ${entry.subject_code} by ${entry.staff_name}`);
            } else {
                console.log(`⚠ Missing mapping for 3rd A: ${entry.subject_code} or ${entry.staff_name}`);
            }
        }

        // 3rd Year B Section Timetable (from second image)
        const thirdYearB = [
            // Monday
            { day: 'Monday', period: 1, subject_code: 'CCS356', staff_name: 'Mrs. F. Sahaya Reema' }, // OOSE
            { day: 'Monday', period: 2, subject_code: 'OBT352', staff_name: 'Mr. Arun Venkatesh' }, // Food Nutrients
            { day: 'Monday', period: 3, subject_code: 'CCS354', staff_name: 'Mrs. Raja Kala P' }, // Network Security Lab
            { day: 'Monday', period: 4, subject_code: 'CCS354', staff_name: 'Mrs. Raja Kala P' }, // Network Security Lab
            { day: 'Monday', period: 5, subject_code: 'OBT352', staff_name: 'Mr. Arun Venkatesh' }, // Food Nutrients
            { day: 'Monday', period: 6, subject_code: 'NM002', staff_name: 'Mrs. Sheeba' }, // NAAN MUTHALVAN
            { day: 'Monday', period: 7, subject_code: 'NM002', staff_name: 'Mrs. Sheeba' }, // NAAN MUTHALVAN
            { day: 'Monday', period: 8, subject_code: 'NM002', staff_name: 'Mrs. Sheeba' }, // NAAN MUTHALVAN

            // Tuesday
            { day: 'Tuesday', period: 1, subject_code: 'CS3491', staff_name: 'Dr. I. Edwin Albert' }, // Embedded Systems
            { day: 'Tuesday', period: 2, subject_code: 'CCS337', staff_name: 'Mrs. Anto Babiyola' }, // Cloud Service Management
            { day: 'Tuesday', period: 3, subject_code: 'CCS356', staff_name: 'Mrs. F. Sahaya Reema' }, // OOSE Lab
            { day: 'Tuesday', period: 4, subject_code: 'CCS356', staff_name: 'Mrs. F. Sahaya Reema' }, // OOSE Lab
            { day: 'Tuesday', period: 5, subject_code: 'OBT352', staff_name: 'Mr. Arun Venkatesh' }, // Food Nutrients
            { day: 'Tuesday', period: 6, subject_code: 'CCS336', staff_name: 'Mrs. R. Binisha' }, // Software Testing
            { day: 'Tuesday', period: 7, subject_code: 'CS3491', staff_name: 'Dr. I. Edwin Albert' }, // Embedded Systems Lab
            { day: 'Tuesday', period: 8, subject_code: 'CS3491', staff_name: 'Dr. I. Edwin Albert' }, // Embedded Systems Lab

            // Wednesday
            { day: 'Wednesday', period: 1, subject_code: 'CCS336', staff_name: 'Mrs. R. Binisha' }, // Software Testing
            { day: 'Wednesday', period: 2, subject_code: 'CCS354', staff_name: 'Mrs. Raja Kala P' }, // Network Security
            { day: 'Wednesday', period: 3, subject_code: 'CCS336', staff_name: 'Mrs. R. Binisha' }, // Software Testing
            { day: 'Wednesday', period: 4, subject_code: 'CS3491', staff_name: 'Dr. I. Edwin Albert' }, // Embedded Systems
            { day: 'Wednesday', period: 5, subject_code: 'OBT352', staff_name: 'Mr. Arun Venkatesh' }, // Food Nutrients
            { day: 'Wednesday', period: 6, subject_code: 'CCS356', staff_name: 'Mrs. F. Sahaya Reema' }, // OOSE
            { day: 'Wednesday', period: 7, subject_code: 'CCS354', staff_name: 'Mrs. Raja Kala P' }, // Network Security
            { day: 'Wednesday', period: 8, subject_code: 'CCS337', staff_name: 'Mrs. Anto Babiyola' }, // Cloud Service Management

            // Thursday
            { day: 'Thursday', period: 1, subject_code: 'CCS337', staff_name: 'Mrs. Anto Babiyola' }, // Cloud Service Management
            { day: 'Thursday', period: 2, subject_code: 'CS3491', staff_name: 'Dr. I. Edwin Albert' }, // Embedded Systems
            { day: 'Thursday', period: 3, subject_code: 'CCS336', staff_name: 'Mrs. R. Binisha' }, // Software Testing Lab
            { day: 'Thursday', period: 4, subject_code: 'CCS336', staff_name: 'Mrs. R. Binisha' }, // Software Testing Lab
            { day: 'Thursday', period: 5, subject_code: 'CCS356', staff_name: 'Mrs. F. Sahaya Reema' }, // OOSE
            { day: 'Thursday', period: 6, subject_code: 'SS001', staff_name: 'Mrs. R. Nishanthi' }, // Softskill
            { day: 'Thursday', period: 7, subject_code: 'CCS337', staff_name: 'Mrs. Anto Babiyola' }, // Cloud Service Management
            { day: 'Thursday', period: 8, subject_code: 'CCS356', staff_name: 'Mrs. F. Sahaya Reema' }, // OOSE

            // Friday
            { day: 'Friday', period: 1, subject_code: 'CCS354', staff_name: 'Mrs. Raja Kala P' }, // Network Security
            { day: 'Friday', period: 2, subject_code: 'CS3491', staff_name: 'Dr. I. Edwin Albert' }, // Embedded Systems
            { day: 'Friday', period: 3, subject_code: 'CCS338', staff_name: 'Mrs. Anto Babiyola' }, // CSM Lab
            { day: 'Friday', period: 4, subject_code: 'CCS338', staff_name: 'Mrs. Anto Babiyola' }, // CSM Lab
            { day: 'Friday', period: 5, subject_code: 'CCS354', staff_name: 'Mrs. Raja Kala P' }, // Network Security
            { day: 'Friday', period: 6, subject_code: 'CCS336', staff_name: 'Mrs. R. Binisha' }, // Software Testing
            { day: 'Friday', period: 7, subject_code: 'CCS356', staff_name: 'Mrs. F. Sahaya Reema' }, // OOSE
            { day: 'Friday', period: 8, subject_code: 'CCS337', staff_name: 'Mrs. Anto Babiyola' } // Cloud Service Management
        ];

        // Insert 3rd Year B timetable
        console.log("\nCreating 3rd Year B Section timetable...");
        for (const entry of thirdYearB) {
            const subjectId = subjectMap[entry.subject_code];
            const staffId = staffMap[entry.staff_name];
            
            if (subjectId && staffId) {
                await db.query(`
                    INSERT INTO timetable (year, section, day, period, subject_id, staff_id) 
                    VALUES (3, 'B', $1, $2, $3, $4)
                `, [entry.day, entry.period, subjectId, staffId]);
                
                console.log(`✓ 3rd B: ${entry.day} P${entry.period} - ${entry.subject_code} by ${entry.staff_name}`);
            } else {
                console.log(`⚠ Missing mapping for 3rd B: ${entry.subject_code} or ${entry.staff_name}`);
            }
        }

        console.log("\n3rd Year timetables updated successfully!");

    } catch (error) {
        console.error("Error updating timetables:", error);
    } finally {
        process.exit(0);
    }
}

update3rdYearTimetables();
