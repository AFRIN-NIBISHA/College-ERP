const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client', err.message);
        console.error('Full Error:', JSON.stringify(err, null, 2));
    } else {
        console.log('Connected successfully!');
        client.query('SELECT NOW()', (err, result) => {
            release();
            if (err) {
                return console.error('Error executing query', err.stack);
            }
            console.log(result.rows);
            process.exit(0);
        });
    }
});
