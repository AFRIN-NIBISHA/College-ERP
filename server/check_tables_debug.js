const db = require('./db');

(async () => {
    try {
        const res = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', res.rows.map(r => r.table_name));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
