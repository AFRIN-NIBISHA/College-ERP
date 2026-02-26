const db = require('./db');
db.query("SELECT id, name FROM students WHERE roll_no = '960623104004'").then(r => {
    console.log("STUDENT_ID:", JSON.stringify(r.rows));
    if (r.rows.length > 0) {
        const id = r.rows[0].id;
        db.query("SELECT * FROM fees WHERE student_id = " + id).then(f => {
            console.log("FEE_RECORDS:", JSON.stringify(f.rows));
            db.query("SELECT * FROM no_dues WHERE student_id = " + id).then(nd => {
                console.log("ND_RECORDS:", JSON.stringify(nd.rows));
                process.exit(0);
            });
        });
    } else {
        process.exit(0);
    }
});
