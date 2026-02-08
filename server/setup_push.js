const db = require('./db');

async function setup() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS push_subscriptions (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                subscription JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Push subscription table created successfully");
    } catch (err) {
        console.error("Error creating push subscription table:", err);
    } finally {
        process.exit();
    }
}

setup();
