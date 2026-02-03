const db = require('./db');

async function updateSubjectSemesters() {
    try {
        console.log("Updating subject semesters...");

        // Update 2nd Year subjects (Semesters 3,4)
        const secondYearSubjects = [
            { code: 'CS3451', semester: 3 },
            { code: 'CS3491', semester: 3 },
            { code: 'CS3452', semester: 3 },
            { code: 'CS3492', semester: 3 },
            { code: 'CS3401', semester: 3 },
            { code: 'GE3451', semester: 4 },
            { code: 'CS3461', semester: 4 },
            { code: 'CS3481', semester: 4 },
            { code: 'CS3402', semester: 4 },
            { code: 'NM002', semester: 4 },
            { code: 'NP001', semester: 4 },
            { code: 'SS002', semester: 4 }
        ];

        // Update 3rd Year subjects (Semesters 5,6)
        const thirdYearSubjects = [
            { code: 'CCS336', semester: 5 },
            { code: 'CCS337', semester: 5 },
            { code: 'CCS338', semester: 5 },
            { code: 'OBT352', semester: 5 },
            { code: 'CCS354', semester: 5 },
            { code: 'CS3491', semester: 5 },
            { code: 'CCS356', semester: 5 },
            { code: 'NM001', semester: 6 },
            { code: 'SS001', semester: 6 }
        ];

        const allUpdates = [...secondYearSubjects, ...thirdYearSubjects];

        for (const subject of allUpdates) {
            try {
                await db.query(
                    'UPDATE subjects SET semester = $1 WHERE subject_code = $2',
                    [subject.semester, subject.code]
                );
                console.log(`✓ Updated ${subject.code} to semester ${subject.semester}`);
            } catch (err) {
                console.log(`⚠ Could not update ${subject.code}`);
            }
        }

        console.log("Subject semesters updated successfully!");

    } catch (error) {
        console.error("Error updating subjects:", error);
    } finally {
        process.exit(0);
    }
}

updateSubjectSemesters();
