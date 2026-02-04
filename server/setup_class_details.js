const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        }
        : {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME
        }
);

async function setupClassDetails() {
    try {
        console.log("--- Creating class_details table ---");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS class_details (
                id SERIAL PRIMARY KEY,
                year INTEGER NOT NULL,
                section VARCHAR(10) NOT NULL,
                in_charge_name VARCHAR(100),
                in_charge_phone VARCHAR(20),
                rep_name VARCHAR(100),
                UNIQUE(year, section)
            );
        `);

        console.log("--- Seeding Class In-Charge Data ---");
        const classes = [
            {
                year: 2, section: 'A',
                in_charge: 'Mrs. R. Binisha', phone: '9876543211', rep: 'Amita Jerine'
            },
            {
                year: 2, section: 'B',
                in_charge: 'Mrs. Sindhu DR', phone: '9876543212', rep: 'Narmatha'
            },
            {
                year: 3, section: 'A',
                in_charge: 'Mrs. Raja Kala P', phone: '9876543213', rep: 'Asha Lidia'
            },
            {
                year: 3, section: 'B',
                in_charge: 'Mrs. Monisha Raju Y', phone: '9876543214', rep: 'Sajina'
            }
        ];

        for (const c of classes) {
            await pool.query(`
                INSERT INTO class_details (year, section, in_charge_name, in_charge_phone, rep_name)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (year, section) 
                DO UPDATE SET 
                    in_charge_name = EXCLUDED.in_charge_name,
                    in_charge_phone = EXCLUDED.in_charge_phone,
                    rep_name = EXCLUDED.rep_name;
            `, [c.year, c.section, c.in_charge, c.phone, c.rep]);
        }
        console.log("Class Details seeded successfully.");

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

setupClassDetails();
