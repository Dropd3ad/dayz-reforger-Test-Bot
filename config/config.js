const package = require('../package.json');
require('dotenv').config();

const PresenceTypes = {
  Playing:   0,
  Streaming: 1,
  Listening: 2,
  Watching:  3,
  Custom:    4,
  Competing: 5,
};

const PresenceStatus = {
  Online:       "online",
  Offline:      "offline",
  Idle:         "idle",
  DoNotDisturb: "dnd",
};

module.exports = {
	Dev: process.env.Dev || "DEV.",                     
	Version: package.version, // (major).(minor).(patch)
  Admins: ["362791661274660874", "329371697570381824"], // Admins of the bot
  SupportServer: "https://discord.gg/KVFJCvvFtK", // Support Server Link
	Token: process.env.token || "", //Discord Bot Token
  SecretKey: process.env.key || "01234567891",
  SecretIv: process.env.iv || "9876543210",
  EncryptionMethod: process.env.encryptionMethod || "aes-256-cbc",
  Scopes: ["identify", "guilds", "applications.commands"], //Discord OAuth2 Scopes
  IconURL: "",
  Colors: {
    Default: "#8a7c72",
    DarkRed: "#ba0f0f",
    Red:     "#f55c5c",
    Green:   "#32a852",
    Yellow:  "#ffb01f"
  },
  Permissions: 2205281600,
  mongoURI: process.env.mongoURI || "mongodb://localhost:27017",
  dbo: process.env.dbo || "knoldus",
  Presence: {
    type: PresenceTypes.Watching,
    name: "DayZ Logs", // What message you want after type
    status: PresenceStatus.Online
  },
}
