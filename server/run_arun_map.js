const db = require('./db');
const fs = require('fs');
async function go() {
    const users = await db.query("SELECT * FROM users WHERE role='staff' AND (username ILIKE '%arun%' OR username ILIKE '%venkADESH%')");
    const staff = await db.query("SELECT * FROM staff WHERE name ILIKE '%arun%' OR name ILIKE '%venkADESH%'");

    const content = `USERS:\n${JSON.stringify(users.rows, null, 2)}\n\nSTAFF:\n${JSON.stringify(staff.rows, null, 2)}`;
    fs.writeFileSync('arun_info.txt', content, 'utf8');
    process.exit(0);
}
go();
