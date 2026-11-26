import { app } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
async function bootstrap() {
  await connectDatabase();
  const server = app.listen(env.PORT, () => console.info(`DEVFLOW API listening on http://localhost:${env.PORT}`));
  const shutdown = (signal: string) => { console.info(`${signal} received; shutting down`); server.close(() => process.exit(0)); setTimeout(() => process.exit(1), 10000).unref(); };
  process.on('SIGTERM', () => shutdown('SIGTERM')); process.on('SIGINT', () => shutdown('SIGINT'));
}
bootstrap().catch(error => { console.error('Failed to start DEVFLOW API:', error); process.exit(1); });
