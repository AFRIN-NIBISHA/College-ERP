const db = require('./db');
const fs = require('fs');

async function fix() {
    try {
        const uRes = await db.query("SELECT * FROM users WHERE username = '9606cse011'");
        let result = "User 9606cse011: " + JSON.stringify(uRes.rows, null, 2) + "\n";

        if (uRes.rows.length > 0) {
            const sRes = await db.query("SELECT * FROM staff WHERE user_id = $1", [uRes.rows[0].id]);
            result += "Linked Staff: " + JSON.stringify(sRes.rows, null, 2) + "\n";
        }

        const aRes = await db.query("SELECT * FROM staff WHERE name ILIKE '%arun%'");
        result += "All Aruns: " + JSON.stringify(aRes.rows, null, 2) + "\n";

        fs.writeFileSync('check_out.txt', result, 'utf8');
        process.exit(0);
    } catch (e) {
        fs.writeFileSync('check_out.txt', e.stack, 'utf8');
        process.exit(1);
    }
}
fix();
