const db = require('./db');

async function addColumn() {
    try {
        await db.query('ALTER TABLE bus ADD COLUMN IF NOT EXISTS route_pdf TEXT');
        console.log('Column route_pdf added to bus table');
        process.exit(0);
    } catch (err) {
        console.error('Error adding column:', err);
        process.exit(1);
    }
}

addColumn();
