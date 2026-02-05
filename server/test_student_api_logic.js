const db = require('./db');
async function run() {
    try {
        const id = '422';
        let query = "SELECT * FROM students WHERE 1=1";
        const params = [id];

        // My recent logic:
        if (!isNaN(id)) {
            query += " AND (id = $1 OR roll_no ILIKE $1)";
        } else {
            query += " AND roll_no ILIKE $1";
        }

        console.log("Query:", query);
        console.log("Params:", params);
        const res = await db.query(query, params);
        console.log("Result length:", res.rows.length);
        if (res.rows.length > 0) console.log(JSON.stringify(res.rows[0], null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
