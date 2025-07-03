const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports = {
  setupDB: async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
  },
  teardownDB: async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
};
