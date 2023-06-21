const mongo = require("mongodb");
require("dotenv").config();

let client = new mongo.MongoClient(
  process.env.DB_CONN_STRING,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

module.exports = {
  getDb: async function () {
    await client.connect();
    return client.db("db");
  },
};
