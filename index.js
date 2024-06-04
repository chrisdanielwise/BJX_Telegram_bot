const express = require('express');
const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');
const db = require('./db');
const urlRegex = require('url-regex');

dotenv.config();

const app = express();

// Initialize Bot
const bot = new Telegraf(process.env.BOT_TOKE || "7026098228:AAHRR_c3T6kgt0ybg-l4fWg3lkPxVGJsZdw");

// Basic Messages
const welcomeMessage = `Welcome,
I am BxJS Telegram Bot.
send me your links to store them.
`
const helpMessage = `Send me a link`

// Basic Commands
bot.start((ctx) => { ctx.reply(welcomeMessage) })
bot.help((ctx) => { ctx.reply(helpMessage) })

// Listen to Command
bot.hears(/new episode (.+)/, async (ctx) => {
  const userId = ctx.from.id
  const episodeName = ctx.match[1]

  // Remove all old Episode
  await db.remove({ userId }, { multi: true })

  // Create new Users
  db.insert({ userId, episodeName, Links: [] })
  ctx.reply(`New episode created with name: ${episodeName}`)
})
bot.hears(urlRegex(), async (ctx) => {
  // Get urls from message text
  const urls = ctx.message.text.match(urlRegex())
  const firstUrl = urls[0]
  // Get user Id
  const userId = ctx.from.id

  // Find current episode
  await db.update({ userId }, { $push: { links: firstUrl } })
  ctx.reply('Link saved')
})

// Start Bot
bot.startPolling();

// Express Server
app.use(bot.webhookCallback('/bot'));
app.get('/', (req, res) => {
  res.send('BxJS Telegram Bot');
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});