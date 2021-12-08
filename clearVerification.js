const mongo = require("./database.js");
const dayjs = require("dayjs");

let db = mongo.getDb();
db.then(async (db) => {
  collection = db.collection("collection");
  let result = await collection.findOne({ address: "timeSinceReset" });
  if (result) {
    let timeSince = dayjs(result.value);
    let now = dayjs();
    let diff = now.diff(timeSince, "days");

    if (diff >= 7) {
      await collection.replaceOne(
        { address: "timeSinceReset" },
        { address: "timeSinceReset", value: dayjs().toISOString() }
      );
      collection.updateMany(
        {
          "value.verified": true,
        },
        { $set: { "value.verified": false } }
      );
    }
  }
});
