import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './config/database.js';

async function main() {
  const app = await createApp();

  // Verify database connection
  try {
    await pool.query('SELECT 1');
    app.log.info('Database connected');
  } catch (err) {
    app.log.error({ err }, 'Database connection failed');
    process.exit(1);
  }

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`Server running on port ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
