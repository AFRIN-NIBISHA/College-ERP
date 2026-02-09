const db = require('./db');
const webpush = require('web-push');
require('dotenv').config();

// Mimic server setup for webpush
try {
    webpush.setVapidDetails(
        process.env.VAPID_EMAIL || 'mailto:admin@example.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
    console.log("WebPush Initialized");
} catch (e) {
    console.error("WebPush Init Failed:", e.message);
}

// Minimal createNotification mock/implementation
const createNotification = async (userId, title, message, type = 'info') => {
    try {
        if (!userId) {
            console.log(`Skipping notification: No userId provided for "${title}"`);
            return;
        }

        console.log(`[MOCK] Creating notification for User ${userId}: ${title}`);

        // 1. Save to Db
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
            body: message,
            icon: '/logo192.png',
            data: { url: '/notifications' }
        });

        for (const row of subRes.rows) {
            try {
                // await webpush.sendNotification(row.subscription, payload); // Commented out to isolate DB logic
                console.log(`[MOCK] Push sent to subscription:`, row.subscription);
            } catch (pushErr) {
                console.error(`Failed to send push:`, pushErr.statusCode);
            }
        }
    } catch (err) {
        console.error("Error creating notification:", err);
        throw err; // Re-throw to catch in main
    }
};

const getUserFromStudent = async (studentId) => {
    try {
        const res = await db.query("SELECT user_id FROM students WHERE id = $1", [studentId]);
        return res.rows[0]?.user_id;
    } catch (e) {
        console.error("getUserFromStudent error:", e);
        throw e;
    }
};

const runTest = async () => {
    const id = 10; // Target Request ID from previous step
    const status = 'Approved';
    const updateField = 'office_status';
    const remarks = null;

    console.log(`Testing Approval for Request ID: ${id}`);

    try {
        // Fetch current state
        const currentCheck = await db.query("SELECT * FROM no_dues WHERE id = $1", [id]);
        if (currentCheck.rows.length === 0) {
            console.error('Request not found');
            return;
        }
        const requestRow = currentCheck.rows[0];
        console.log("Current Status:", requestRow);

        // Update DB
        const updateQuery = `UPDATE no_dues SET "${updateField}" = $1, remarks = COALESCE($2, remarks) WHERE id = $3`;
        console.log("Executing Query:", updateQuery);
        await db.query(updateQuery, [status, remarks, id]);
        console.log("Update Successful.");

        // Post-update logic (Notifications)
        const studentUserId = await getUserFromStudent(requestRow.student_id);
        console.log("Student User ID:", studentUserId);

        if (updateField === 'office_status' && status === 'Approved') {
            console.log("Processing Office Approval Notifications...");

            // Notify Student
            await createNotification(studentUserId, 'No Due Update', 'Office has approved your request.', 'info');

            // Find Staff
            const studRes = await db.query(`SELECT year, section FROM students WHERE id = $1`, [requestRow.student_id]);
            if (studRes.rows.length > 0) {
                const { year, section } = studRes.rows[0];
                console.log(`Student Class: ${year}-${section}`);

                const staffRes = await db.query(`
                    SELECT DISTINCT st.user_id 
                    FROM timetable t
                    JOIN staff st ON t.staff_id = st.id
                    WHERE t.year = $1 AND t.section = $2
                    AND st.user_id IS NOT NULL
                `, [year, section]);

                console.log(`Found ${staffRes.rows.length} staff to notify.`);

                for (const row of staffRes.rows) {
                    if (row.user_id) {
                        await createNotification(row.user_id, 'No Due Request', `Clearance request ready.`, 'info');
                    }
                }
            } else {
                console.warn("Student class details not found.");
            }
        }

        console.log("Test Completed Successfully.");

    } catch (err) {
        console.error("❌ TEST FAILED:", err);
    } finally {
        // process.exit(0);
    }
};

runTest();
