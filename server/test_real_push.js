const db = require('./db');
const webpush = require('web-push');
require('dotenv').config();

// True server logic setup
webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

const createNotification = async (userId, title, message, type = 'info') => {
    try {
        if (!userId) {
            console.log(`Skipping notification: see no userId`);
            return;
        }

        console.log(`Creating notification for User ${userId}`);

        // 1. Save to DB
        await db.query(
            "INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)",
            [userId, title, message, type]
        );
        console.log(`Notification saved to DB.`);

        // 2. Send Push
        const subRes = await db.query("SELECT subscription FROM push_subscriptions WHERE user_id = $1", [userId]);
        console.log(`Found ${subRes.rows.length} subscriptions.`);

        const payload = JSON.stringify({
            title: title,
            body: message
        });

        for (const row of subRes.rows) {
            try {
                console.log("Sending push to:", row.subscription);
                await webpush.sendNotification(row.subscription, payload);
                console.log(`Push sent.`);
            } catch (pushErr) {
                console.error(`Failed to send push:`, pushErr);
            }
        }
    } catch (err) {
        console.error("Error creating notification:", err);
        throw err; // Ensure we propagate this to catch block
    }
};

const runTest = async () => {
    try {
        // Test with a user that likely has no subscription first
        await createNotification(1, 'Test Title', 'Test Message');
        console.log("Test finished.");
    } catch (e) {
        console.error("TEST FAILED:", e);
    } finally {
        process.exit(0);
    }
};

runTest();
