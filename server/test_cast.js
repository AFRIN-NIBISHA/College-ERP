const db = require('./db');
async function run() {
    try {
        const id = '422';
        // Test with cast
        const query = "SELECT * FROM students WHERE id::text = $1 OR roll_no ILIKE $1";
        const params = [id];

        console.log("Query:", query);
        const res = await db.query(query, params);
        console.log("Result length:", res.rows.length);
        if (res.rows.length > 0) console.log("Found:", res.rows[0].name);
    } catch (e) {
        console.error("Cast Test Failed:", e);
    } finally {
        process.exit();
    }
}
run();
