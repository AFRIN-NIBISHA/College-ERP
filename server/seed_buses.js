const db = require('./db');

const seedBuses = async () => {
    const buses = [
        { bus_number: 'BUS-01 (Kanyakumari)', driver_name: 'Arulappan', driver_phone: '9843210987' },
        { bus_number: 'BUS-02 (Nagercoil)', driver_name: 'Muthu', driver_phone: '9843210988' },
        { bus_number: 'BUS-03 (Marthandam)', driver_name: 'Selvam', driver_phone: '9843210989' },
        { bus_number: 'BUS-04 (Vallioor)', driver_name: 'Raja', driver_phone: '9843210990' },
        { bus_number: 'BUS-05 (Tisayanvilai)', driver_name: 'Murugan', driver_phone: '9843210991' },
    ];

    try {
        console.log('Seeding buses...');
        for (const bus of buses) {
            await db.query(
                "INSERT INTO bus (bus_number, driver_name, driver_phone) VALUES ($1, $2, $3) ON CONFLICT (bus_number) DO NOTHING",
                [bus.bus_number, bus.driver_name, bus.driver_phone]
            );
        }
        console.log('Buses seeded successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding buses:', err);
        process.exit(1);
    }
};

seedBuses();
