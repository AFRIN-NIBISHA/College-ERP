const db = require('./db');

async function fixArun() {
    try {
        // 1. Link staff id 75 to user id 146
        await db.query("UPDATE staff SET user_id = 146 WHERE id = 75");
        console.log("Linked staff 75 to user 146");

        // 2. Unlink any other staff that might be erroneously linked to 146 (just in case)
        await db.query("UPDATE staff SET user_id = null WHERE user_id = 146 AND id != 75");

        // 3. Confirm
        const check = await db.query("SELECT id, name, user_id FROM staff WHERE name ILIKE '%arun%'");
        console.log("Arun staffs currently:", check.rows);

        await db.end();
    } catch (e) {
        console.error(e);
    }
}
fixArun();
