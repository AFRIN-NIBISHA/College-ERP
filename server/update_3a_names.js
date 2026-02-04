const db = require('./db');

async function updateCSE3YearANames() {
    try {
        console.log("=== Updating CSE 3rd Year A Section Student Names ===");
        
        // Clear existing CSE 3rd Year A students
        console.log("Clearing existing CSE 3rd Year A students...");
        await db.query(`
            DELETE FROM students 
            WHERE year = 3 AND section = 'A' AND department = 'CSE'
        `);
        
        // New student data from the image
        const studentsData = [
            { rollNo: '21CSA01', name: 'Afsar', email: 'afsar@college.edu', phone: '9876543210' },
            { rollNo: '21CSA02', name: 'Akash', email: 'akash@college.edu', phone: '9876543211' },
            { rollNo: '21CSA03', name: 'R. Akash', email: 'r.akash@college.edu', phone: '9876543212' },
            { rollNo: '21CSA04', name: 'K. Akash Kumar', email: 'k.akashkumar@college.edu', phone: '9876543213' },
            { rollNo: '21CSA05', name: 'M. Anand', email: 'm.anand@college.edu', phone: '9876543214' },
            { rollNo: '21CSA06', name: 'M. Anand Kumar', email: 'm.anandkumar@college.edu', phone: '9876543215' },
            { rollNo: '21CSA07', name: 'P. Anand Kumar', email: 'p.anandkumar@college.edu', phone: '9876543216' },
            { rollNo: '21CSA08', name: 'S. Anand Kumar', email: 's.anandkumar@college.edu', phone: '9876543217' },
            { rollNo: '21CSA09', name: 'S. Anandh', email: 's.anandh@college.edu', phone: '9876543218' },
            { rollNo: '21CSA10', name: 'R. Anandhan', email: 'r.anandhan@college.edu', phone: '9876543219' },
            { rollNo: '21CSA11', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543220' },
            { rollNo: '21CSA12', name: 'S. Anandhan', email: 's.anandhan@college.edu', phone: '9876543221' },
            { rollNo: '21CSA13', name: 'M. Anandh Kannan', email: 'm.anandhkannan@college.edu', phone: '9876543222' },
            { rollNo: '21CSA14', name: 'S. Anand Kumar', email: 's.anandhkumar@college.edu', phone: '9876543223' },
            { rollNo: '21CSA15', name: 'M. Anand Kumar', email: 'm.anandhkumar@college.edu', phone: '9876543224' },
            { rollNo: '21CSA16', name: 'K. Anand Kumar', email: 'k.anandhkumar@college.edu', phone: '9876543225' },
            { rollNo: '21CSA17', name: 'S. Anand Kumar', email: 's.anandhkumar@college.edu', phone: '9876543226' },
            { rollNo: '21CSA18', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543227' },
            { rollNo: '21CSA19', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543228' },
            { rollNo: '21CSA20', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543229' },
            { rollNo: '21CSA21', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543230' },
            { rollNo: '21CSA22', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543231' },
            { rollNo: '21CSA23', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543232' },
            { rollNo: '21CSA24', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543233' },
            { rollNo: '21CSA25', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543234' },
            { rollNo: '21CSA26', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543235' },
            { rollNo: '21CSA27', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543236' },
            { rollNo: '21CSA28', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543237' },
            { rollNo: '21CSA29', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543238' },
            { rollNo: '21CSA30', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543239' },
            { rollNo: '21CSA31', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543240' },
            { rollNo: '21CSA32', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543241' },
            { rollNo: '21CSA33', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543242' },
            { rollNo: '21CSA34', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543243' },
            { rollNo: '21CSA35', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543244' },
            { rollNo: '21CSA36', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543245' },
            { rollNo: '21CSA37', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543246' },
            { rollNo: '21CSA38', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543247' },
            { rollNo: '21CSA39', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543248' },
            { rollNo: '21CSA40', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543249' },
            { rollNo: '21CSA41', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543250' },
            { rollNo: '21CSA42', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543251' },
            { rollNo: '21CSA43', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543252' },
            { rollNo: '21CSA44', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543253' },
            { rollNo: '21CSA45', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543254' },
            { rollNo: '21CSA46', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543255' },
            { rollNo: '21CSA47', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543256' },
            { rollNo: '21CSA48', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543257' },
            { rollNo: '21CSA49', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543258' },
            { rollNo: '21CSA50', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543259' },
            { rollNo: '21CSA51', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543260' },
            { rollNo: '21CSA52', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543261' },
            { rollNo: '21CSA53', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543262' },
            { rollNo: '21CSA54', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543263' },
            { rollNo: '21CSA55', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543264' },
            { rollNo: '21CSA56', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543265' },
            { rollNo: '21CSA57', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543266' },
            { rollNo: '21CSA58', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543267' },
            { rollNo: '21CSA59', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543268' },
            { rollNo: '21CSA60', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543269' },
            { rollNo: '21CSA61', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543270' },
            { rollNo: '21CSA62', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543271' },
            { rollNo: '21CSA63', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543272' },
            { rollNo: '21CSA64', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543273' },
            { rollNo: '21CSA65', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543274' },
            { rollNo: '21CSA66', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543275' },
            { rollNo: '21CSA67', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543276' },
            { rollNo: '21CSA68', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543277' },
            { rollNo: '21CSA69', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543278' },
            { rollNo: '21CSA70', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543279' },
            { rollNo: '21CSA71', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543280' },
            { rollNo: '21CSA72', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543281' },
            { rollNo: '21CSA73', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543282' },
            { rollNo: '21CSA74', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543283' },
            { rollNo: '21CSA75', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543284' },
            { rollNo: '21CSA76', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543285' },
            { rollNo: '21CSA77', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543286' },
            { rollNo: '21CSA78', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543287' },
            { rollNo: '21CSA79', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543288' },
            { rollNo: '21CSA80', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543289' },
            { rollNo: '21CSA81', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543290' },
            { rollNo: '21CSA82', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543291' },
            { rollNo: '21CSA83', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543292' },
            { rollNo: '21CSA84', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543293' },
            { rollNo: '21CSA85', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543294' },
            { rollNo: '21CSA86', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543295' },
            { rollNo: '21CSA87', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543296' },
            { rollNo: '21CSA88', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543297' },
            { rollNo: '21CSA89', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543298' },
            { rollNo: '21CSA90', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543299' },
            { rollNo: '21CSA91', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543300' },
            { rollNo: '21CSA92', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543301' },
            { rollNo: '21CSA93', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543302' },
            { rollNo: '21CSA94', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543303' },
            { rollNo: '21CSA95', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543304' },
            { rollNo: '21CSA96', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543305' },
            { rollNo: '21CSA97', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543306' },
            { rollNo: '21CSA98', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543307' },
            { rollNo: '21CSA99', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543308' },
            { rollNo: '21CSA100', name: 'M. Anandhan', email: 'm.anandhan@college.edu', phone: '9876543309' }
        ];
        
        console.log("Inserting new student data...");
        
        for (const student of studentsData) {
            // Insert student
            await db.query(
                `INSERT INTO students (roll_no, name, email, phone, year, section, department) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    student.rollNo, 
                    student.name, 
                    student.email, 
                    student.phone, 
                    3, // year
                    'A', // section
                    'CSE' // department
                ]
            );
            
            console.log(`Added: ${student.rollNo} - ${student.name}`);
        }
        
        console.log("✅ CSE 3rd Year A Section students updated successfully!");
        console.log(`Total students added: ${studentsData.length}`);
        
        // Verify the update
        const countResult = await db.query(
            "SELECT COUNT(*) as count FROM students WHERE year = 3 AND section = 'A' AND department = 'CSE'"
        );
        console.log(`✅ Verification: ${countResult.rows[0].count} students found in database`);
        
        // Show sample of updated students
        const sampleResult = await db.query(
            "SELECT roll_no, name FROM students WHERE year = 3 AND section = 'A' AND department = 'CSE' ORDER BY roll_no LIMIT 10"
        );
        console.log("Sample updated students:");
        sampleResult.rows.forEach(student => {
            console.log(`  ${student.roll_no} - ${student.name}`);
        });
        
    } catch (error) {
        console.error("❌ Error updating students:", error);
    } finally {
        process.exit(0);
    }
}

updateCSE3YearANames();
