const fs = require("fs-extra");
const path = require("path");
const gradient = require("gradient-string");

async function loadCommands() {
  const commandPath = path.join(__dirname, "Yue", "commands");

  const commandFiles = fs
    .readdirSync(commandPath)
    .filter((file) => file.endsWith(".js"));

  const { botCmds } = global.Yue;

  commandFiles.forEach((file) => {
    const startTime = new Date();
    const cmdName = path.basename(file, ".js");
    botCmds[cmdName] = require(path.join(commandPath, file));
    const endTime = new Date();

    const duration = endTime - startTime;
    const loadingLog = gradient.rainbow(`Loaded ${cmdName}.js (${duration}ms)`);
    console.log(loadingLog);
  });
}

function loadVersion() {
  try {
    const packagePath = path.join(process.cwd(), "package.json");
    const packageData = fs.readJsonSync(packagePath);
    return packageData.version;
  } catch (error) {
    console.error("Error loading version:", error);
    return null;
  }
}

async function loadAppState() {
  try {
    const appStatePath = path.join(__dirname, "appstate.json");
    return fs.readJsonSync(appStatePath);
  } catch (error) {
    console.error("Error loading app state:", error);
    return null;
  }
}

module.exports = {
  loadCommands,
  loadVersion,
  loadAppState,
};
