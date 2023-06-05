const express = require("express");
const cors = require("cors");
const _ = require("lodash");
const btoa = require("btoa");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const mongo = require("./database.js");

require("dotenv").config();

let db = mongo.getDb();
let collection;

db.then((db) => {
  collection = db.collection("collection");
});

async function mealFind(email) {
  return await collection.findOne({ email: email });
}

async function mealReplace(email, profile) {
  delete profile._id;
  await collection.replaceOne({ email: email }, profile);
}
const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

app.post("/loginToMeal", async function (req, res) {
  let email = req.body["email"];
  let password = req.body["password"];
  db = await db;
  collection = db.collection("meal_planner");
  let db_result = await mealFind(email);
  console.log(db_result);
  if (db_result) {
    if (db_result.password === btoa(password)) {
      return res.send(db_result);
    } else {
      return res.status(401).send("Incorrect Password");
    }
  } else {
    return res.status(401).send("No Account Found");
  }
});

app.post("/createAccount", async function (req, res) {
  
});

app.get("/refreshUserData", async function (req, res) {
  let email = req.query.email;
  db = await db;
  collection = db.collection("meal_planner");
  let db_result = await mealFind(email);
  if (db_result) {
    return res.send(db_result);
  } else {
    return res.status(401).send("No Account Found");
  }
});

app.post("/deleteItem", async function (req, res) {
  let email = req.body["email"];
  let item = req.body["item"];
  db = await db;
  collection = db.collection("meal_planner");
  let db_result = await mealFind(email);
  if (db_result) {
    let entries = db_result.entries;
    let foundEntry = _.findIndex(entries, (ent) => {
      return ent.id === item;
    });

    db_result.entries[foundEntry].deleted = true;
    await mealReplace(email, db_result);
    return res.send(db_result);
  } else {
    return res.status(401).send("No Account Found");
  }
});

app.post("/deleteWeeklyItem", async function (req, res) {
  let email = req.body["email"];
  let item = req.body["item"];
  db = await db;
  collection = db.collection("meal_planner");
  let db_result = await mealFind(email);
  if (db_result) {
    let entries = db_result.mustHaves;
    let foundEntry = _.findIndex(entries, (ent) => {
      return ent.id === item;
    });

    db_result.mustHaves[foundEntry].deleted = true;
    await mealReplace(email, db_result);
    return res.send(db_result);
  } else {
    return res.status(401).send("No Account Found");
  }
});

app.post("/updateUserProfile", async function (req, res) {
  let email = req.body["profile"].email;
  db = await db;
  collection = db.collection("meal_planner");
  let db_result = await mealFind(email);
  if (db_result) {
    await mealReplace(email, req.body["profile"]);
    return res.sendStatus(200);
  } else {
    return res.status(401).send("No Account Found");
  }
});

const http = require("http").Server(app);

http.listen(process.env.PORT || 5000, async () => {
  console.log("App Running on " + process.env.PORT);
});
