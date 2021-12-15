const express = require("express");
const axios = require("axios");
const nunjucks = require("nunjucks");
const cors = require("cors");
const _ = require("lodash");
//const Database = require("@replit/database");
const btoa = require("btoa");

//const db = new Database();

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const mongo = require("./database.js");
const banano = require("./banano.js");
const dayjs = require("dayjs");
const crypto = require("crypto");
const { bananojs } = require("./banano.js");
const { Server } = require("socket.io");

const { v4: uuidv4 } = require("uuid");
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
  "ban_1z4enynsuu1zjntswto46oyd884es6xocpafe6auo9badwapdwce89w8nui7",
];
let depositedBlocks = [];
let db = mongo.getDb();
let collection;
let withdrawalClosed = process.env.WITHDRAW;
let onlinePlayers = 0;

let lookingForLobby = [];
let lobbies = [];
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

async function mealFind(email) {
  return await collection.findOne({ email: email });
}

async function mealReplace(email, profile) {
  delete profile._id;
  await collection.replaceOne({ email: email }, profile);
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
    .services("VAf2fba9dbee512d79390fbc66d2885648")
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

  if (await banano.is_unopened(address)) {
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
    .services("VAf2fba9dbee512d79390fbc66d2885648")
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
    accountBalance: 0.4,
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
  let dpb = await find("depositedBlocks");
  let depositedBlocks = [];
  if (dpb) {
    depositedBlocks = dpb.value;
  }
  let addressHistory = _.find(account_history.history, (a) => {
    let now = dayjs();
    let timestamp = dayjs.unix(a.local_timestamp);
    let findIndex = _.findIndex(depositedBlocks, (b) => {
      return a.hash === b;
    });

    // Needs to check if block has already been used, if so; keep searching transactions
    return (
      findIndex === -1 &&
      a.type === "receive" &&
      a.account === address &&
      now.diff(timestamp, "seconds") < 60
    );
  });
  if (addressHistory) {
    if (!dpb) {
      await insert("depositedBlocks", [addressHistory.hash]);
    } else {
      dpb.value.push(addressHistory.hash);
      await replace("depositedBlocks", dpb.value);
    }
    let db_result = await find(address);
    let accountBalance =
      parseFloat(db_result.value.accountBalance) +
      parseFloat(addressHistory.amount) / 100000000000000000000000000000;

    accountBalance = parseFloat(accountBalance).toFixed(2);
    await replace(address, {
      password: db_result.value.password,
      accountBalance: accountBalance,
      lastWithdraw: db_result.value.lastWithdraw
        ? db_result.value.lastWithdraw
        : null,
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

  console.log(address);
  console.log(betAmount);
  let db_result = await find(address);

  if (db_result) {
    let balance = db_result.value.accountBalance - betAmount;

    if (balance < 0) {
      return res.status(400).send("Insufficient Balance");
    }
    await replace(address, {
      password: db_result.value.password,
      accountBalance: balance,
      lastWithdraw: db_result.value.lastWithdraw
        ? db_result.value.lastWithdraw
        : null,
    });

    return res.send({
      status: true,
    });
  } else {
    return res.status(500).send({ status: false });
  }
});
app.post("/withdraw", async function (req, res) {
  if (process.env.WITHDRAW === "false")
    return res.status(400).send("Withdrawal is Currently Closed");
  db = await db;
  collection = db.collection("banano_trivia");
  await banano.receive_deposits();
  let address = req.body["address"];
  if (blacklist.includes(address)) {
    errors =
      "This address is blacklisted because it is cheating and farming faucets (or sent money to an address participating in cheating and farming). If you think this is a mistake message me (u/prussia_dev) on reddit. If you are a legitimate user impacted by this, please use a different address or try again.";
    return res.status(401).send(errors);
  }
  let db_result = await find(address);

  if (db_result) {
    if (db_result.value.accountBalance === 0)
      return res.status(400).send("Zero Balance");

    if (db_result.value.lastWithdraw) {
      let lastWithdraw = dayjs(db_result.value.lastWithdraw);
      let now = dayjs();
      let diff = now.diff(lastWithdraw, "minutes");

      if (diff < 30) {
        return res
          .status(400)
          .send("You can only withdraw once every 30 minutes");
      }
    }
    send = await banano.send_banano(address, db_result.value.accountBalance);

    if (!send) {
      return res.status(401).send("Invalid Address");
    } else {
      await replace(address, {
        password: db_result.value.password,
        accountBalance: 0,
        lastWithdraw: dayjs().toISOString(),
      });
      res.status(200).send("Success");
    }
  } else {
    res.status(401).send("Something went wrong");
  }
});
app.get("/playerCount", async function (req, res) {
  return res.send(JSON.stringify(onlinePlayers));
});

const http = require("http").Server(app);
/*
app.listen(process.env.PORT || 5000, async () => {
  console.log(`App on`);
});
*/
/**
 * Start IO Stuff
 */
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
http.listen(process.env.PORT || 5000, async () => {
  console.log("Socket Open");
});
io.on("connection", (socket) => {
  onlinePlayers++;

  socket.on("disconnect", () => {
    if (onlinePlayers > 0) onlinePlayers--;
  });

  socket.on("looking for game", (id) => {
    _.find(lookingForLobby, (l) => {
      return id === l.address;
    });
    socket.join("waiting room");
    lookingForLobby.push({ id: socket.id, address: id });
    connectTwoUsers();
  });

  socket.on("leave waiting room", async () => {
    let user = _.find(lookingForLobby, (l) => {
      return socket.id === l.id;
    });
    let userIndex = _.findIndex(lookingForLobby, (l) => {
      return socket.id === l.id;
    });

    lookingForLobby.splice(userIndex, 1);

    db = await db;
    collection = db.collection("banano_trivia");
    let db_result = await find(user.address);
    if (db_result) {
      await replace(user.address, {
        password: db_result.value.password,
        accountBalance: db_result.value.accountBalance + 0.2,
        lastWithdraw: db_result.value.lastWithdraw
          ? db_result.value.lastWithdraw
          : null,
      });
    }
    socket.leave("waiting room");
  });

  socket.on("leave room", (data) => {
    socket.leave(data);
  });

  socket.on("answered question", (data) => {
    let usedRoomIndex = _.findIndex(lobbies, (r) => {
      return r.id === data.room;
    });

    let answer = data.answer;
    let user = socket.id;
    let roomUserIndex = _.findIndex(lobbies[usedRoomIndex].players, (p) => {
      return p.socket === user;
    });
    if (lobbies[usedRoomIndex].currentQuestion.correct_answer === answer) {
      lobbies[usedRoomIndex].players[roomUserIndex].score++;
    }

    lobbies[usedRoomIndex].players[roomUserIndex].answered = true;
  });
});

var Room = function (id, questions) {
  this.id = "game" + id;
  this.timeRemaining = 5;
  this.questions = questions;
  this.timer = setInterval(this.timerFunction.bind(this), 1000);
  this.currentQuestionIndex = 0;
  this.currentQuestion = this.questions[this.currentQuestionIndex];
  this.players = [];
  this.emitQuestion = this.emitQuestion.bind(this);
  return this;
};

Room.prototype.timerFunction = function () {
  if (!this.players[0].answered || !this.players[1].answered) {
    this.timeRemaining--;
  } else if (this.players[0].answered && this.players[1].answered) {
    this.timeRemaining = 0;
  }

  if (this.timeRemaining === 0) {
    this.players[0].answered = false;
    this.players[1].answered = false;
    this.timeRemaining = 12;
    this.emitQuestion();
  }
  io.to(this.id).emit("counter", this.timeRemaining);
};

Room.prototype.emitQuestion = async function () {
  if (this.currentQuestionIndex + 1 == this.questions.length) {
    clearInterval(this.timer);
    db = await db;
    collection = db.collection("banano_trivia");
    await banano.receive_deposits();
    if (this.players[0].score > this.players[1].score) {
      let db_result = await find(this.players[0].id);

      if (db_result) {
        await replace(this.players[0].id, {
          password: db_result.value.password,
          accountBalance: db_result.value.accountBalance + 0.4,
          lastWithdraw: db_result.value.lastWithdraw
            ? db_result.value.lastWithdraw
            : null,
        });
      }
    } else if (this.players[1].score > this.players[0].score) {
      let db_result = await find(this.players[1].id);

      if (db_result) {
        await replace(this.players[1].id, {
          password: db_result.value.password,
          accountBalance: db_result.value.accountBalance + 0.4,
          lastWithdraw: db_result.value.lastWithdraw
            ? db_result.value.lastWithdraw
            : null,
        });
      }
    } else if (this.players[0].score === this.players[1].score) {
      let db_result = await find(this.players[0].id);

      if (db_result) {
        await replace(this.players[0].id, {
          password: db_result.value.password,
          accountBalance: db_result.value.accountBalance + 0.2,
          lastWithdraw: db_result.value.lastWithdraw
            ? db_result.value.lastWithdraw
            : null,
        });
      }
      db_result = await find(this.players[1].id);

      if (db_result) {
        await replace(this.players[1].id, {
          password: db_result.value.password,
          accountBalance: db_result.value.accountBalance + 0.2,
          lastWithdraw: db_result.value.lastWithdraw
            ? db_result.value.lastWithdraw
            : null,
        });
      }
    }

    io.to(this.id).emit("game over", this.players);
  } else {
    this.currentQuestionIndex++;
    this.currentQuestion = this.questions[this.currentQuestionIndex];

    io.to(this.id).emit("new question", {
      question: this.currentQuestion,
      players: this.players,
    });
  }
};

async function connectTwoUsers() {
  if (lookingForLobby.length >= 2) {
    for (var i = 0; i < lookingForLobby.length; i++) {
      let user1 = lookingForLobby.shift();
      let user2 = lookingForLobby.shift();
      var gameId = uuidv4();

      let socketUser1 = io.sockets.sockets.get(user1.id);
      socketUser1.leave("waiting room");

      let socketUser2 = io.sockets.sockets.get(user2.id);
      socketUser2.leave("waiting room");

      socketUser1.join("game" + gameId);
      socketUser2.join("game" + gameId);

      const response = await axios.get("https://opentdb.com/api.php?amount=7");

      let room = new Room(gameId, response.data.results);
      io.to(room.id).emit("joined room", {
        id: room.id,
        players: [
          { id: user1.address, score: 0, answered: false, socket: user1.id },
          { id: user2.address, score: 0, answered: false, socket: user2.id },
        ],
      });
      room.players = [
        { id: user1.address, score: 0, answered: false, socket: user1.id },
        { id: user2.address, score: 0, answered: false, socket: user2.id },
      ];
      lobbies.push(room);
    }
  }
}

setInterval(() => {
  banano.receive_deposits();
}, 24000);
