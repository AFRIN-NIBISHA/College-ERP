const db = require('./db');
async function run() {
    try {
        const res = await db.query(`
            SELECT conname, pg_get_constraintdef(c.oid) as def
            FROM pg_constraint c 
            JOIN pg_class cl ON cl.oid = c.conrelid
            WHERE cl.relname = 'fees'
        `);
        console.log("CONSTRAINTS:", JSON.stringify(res.rows));
        process.exit(0);
    } catch (e) { console.error(e); process.exit(1); }
}
run();
