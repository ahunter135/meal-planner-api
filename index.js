const express = require("express");
const axios = require("axios");
const nunjucks = require("nunjucks");
const cors = require("cors");

//const Database = require("@replit/database");

//const db = new Database();

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const mongo = require("./database.js");
const banano = require("./banano.js");
const dayjs = require("dayjs");
const crypto = require("crypto");
require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const blacklist = [
  "ban_3qyp5xjybqr1go8xb1847tr6e1ujjxdrc4fegt1rzhmcmbtntio385n35nju",
  "ban_1yozd3rq15fq9eazs91edxajz75yndyt5bpds1xspqfjoor9bdc1saqrph1w",
  "ban_1894qgm8jym5xohwkngsy5czixajk5apxsjowi83pz9g6zrfo1nxo4mmejm9",
  "ban_38jyaej59qs5x3zim7t4pw5dwixibkjw48tg1t3i9djyhtjf3au7c599bmg3",
  "ban_3a68aqticd6wup99zncicrbkuaonypzzkfmmn66bxexfmw1ckf3ewo3fmtm9",
  "ban_3f9j7bw9z71gwjo7bwgpfcmkg7k8w7y3whzc71881yrmpwz9e6c8g4gq4puj",
  "ban_3rdjcqpm3j88bunqa3ge69nzdzx5a6nqumzc4ei3t1uwg3ciczw75xqxb4ac",
];
let db = mongo.getDb();
let collection;
let offline = true;
db.then((db) => {
  collection = db.collection("collection");
});

async function insert(addr, value) {
  await collection.insertOne({ address: addr, value: value });
}

async function replace(addr, newvalue) {
  await collection.replaceOne(
    { address: addr },
    { address: addr, value: newvalue }
  );
}

async function find(addr) {
  return await collection.findOne({ address: addr });
}

async function count(query) {
  return await collection.count(query);
}
const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());
const claim_freq = 86400000;
function clearCache() {
  ip_cache = {};
}
setInterval(clearCache, claim_freq * 1.3);

const faucet_addr = process.env.BANADDR;

app.get("/currentBalance", async function (req, res) {
  let current_bal = await banano.check_bal(faucet_addr);
  res.send(current_bal);
});
app.post("/", async function (req, res) {
  if (process.env.OFFLINE === "true") {
    return res.status(400).send("Faucet is Offline");
  }
  let errors = false;
  let phone = req.body["phone"];
  let address = req.body["addr"];
  processBan(phone, address, res);
});

async function sendPhoneVerification(phone) {
  let verification = await client.verify
    .services("VA3c726d3c0fe3ea181888fd514dbf4960")
    .verifications.create({ to: phone, channel: "sms" });

  return verification;
}

async function processBan(phone, address, res) {
  let amount = Math.floor(Math.random() * 8) / 100 + 0.01;
  let current_bal = await banano.check_bal(faucet_addr);
  if (Number(current_bal) > 100) {
    amount = Math.floor(Math.random() * 12) / 100 + 0.03;
  }
  if (await banano.is_unopened(address)) {
    amount = 0.01;
  }
  let valid = await banano.is_valid(address);

  if (!valid) {
    errors = "Invalid address";
    return res.status(401).send(errors);
  }

  let dry = await banano.faucet_dry();

  let account_history = await banano.get_account_history(address);

  if (
    banano.address_related_to_blacklist(account_history, blacklist) ||
    blacklist.includes(address)
  ) {
    errors =
      "This address is blacklisted because it is cheating and farming faucets (or sent money to an address participating in cheating and farming). If you think this is a mistake message me (u/prussia_dev) on reddit. If you are a legitimate user impacted by this, please use a different address or try again.";
    return res.status(401).send(errors);
  }

  if ((await banano.is_unopened(address)) && no_unopened) {
    errors =
      "Hello! Currently unopened accounts are not allowed to claim, because the faucet is under attack. We apologize to legitimate users.";
    return res.status(401).send(errors);
  }

  if (dry) {
    errors = "Faucet is Dry :(";
    return res.status(401).send(errors);
  }

  let db_result = await find(address);
  if (db_result) {
    let today = dayjs();
    let entryDate = dayjs(db_result.value.date);
    let diff = today.diff(entryDate, "hour");
    console.log(db_result);
    if (diff < 24) {
      return res.status(400).send("Request too soon");
    }
    if (!db_result.value.verified || phone !== db_result.value.phone) {
      //Phone is not verified, send verification now.
      await sendPhoneVerification(phone);
      await replace(address, {
        date: db_result.value.date,
        phone: phone,
        verified: false,
      });
      return res.status(401).send("Please verify your phone number.");
    }
  } else {
    // Initial attempt, verifiy phone
    await sendPhoneVerification(phone);
    await insert(address, {
      date: dayjs().subtract(25, "hours").toISOString(),
      phone: phone,
      verified: false,
    });
    return res.status(401).send("Please verify your phone number.");
  }

  send = await banano.send_banano(address, amount);

  if (!send) {
    return res.status(401).send("Invalid Address");
  }
  await replace(address, {
    date: dayjs().toISOString(),
    phone: phone,
    verified: true,
  });

  return res.status(200).send("Success");
}

app.post("/verifyPhone", async function (req, res) {
  let verification = req.body["code"];
  let phone = req.body["phone"];
  let address = req.body["addr"];
  console.log("verifying");
  let verificationCheck = await client.verify
    .services("VA3c726d3c0fe3ea181888fd514dbf4960")
    .verificationChecks.create({ to: phone, code: verification });

  if (verificationCheck.status === "approved" && verificationCheck.valid) {
    //Good to go. Send the BAN!
    replace(address, {
      date: dayjs().subtract(25, "hours").toISOString(),
      phone: phone,
      verified: true,
    });
    processBan(phone, address, res);
  } else {
    res.status(401).send("Code was invalid.");
  }
});

app.listen(process.env.PORT || 5000, () => {
  banano.receive_deposits();

  console.log(`App on`);
});
