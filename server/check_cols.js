const db = require('./db');
db.query("SELECT * FROM information_schema.columns WHERE table_name = 'fees'").then(r => {
    console.log("COLUMNS:", JSON.stringify(r.rows.map(c => c.column_name)));
    process.exit(0);
});
