const db = require('./db');
db.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'push_subscriptions' AND column_name = 'subscription'")
    .then(res => {
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
