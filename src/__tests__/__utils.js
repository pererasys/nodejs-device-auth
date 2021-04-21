const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

const mongod = new MongoMemoryServer();

const buildDatabase = async () => {
  const uri = await mongod.getUri();

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  };

  await mongoose.connect(uri, options);
};

const terminateDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};

module.exports = { buildDatabase, terminateDatabase, clearDatabase };
