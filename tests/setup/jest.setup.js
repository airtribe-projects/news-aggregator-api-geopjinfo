import { setupDB, teardownDB, clearDB } from './db.setup.js';

beforeAll(async () => {
  await setupDB();
});

beforeEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await teardownDB();
});
