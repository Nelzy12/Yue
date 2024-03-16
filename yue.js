const fs = require("fs-extra");
const path = require("path");
const login = require("./System/SysFCA/index");
const express = require("express");
const chalk = require("chalk");
const gradient = require("gradient-string");
/*const {
  addUserToDB,
  getThreadInfoFromDB,
  getUserInfoFromDB,
  addThreadToDB,
} = require("./System/SysDB/commands/index");
*/
const config = require("./config.json");
const utils = require("./utils");

const app = express();

global.Yue = {
  botPrefix: config.botPrefix,
  botAdmins: config.botAdmins,
  botCmds: {},
  PORT: config.PORT,
};

async function onBot() {
  const appState = fs.readJsonSync(path.join(__dirname, "appstate.json"));

  try {
    login({ appState }, (err, api) => {
      if (err) return console.error(err);

      api.setOptions({
        listenEvents: true,
        logLevel: "silent",
      });

      updateCheck();

      fs.writeFileSync("appstate.json", JSON.stringify(api.getAppState()));

      api.listenMqtt(async (err, event) => {
        if (err) {
          console.error("Error occurred while processing event:", err);
          return;
        }

        /*
        const userExists = await getUserInfoFromDB(event.senderID);

        if (!userExists) {
          addUserToDB(api, event.senderID);
        }

        const threadExists = await getThreadInfoFromDB(event.threadID);

        if (!threadExists) {
          await addThreadToDB(api, event.threadID);
        }
        */

        const box = {
          react: (emoji) => {
            api.setMessageReaction(emoji, event.messageID, () => {}, true);
          },
          reply: (msg) => {
            api.sendMessage(msg, event.threadID, event.messageID);
          },
          add: (uid) => {
            api.addUserToGroup(uid, event.threadID);
          },
          kick: (uid) => {
            api.removeUserFromGroup(uid, event.threadID);
          },
          send: (msg) => {
            api.sendMessage(msg, event.threadID);
          },
        };

        try {
          if (event.body && event.body.toLowerCase() === "prefix") {
            api.sendMessage(
              `My prefix is: [ ${global.Yue.botPrefix} ]`,
              event.threadID,
              event.messageID,
            );
          } else if (
            event.body &&
            event.body.toLowerCase().startsWith(global.Yue.botPrefix)
          ) {
            const [command, ...args] = event.body
              .slice(global.Yue.botPrefix.length)
              .trim()
              .split(" ");

            if (commands[command]) {
              commands[command].run({ api, event, args, box });
            } else {
              api.sendMessage(
                `❌ | Invalid command, use ${global.Yue.botPrefix}help to show available commands.`,
                event.threadID,
                event.messageID,
              );
            }
          }
        } catch (error) {
          console.error(
            `❌ | Error occurred whilst executing command:", error`,
          );
        }
      });
    });
  } catch (error) {
    console.error("Error occured whilst starting the bot", error);
    process.exit(1);
  }
}

async function start() {
  onBot();

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Public", "index.html"));
  });

  app.listen(global.Yue.PORT, async () => {
    const version = await utils.loadVersion();
    console.log(gradient.retro(`⟩ yuev1 - (${version}) 🙀`));
    console.log(gradient.retro("⟩ by ruingl ♥️"));
    console.log("");
    console.log(gradient.rainbow("Loaded Commands:"));
    utils.loadCommands();
    console.log("");
  });
}

start();
