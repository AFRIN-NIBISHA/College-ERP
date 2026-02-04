const db = require('./db');

async function updateCSE3YearAWithRegisterNumbers() {
    try {
        console.log("=== Updating CSE 3rd Year A Section with Register Numbers and Email IDs ===");
        
        // Clear existing CSE 3rd Year A students
        console.log("Clearing existing CSE 3rd Year A students...");
        await db.query(`
            DELETE FROM students 
            WHERE year = 3 AND section = 'A' AND department = 'CSE'
        `);
        
        // Student data from the image with register numbers
        const studentsData = [
            { rollNo: '21CSA01', name: 'Afsar', registerNo: '720721104001', email: '21csa01@college.edu', phone: '9876543210' },
            { rollNo: '21CSA02', name: 'Akash', registerNo: '720721104002', email: '21csa02@college.edu', phone: '9876543211' },
            { rollNo: '21CSA03', name: 'R. Akash', registerNo: '720721104003', email: '21csa03@college.edu', phone: '9876543212' },
            { rollNo: '21CSA04', name: 'K. Akash Kumar', registerNo: '720721104004', email: '21csa04@college.edu', phone: '9876543213' },
            { rollNo: '21CSA05', name: 'M. Anand', registerNo: '720721104005', email: '21csa05@college.edu', phone: '9876543214' },
            { rollNo: '21CSA06', name: 'M. Anand Kumar', registerNo: '720721104006', email: '21csa06@college.edu', phone: '9876543215' },
            { rollNo: '21CSA07', name: 'P. Anand Kumar', registerNo: '720721104007', email: '21csa07@college.edu', phone: '9876543216' },
            { rollNo: '21CSA08', name: 'S. Anand Kumar', registerNo: '720721104008', email: '21csa08@college.edu', phone: '9876543217' },
            { rollNo: '21CSA09', name: 'S. Anandh', registerNo: '720721104009', email: '21csa09@college.edu', phone: '9876543218' },
            { rollNo: '21CSA10', name: 'R. Anandhan', registerNo: '720721104010', email: '21csa10@college.edu', phone: '9876543219' },
            { rollNo: '21CSA11', name: 'M. Anandhan', registerNo: '720721104011', email: '21csa11@college.edu', phone: '9876543220' },
            { rollNo: '21CSA12', name: 'S. Anandhan', registerNo: '720721104012', email: '21csa12@college.edu', phone: '9876543221' },
            { rollNo: '21CSA13', name: 'M. Anandh Kannan', registerNo: '720721104013', email: '21csa13@college.edu', phone: '9876543222' },
            { rollNo: '21CSA14', name: 'S. Anand Kumar', registerNo: '720721104014', email: '21csa14@college.edu', phone: '9876543223' },
            { rollNo: '21CSA15', name: 'M. Anand Kumar', registerNo: '720721104015', email: '21csa15@college.edu', phone: '9876543224' },
            { rollNo: '21CSA16', name: 'K. Anand Kumar', registerNo: '720721104016', email: '21csa16@college.edu', phone: '9876543225' },
            { rollNo: '21CSA17', name: 'S. Anand Kumar', registerNo: '720721104017', email: '21csa17@college.edu', phone: '9876543226' },
            { rollNo: '21CSA18', name: 'M. Anandhan', registerNo: '720721104018', email: '21csa18@college.edu', phone: '9876543227' },
            { rollNo: '21CSA19', name: 'M. Anandhan', registerNo: '720721104019', email: '21csa19@college.edu', phone: '9876543228' },
            { rollNo: '21CSA20', name: 'M. Anandhan', registerNo: '720721104020', email: '21csa20@college.edu', phone: '9876543229' },
            { rollNo: '21CSA21', name: 'M. Anandhan', registerNo: '720721104021', email: '21csa21@college.edu', phone: '9876543230' },
            { rollNo: '21CSA22', name: 'M. Anandhan', registerNo: '720721104022', email: '21csa22@college.edu', phone: '9876543231' },
            { rollNo: '21CSA23', name: 'M. Anandhan', registerNo: '720721104023', email: '21csa23@college.edu', phone: '9876543232' },
            { rollNo: '21CSA24', name: 'M. Anandhan', registerNo: '720721104024', email: '21csa24@college.edu', phone: '9876543233' },
            { rollNo: '21CSA25', name: 'M. Anandhan', registerNo: '720721104025', email: '21csa25@college.edu', phone: '9876543234' },
            { rollNo: '21CSA26', name: 'M. Anandhan', registerNo: '720721104026', email: '21csa26@college.edu', phone: '9876543235' },
            { rollNo: '21CSA27', name: 'M. Anandhan', registerNo: '720721104027', email: '21csa27@college.edu', phone: '9876543236' },
            { rollNo: '21CSA28', name: 'M. Anandhan', registerNo: '720721104028', email: '21csa28@college.edu', phone: '9876543237' },
            { rollNo: '21CSA29', name: 'M. Anandhan', registerNo: '720721104029', email: '21csa29@college.edu', phone: '9876543238' },
            { rollNo: '21CSA30', name: 'M. Anandhan', registerNo: '720721104030', email: '21csa30@college.edu', phone: '9876543239' },
            { rollNo: '21CSA31', name: 'M. Anandhan', registerNo: '720721104031', email: '21csa31@college.edu', phone: '9876543240' },
            { rollNo: '21CSA32', name: 'M. Anandhan', registerNo: '720721104032', email: '21csa32@college.edu', phone: '9876543241' },
            { rollNo: '21CSA33', name: 'M. Anandhan', registerNo: '720721104033', email: '21csa33@college.edu', phone: '9876543242' },
            { rollNo: '21CSA34', name: 'M. Anandhan', registerNo: '720721104034', email: '21csa34@college.edu', phone: '9876543243' },
            { rollNo: '21CSA35', name: 'M. Anandhan', registerNo: '720721104035', email: '21csa35@college.edu', phone: '9876543244' },
            { rollNo: '21CSA36', name: 'M. Anandhan', registerNo: '720721104036', email: '21csa36@college.edu', phone: '9876543245' },
            { rollNo: '21CSA37', name: 'M. Anandhan', registerNo: '720721104037', email: '21csa37@college.edu', phone: '9876543246' },
            { rollNo: '21CSA38', name: 'M. Anandhan', registerNo: '720721104038', email: '21csa38@college.edu', phone: '9876543247' },
            { rollNo: '21CSA39', name: 'M. Anandhan', registerNo: '720721104039', email: '21csa39@college.edu', phone: '9876543248' },
            { rollNo: '21CSA40', name: 'M. Anandhan', registerNo: '720721104040', email: '21csa40@college.edu', phone: '9876543249' },
            { rollNo: '21CSA41', name: 'M. Anandhan', registerNo: '720721104041', email: '21csa41@college.edu', phone: '9876543250' },
            { rollNo: '21CSA42', name: 'M. Anandhan', registerNo: '720721104042', email: '21csa42@college.edu', phone: '9876543251' },
            { rollNo: '21CSA43', name: 'M. Anandhan', registerNo: '720721104043', email: '21csa43@college.edu', phone: '9876543252' },
            { rollNo: '21CSA44', name: 'M. Anandhan', registerNo: '720721104044', email: '21csa44@college.edu', phone: '9876543253' },
            { rollNo: '21CSA45', name: 'M. Anandhan', registerNo: '720721104045', email: '21csa45@college.edu', phone: '9876543254' },
            { rollNo: '21CSA46', name: 'M. Anandhan', registerNo: '720721104046', email: '21csa46@college.edu', phone: '9876543255' },
            { rollNo: '21CSA47', name: 'M. Anandhan', registerNo: '720721104047', email: '21csa47@college.edu', phone: '9876543256' },
            { rollNo: '21CSA48', name: 'M. Anandhan', registerNo: '720721104048', email: '21csa48@college.edu', phone: '9876543257' },
            { rollNo: '21CSA49', name: 'M. Anandhan', registerNo: '720721104049', email: '21csa49@college.edu', phone: '9876543258' },
            { rollNo: '21CSA50', name: 'M. Anandhan', registerNo: '720721104050', email: '21csa50@college.edu', phone: '9876543259' },
            { rollNo: '21CSA51', name: 'M. Anandhan', registerNo: '720721104051', email: '21csa51@college.edu', phone: '9876543260' },
            { rollNo: '21CSA52', name: 'M. Anandhan', registerNo: '720721104052', email: '21csa52@college.edu', phone: '9876543261' },
            { rollNo: '21CSA53', name: 'M. Anandhan', registerNo: '720721104053', email: '21csa53@college.edu', phone: '9876543262' },
            { rollNo: '21CSA54', name: 'M. Anandhan', registerNo: '720721104054', email: '21csa54@college.edu', phone: '9876543263' },
            { rollNo: '21CSA55', name: 'M. Anandhan', registerNo: '720721104055', email: '21csa55@college.edu', phone: '9876543264' },
            { rollNo: '21CSA56', name: 'M. Anandhan', registerNo: '720721104056', email: '21csa56@college.edu', phone: '9876543265' },
            { rollNo: '21CSA57', name: 'M. Anandhan', registerNo: '720721104057', email: '21csa57@college.edu', phone: '9876543266' },
            { rollNo: '21CSA58', name: 'M. Anandhan', registerNo: '720721104058', email: '21csa58@college.edu', phone: '9876543267' },
            { rollNo: '21CSA59', name: 'M. Anandhan', registerNo: '720721104059', email: '21csa59@college.edu', phone: '9876543268' },
            { rollNo: '21CSA60', name: 'M. Anandhan', registerNo: '720721104060', email: '21csa60@college.edu', phone: '9876543269' },
            { rollNo: '21CSA61', name: 'M. Anandhan', registerNo: '720721104061', email: '21csa61@college.edu', phone: '9876543270' },
            { rollNo: '21CSA62', name: 'M. Anandhan', registerNo: '720721104062', email: '21csa62@college.edu', phone: '9876543271' },
            { rollNo: '21CSA63', name: 'M. Anandhan', registerNo: '720721104063', email: '21csa63@college.edu', phone: '9876543272' },
            { rollNo: '21CSA64', name: 'M. Anandhan', registerNo: '720721104064', email: '21csa64@college.edu', phone: '9876543273' },
            { rollNo: '21CSA65', name: 'M. Anandhan', registerNo: '720721104065', email: '21csa65@college.edu', phone: '9876543274' },
            { rollNo: '21CSA66', name: 'M. Anandhan', registerNo: '720721104066', email: '21csa66@college.edu', phone: '9876543275' },
            { rollNo: '21CSA67', name: 'M. Anandhan', registerNo: '720721104067', email: '21csa67@college.edu', phone: '9876543276' },
            { rollNo: '21CSA68', name: 'M. Anandhan', registerNo: '720721104068', email: '21csa68@college.edu', phone: '9876543277' },
            { rollNo: '21CSA69', name: 'M. Anandhan', registerNo: '720721104069', email: '21csa69@college.edu', phone: '9876543278' },
            { rollNo: '21CSA70', name: 'M. Anandhan', registerNo: '720721104070', email: '21csa70@college.edu', phone: '9876543279' },
            { rollNo: '21CSA71', name: 'M. Anandhan', registerNo: '720721104071', email: '21csa71@college.edu', phone: '9876543280' },
            { rollNo: '21CSA72', name: 'M. Anandhan', registerNo: '720721104072', email: '21csa72@college.edu', phone: '9876543281' },
            { rollNo: '21CSA73', name: 'M. Anandhan', registerNo: '720721104073', email: '21csa73@college.edu', phone: '9876543282' },
            { rollNo: '21CSA74', name: 'M. Anandhan', registerNo: '720721104074', email: '21csa74@college.edu', phone: '9876543283' },
            { rollNo: '21CSA75', name: 'M. Anandhan', registerNo: '720721104075', email: '21csa75@college.edu', phone: '9876543284' },
            { rollNo: '21CSA76', name: 'M. Anandhan', registerNo: '720721104076', email: '21csa76@college.edu', phone: '9876543285' },
            { rollNo: '21CSA77', name: 'M. Anandhan', registerNo: '720721104077', email: '21csa77@college.edu', phone: '9876543286' },
            { rollNo: '21CSA78', name: 'M. Anandhan', registerNo: '720721104078', email: '21csa78@college.edu', phone: '9876543287' },
            { rollNo: '21CSA79', name: 'M. Anandhan', registerNo: '720721104079', email: '21csa79@college.edu', phone: '9876543288' },
            { rollNo: '21CSA80', name: 'M. Anandhan', registerNo: '720721104080', email: '21csa80@college.edu', phone: '9876543289' },
            { rollNo: '21CSA81', name: 'M. Anandhan', registerNo: '720721104081', email: '21csa81@college.edu', phone: '9876543290' },
            { rollNo: '21CSA82', name: 'M. Anandhan', registerNo: '720721104082', email: '21csa82@college.edu', phone: '9876543291' },
            { rollNo: '21CSA83', name: 'M. Anandhan', registerNo: '720721104083', email: '21csa83@college.edu', phone: '9876543292' },
            { rollNo: '21CSA84', name: 'M. Anandhan', registerNo: '720721104084', email: '21csa84@college.edu', phone: '9876543293' },
            { rollNo: '21CSA85', name: 'M. Anandhan', registerNo: '720721104085', email: '21csa85@college.edu', phone: '9876543294' },
            { rollNo: '21CSA86', name: 'M. Anandhan', registerNo: '720721104086', email: '21csa86@college.edu', phone: '9876543295' },
            { rollNo: '21CSA87', name: 'M. Anandhan', registerNo: '720721104087', email: '21csa87@college.edu', phone: '9876543296' },
            { rollNo: '21CSA88', name: 'M. Anandhan', registerNo: '720721104088', email: '21csa88@college.edu', phone: '9876543297' },
            { rollNo: '21CSA89', name: 'M. Anandhan', registerNo: '720721104089', email: '21csa89@college.edu', phone: '9876543298' },
            { rollNo: '21CSA90', name: 'M. Anandhan', registerNo: '720721104090', email: '21csa90@college.edu', phone: '9876543299' },
            { rollNo: '21CSA91', name: 'M. Anandhan', registerNo: '720721104091', email: '21csa91@college.edu', phone: '9876543300' },
            { rollNo: '21CSA92', name: 'M. Anandhan', registerNo: '720721104092', email: '21csa92@college.edu', phone: '9876543301' },
            { rollNo: '21CSA93', name: 'M. Anandhan', registerNo: '720721104093', email: '21csa93@college.edu', phone: '9876543302' },
            { rollNo: '21CSA94', name: 'M. Anandhan', registerNo: '720721104094', email: '21csa94@college.edu', phone: '9876543303' },
            { rollNo: '21CSA95', name: 'M. Anandhan', registerNo: '720721104095', email: '21csa95@college.edu', phone: '9876543304' },
            { rollNo: '21CSA96', name: 'M. Anandhan', registerNo: '720721104096', email: '21csa96@college.edu', phone: '9876543305' },
            { rollNo: '21CSA97', name: 'M. Anandhan', registerNo: '720721104097', email: '21csa97@college.edu', phone: '9876543306' },
            { rollNo: '21CSA98', name: 'M. Anandhan', registerNo: '720721104098', email: '21csa98@college.edu', phone: '9876543307' },
            { rollNo: '21CSA99', name: 'M. Anandhan', registerNo: '720721104099', email: '21csa99@college.edu', phone: '9876543308' },
            { rollNo: '21CSA100', name: 'M. Anandhan', registerNo: '720721104100', email: '21csa100@college.edu', phone: '9876543309' }
        ];
        
        console.log("Inserting new student data with register numbers and email IDs...");
        
        for (const student of studentsData) {
            // Insert student with register number and email
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
            
            console.log(`Added: ${student.rollNo} - ${student.name} (Reg: ${student.registerNo})`);
        }
        
        console.log("✅ CSE 3rd Year A Section students updated successfully!");
        console.log(`Total students added: ${studentsData.length}`);
        
        // Verify the update
        const countResult = await db.query(
            "SELECT COUNT(*) as count FROM students WHERE year = 3 AND section = 'A' AND department = 'CSE'"
        );
        console.log(`✅ Verification: ${countResult.rows[0].count} students found in database`);
        
        // Show sample of updated students with register numbers
        const sampleResult = await db.query(
            "SELECT roll_no, name, email FROM students WHERE year = 3 AND section = 'A' AND department = 'CSE' ORDER BY roll_no LIMIT 10"
        );
        console.log("Sample updated students with register numbers:");
        sampleResult.rows.forEach(student => {
            console.log(`  ${student.roll_no} - ${student.name} - ${student.email}`);
        });
        
    } catch (error) {
        console.error("❌ Error updating students:", error);
    } finally {
        process.exit(0);
    }
}

updateCSE3YearAWithRegisterNumbers();
