import 'dotenv/config';
import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { encrypt } from '../../utils/encryption.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://wareable:devpassword@localhost:5432/wareable',
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create demo user
    const userId = randomUUID();
    await client.query(
      `INSERT INTO users (id, google_id, email, display_name, avatar_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (google_id) DO NOTHING`,
      [userId, 'demo-google-id', 'demo@example.com', 'Demo User', null]
    );

    // Create demo device
    const deviceId = randomUUID();
    await client.query(
      `INSERT INTO devices (id, user_id, platform, device_name, device_model, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [deviceId, userId, 'ios_healthkit', 'iPhone 15', 'iPhone15,2', true]
    );

    // Generate health metrics for last 7 days
    const now = new Date();
    for (let day = 6; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);

      // Steps (plain numeric_value for aggregation)
      const steps = Math.floor(Math.random() * 8000) + 4000;
      await client.query(
        `INSERT INTO health_metrics (user_id, device_id, metric_type, numeric_value, recorded_at)
         VALUES ($1, $2, 'steps', $3, $4)
         ON CONFLICT DO NOTHING`,
        [userId, deviceId, steps, date.toISOString()]
      );

      // Heart rate samples (encrypted) - multiple per day
      for (let hour = 8; hour <= 22; hour += 2) {
        const hrDate = new Date(date);
        hrDate.setHours(hour, 0, 0, 0);
        const bpm = Math.floor(Math.random() * 40) + 60;
        const encryptedData = encrypt(JSON.stringify({ bpm }));
        await client.query(
          `INSERT INTO health_metrics (user_id, device_id, metric_type, numeric_value, encrypted_data, recorded_at)
           VALUES ($1, $2, 'heart_rate', $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [userId, deviceId, bpm, encryptedData, hrDate.toISOString()]
        );
      }

      // Calories (encrypted)
      const calories = Math.floor(Math.random() * 800) + 1500;
      const encryptedCalories = encrypt(JSON.stringify({ calories }));
      await client.query(
        `INSERT INTO health_metrics (user_id, device_id, metric_type, numeric_value, encrypted_data, recorded_at)
         VALUES ($1, $2, 'calories', $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [userId, deviceId, calories, encryptedCalories, date.toISOString()]
      );

      // Sleep (encrypted)
      const sleepHours = Math.random() * 3 + 5;
      const sleepData = {
        totalDurationMinutes: Math.round(sleepHours * 60),
        stages: [
          { stage: 'light', durationMinutes: Math.round(sleepHours * 60 * 0.4) },
          { stage: 'deep', durationMinutes: Math.round(sleepHours * 60 * 0.25) },
          { stage: 'rem', durationMinutes: Math.round(sleepHours * 60 * 0.2) },
          { stage: 'awake', durationMinutes: Math.round(sleepHours * 60 * 0.15) },
        ],
      };
      const encryptedSleep = encrypt(JSON.stringify(sleepData));
      await client.query(
        `INSERT INTO health_metrics (user_id, device_id, metric_type, numeric_value, encrypted_data, recorded_at)
         VALUES ($1, $2, 'sleep', $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [userId, deviceId, Math.round(sleepHours * 60), encryptedSleep, date.toISOString()]
      );
    }

    await client.query('COMMIT');
    console.log('Seed data inserted successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
