const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

const schema = fs.readFileSync('./schema.sql', 'utf8');

pool.query(schema)
    .then(() => {
        console.log("Schema applied successfully.");
        process.exit(0);
    })
    .catch(e => {
        console.error("Error applying schema:", e);
        process.exit(1);
    });
