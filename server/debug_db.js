const db = require('./db');

async function checkTables() {
    try {
        const res = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("Tables in database:", res.rows.map(r => r.table_name));

        for (const table of res.rows.map(r => r.table_name)) {
            const foreignKeys = await db.query(`
                SELECT
                    tc.table_name, kcu.column_name, 
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name 
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                WHERE constraint_type = 'FOREIGN KEY' AND ccu.table_name = $1;
            `, [table]);
            if (foreignKeys.rows.length > 0) {
                console.log(`Table '${table}' is referenced by:`, foreignKeys.rows);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkTables();
