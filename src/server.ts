import ConfigService from './config';
import { app } from './app';

const config = ConfigService.load();
const server = app.listen(config.server.port, () => {
  // eslint-disable-next-line no-console -- startup confirmation is required in local and hosted logs.
  console.log(`Habit tracker API listening on port ${config.server.port}`);
});
const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
