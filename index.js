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

const crypto = require("crypto");
require("dotenv").config();
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

app.post("/", async function (req, res) {
  console.log(req.body["addr"]);

  let errors = false;
  let address = req.body["addr"];
  let given = false;
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
    console.log(address);
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

  send = await banano.send_banano(address, amount);
  if (!send) {
    return res.status(401).send("Invalid Address");
  }
  return res.status(200).send("Success");
  /*
  if (captcha_resp["success"] && !dry) {
    //check cookie
    if (req.cookies["last_claim"]) {
      if (Number(req.cookies["last_claim"]) + claim_freq < Date.now()) {
        //let db_result = await db.get(address);
        let db_result = await find(address);
        if (db_result) {
          db_result = db_result["value"];
          if (Number(db_result) + claim_freq < Date.now()) {
            //all clear, send bananos!
            send = await banano.send_banano(address, amount);
            if (send == false) {
              errors = "Send failed";
            } else {
              res.cookie("last_claim", String(Date.now()));
              //await db.set(address,String(Date.now()));
              await replace(address, String(Date.now()));
              given = true;
            }
          } else {
            errors = "Last claim too soon";
          }
        } else {
          //all clear, send bananos!
          send = await banano.send_banano(address, amount);
          if (send == false) {
            errors = "Send failed";
          } else {
            res.cookie("last_claim", String(Date.now()));
            //await db.set(address,String(Date.now()));
            await insert(address, String(Date.now()));
            given = true;
          }
        }
      } else {
        //add errors
        errors = "Last claim too soon";
      }
    } else {
      //check db
      //let db_result = await db.get(address);
      let db_result = await find(address);
      if (db_result) {
        db_result = db_result["value"];
        if (Number(db_result) + claim_freq < Date.now()) {
          //all clear, send bananos!
          send = await banano.send_banano(address, amount);
          if (send == false) {
            errors = "Invalid address";
          } else {
            res.cookie("last_claim", String(Date.now()));
            //await db.set(address,String(Date.now()));
            await replace(address, String(Date.now()));
            given = true;
          }
        } else {
          errors = "Last claim too soon";
        }
      } else {
        //all clear, send bananos!
        send = await banano.send_banano(address, amount);
        if (send == false) {
          errors = "Invalid address";
        } else {
          res.cookie("last_claim", String(Date.now()));
          //await db.set(address,String(Date.now()));
          await insert(address, String(Date.now()));
          given = true;
        }
      }
    }
  } else {
    errors = "captcha incorrect or faucet dry";
  }
  
  return res.send(
    nunjucks.render("index.html", {
      errors: errors,
      address: address,
      given: given,
      amount: amount,
      current_bal: String(current_bal),
      on_break: on_break,
      faucet_addr: faucet_addr,
    })
  );
  */
});

app.listen(process.env.PORT || 5000, () => {
  banano.receive_deposits();

  console.log(`App on`);
});
