const db = require('./db');

const setupAndSeed = async () => {
    try {
        console.log('Creating bus tables if not exist...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS bus (
                id SERIAL PRIMARY KEY,
                bus_number VARCHAR(50) UNIQUE NOT NULL,
                driver_name VARCHAR(100) NOT NULL,
                driver_phone VARCHAR(15)
            );

            CREATE TABLE IF NOT EXISTS bus_location (
                id SERIAL PRIMARY KEY,
                bus_id INT REFERENCES bus(id) ON DELETE CASCADE UNIQUE,
                latitude DECIMAL(10, 8) NOT NULL,
                longitude DECIMAL(11, 8) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            ALTER TABLE bus ALTER COLUMN bus_number TYPE VARCHAR(50);
        `);

        const buses = [
            { bus_number: 'BUS-01 (Kanyakumari)', driver_name: 'Arulappan', driver_phone: '9843210987' },
            { bus_number: 'BUS-02 (Nagercoil)', driver_name: 'Muthu', driver_phone: '9843210988' },
            { bus_number: 'BUS-03 (Marthandam)', driver_name: 'Selvam', driver_phone: '9843210989' },
            { bus_number: 'BUS-04 (Vallioor)', driver_name: 'Raja', driver_phone: '9843210990' },
            { bus_number: 'BUS-05 (Tisayanvilai)', driver_name: 'Murugan', driver_phone: '9843210991' },
            { bus_number: 'BUS-06 (Anjugramam)', driver_name: 'Antony', driver_phone: '9843210992' },
            { bus_number: 'BUS-07 (Colachel)', driver_name: 'Robert', driver_phone: '9843210993' },
        ];

        console.log('Seeding buses...');
        for (const bus of buses) {
            await db.query(
                "INSERT INTO bus (bus_number, driver_name, driver_phone) VALUES ($1, $2, $3) ON CONFLICT (bus_number) DO UPDATE SET driver_name = EXCLUDED.driver_name, driver_phone = EXCLUDED.driver_phone",
                [bus.bus_number, bus.driver_name, bus.driver_phone]
            );
        }
        console.log('Migration and seeding completed.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

setupAndSeed();
