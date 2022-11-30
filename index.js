require("dotenv").config();
const DiscordClient = require("./structures/Client");

// TODO - Logging
const client = new DiscordClient({token: `${process.env.DISCORD_BOT_TOKEN}`});
client.start().then(() => {console.log(`Structure "Client" started.`)});