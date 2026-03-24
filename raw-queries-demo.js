const pool = require('./config/mysql');

async function run() {
  try {
    console.log('Connected with mysql2');

    const [stationResult] = await pool.execute(
      `INSERT INTO stations (name, address, latitude, longitude)
       VALUES (?, ?, ?, ?)`,
      ['Central Station', 'Kyiv, Khreshchatyk 1', 50.4501, 30.5234]
    );

    const stationId = stationResult.insertId;
    console.log('Inserted station ID:', stationId);

    const [bikeResult] = await pool.execute(
      `INSERT INTO bikes (title, type, price_per_hour, status, description, photo, station_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'City Bike 1',
        'city',
        120.00,
        'available',
        'Comfortable city bicycle',
        'bike1.jpg',
        stationId
      ]
    );

    const bikeId = bikeResult.insertId;
    console.log('Inserted bike ID:', bikeId);

    const [bikes] = await pool.execute(
      'SELECT * FROM bikes WHERE id = ?',
      [bikeId]
    );
    console.log('SELECT result:', bikes);

    await pool.execute(
      'UPDATE bikes SET price_per_hour = ?, status = ? WHERE id = ?',
      [150.00, 'maintenance', bikeId]
    );
    console.log('Bike updated');

    const [updatedBikes] = await pool.execute(
      'SELECT * FROM bikes WHERE id = ?',
      [bikeId]
    );
    console.log('Updated bike:', updatedBikes);

    await pool.execute('DELETE FROM bikes WHERE id = ?', [bikeId]);
    await pool.execute('DELETE FROM stations WHERE id = ?', [stationId]);

    console.log('Records deleted');
  } catch (error) {
    console.error('mysql2 demo error:', error.message);
  } finally {
    await pool.end();
  }
}

run();