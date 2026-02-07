const db = require('./db');

async function checkNoDues() {
    try {
        const res = await db.query(`
            SELECT
                tc.table_name, kcu.column_name
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
            WHERE constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'no_dues';
        `);
        console.log("Tables referencing 'no_dues':", res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkNoDues();
