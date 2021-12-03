const express = require("express");
const axios = require("axios");
const nunjucks = require("nunjucks");
const cors = require("cors");
const _ = require("lodash");
//const Database = require("@replit/database");

//const db = new Database();

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const mongo = require("./database.js");
const banano = require("./banano.js");
const dayjs = require("dayjs");
const crypto = require("crypto");
const { bananojs } = require("./banano.js");
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
  db = await db;
  collection = db.collection("collection");
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

app.post("/createAccount", async function (req, res) {
  let address = req.body["address"];
  let password = req.body["password"];

  db = await db;
  collection = db.collection("banano_trivia");

  let db_result = await find(address);

  if (db_result) {
    return res.status(401).send("Account Already Exists");
  }
  insert(address, {
    password: password,
    accountBalance: 1,
  });

  res.send("Account Created");
});

app.post("/login", async function (req, res) {
  let address = req.body["address"];
  let password = req.body["password"];
  db = await db;
  collection = db.collection("banano_trivia");
  let db_result = await find(address);
  if (db_result) {
    if (db_result.value.password === password) {
      res.send(db_result);
    } else {
      res.status(401).send("Incorrect Password");
    }
  }
});
app.get("/accountBalance", async function (req, res) {
  db = await db;
  collection = db.collection("banano_trivia");
  let address = req.query.address;
  let db_result = await find(address);

  res.send(JSON.stringify(db_result.value.accountBalance));
});

app.get("/checkForDeposit", async function (req, res) {
  db = await db;
  collection = db.collection("banano_trivia");
  await banano.receive_deposits();
  let address = req.query.address;
  let account_history = await banano.get_account_history(process.env.BANADDR);
  let addressHistory = _.find(account_history.history, (a) => {
    let now = dayjs();
    let timestamp = dayjs.unix(a.local_timestamp);
    return (
      a.type === "receive" &&
      a.account === address &&
      now.diff(timestamp, "seconds") < 60
    );
  });
  if (addressHistory) {
    let db_result = await find(address);
    let accountBalance =
      parseInt(db_result.value.accountBalance) +
      parseInt(addressHistory.amount) / 100000000000000000000000000000;

    await replace(address, {
      password: db_result.value.password,
      accountBalance: accountBalance,
    });

    res.send({
      status: true,
    });
  } else {
    res.send({ status: false });
  }
});
app.post("/addToBalance", async function (req, res) {
  db = await db;
  collection = db.collection("banano_trivia");
  await banano.receive_deposits();
  let address = req.body["address"];
  let betAmount = req.body["bet"];

  let db_result = await find(address);

  if (db_result) {
    let balance = db_result.value.accountBalance + betAmount;

    await replace(address, {
      password: db_result.value.password,
      accountBalance: balance,
    });

    return res.send({
      status: true,
    });
  } else {
    return res.status(500).send({ status: false });
  }
});
app.post("/deductBalance", async function (req, res) {
  db = await db;
  collection = db.collection("banano_trivia");
  await banano.receive_deposits();
  let address = req.body["address"];
  let betAmount = req.body["bet"];

  let db_result = await find(address);

  if (db_result) {
    let balance = db_result.value.accountBalance - betAmount;

    if (balance < 0) {
      return res.status(400).send("Insufficient Balance");
    }
    await replace(address, {
      password: db_result.value.password,
      accountBalance: balance,
    });

    return res.send({
      status: true,
    });
  } else {
    return res.status(500).send({ status: false });
  }
});

app.post("/withdraw", async function (req, res) {
  db = await db;
  collection = db.collection("banano_trivia");
  await banano.receive_deposits();
  let address = req.body["address"];
  let db_result = await find(address);

  if (db_result) {
    if (db_result.value.accountBalance === 0)
      return res.status(400).send("Zero Balance");

    send = await banano.send_banano(address, db_result.value.accountBalance);

    if (!send) {
      return res.status(401).send("Invalid Address");
    } else {
      await replace(address, {
        password: db_result.value.password,
        accountBalance: 0,
      });
      res.status(200).send("Success");
    }
  } else {
    res.status(401).send("Something went wrong");
  }
});

app.listen(process.env.PORT || 5000, async () => {
  console.log(`App on`);
});
