const db = require('./db');
const fs = require('fs');

async function check() {
    try {
        const uRes = await db.query("SELECT * FROM users WHERE username ILIKE '%cse011%'");
        const sRes = await db.query("SELECT * FROM staff WHERE staff_id ILIKE '%cse011%'");

        const result = {
            users: uRes.rows,
            staff: sRes.rows
        };

        fs.writeFileSync('check_cse011.txt', JSON.stringify(result, null, 2), 'utf8');
        process.exit(0);
    } catch (e) {
        fs.writeFileSync('check_cse011.txt', e.stack, 'utf8');
        process.exit(1);
    }
}
check();
