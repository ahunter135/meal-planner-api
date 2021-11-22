const mongo = require("mongodb");
require("dotenv").config();

let client = new mongo.MongoClient(
  "mongodb+srv://admin:" +
    encodeURIComponent(process.env.DBPASS) +
    "@cluster0.0t6cr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

module.exports = {
  getDb: async function () {
    await client.connect();
    return client.db("db");
  },
};
