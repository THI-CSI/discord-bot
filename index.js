require('dotenv').config();
const DiscordClient = require('./structures/Client');

const client = new DiscordClient({ token: `${process.env.DISCORD_BOT_TOKEN}` });
client.start().then(() => {client.info('INTERNAL', ['Structure "Client" started.']);});