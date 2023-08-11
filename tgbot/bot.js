const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const axios = require('axios');

const config = require('./config');
const utils = require('./utils');
const telegramUserJwt = require('./telegramUserJwt');

const bot = new Telegraf(config.botToken);

const API = axios.create({
  withCredentials: true,
  baseURL: config.APIURL,
});

bot.command('start', async (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, 'Welcome. Please log in using the command /login username password');
});

bot.command('login', async (ctx) => {
  const args = utils.getCommandArgs(ctx);
  const tgUserId = ctx.message.from.id;
  try {
    const response = await API.post('/auth/login', {
      username: args[0],
      password: args[1],
    });
    if (response.data.status === 'ok') {
      let tmpTgUser;
      try {
        tmpTgUser = await telegramUserJwt.findOne({ tgUserId }).lean();
      } catch {
        bot.telegram.sendMessage(ctx.chat.id, 'An error has occurred1.');
        return;
      }
      if (tmpTgUser) {
        try {
          await telegramUserJwt.findOneAndUpdate({ userid: tgUserId }, { token: response.data.token });
          bot.telegram.sendMessage(ctx.chat.id, `Successful login. Token:${response.data.token}`);
          return;
        } catch {
          bot.telegram.sendMessage(ctx.chat.id, 'An error has occurred2.');
          return;
        }
      } else {
        try {
          const user = new telegramUserJwt({ userid: tgUserId, token: response.data.token });
          await user.save();
          bot.telegram.sendMessage(ctx.chat.id, `Successful login. Token:${response.data.token}`);
        } catch (err) {
          console.log(err);
          bot.telegram.sendMessage(ctx.chat.id, 'An error has occurred3.');
          return;
        }
      }
    }
  } catch {
    bot.telegram.sendMessage(ctx.chat.id, 'An error has occurred. Possibly incorrect login data.');
  }
});

bot.command('all', async (ctx) => {
  const tgUserId = ctx.message.from.id;
  let user;
  try {
    user = await telegramUserJwt.findOne({ userid: tgUserId });
  } catch {
    bot.telegram.sendMessage(ctx.chat.id, 'An error has occurred1.');
    return;
  }
  if (!user) {
    bot.telegram.sendMessage(ctx.chat.id, 'An error has occurred. Please /login.');
  }
  try {
    const response = await API.get('/todo/all', { headers: { Cookie: `token=${user.token}` } });
    let message = '';
    let counter = 1;
    response.data.todoItems.forEach((element) => {
      message += `${counter}. `;
      message += `${element.isCompleted ? '✅' : '⏺'} ${element.text}`;
      message += `\n${element._id}`;
      message += '\n\n';
      counter += 1;
    });
    bot.telegram.sendMessage(ctx.chat.id, message);
  } catch {
    bot.telegram.sendMessage(ctx.chat.id, 'An error has occurred2.');
  }
});

bot.command('add', async (ctx) => {
  const { text } = ctx.message;
  const tgUserId = ctx.message.from.id;
  let user;
  try {
    user = await telegramUserJwt.findOne({ userid: tgUserId });
  } catch {
    bot.telegram.sendMessage(ctx.chat.id, 'An error has occurred1.');
    return;
  }
  if (!user) {
    bot.telegram.sendMessage(ctx.chat.id, 'An error has occurred. Please /login.');
    return;
  }
  try {
    console.log(user.token);
    console.log('token=', user.token);
    const response = await API.post('/todo/', {
      headers: { Cookie: `token=${user.token}` },
      text,
      datePlannedCompletion: '2222-22-22',
      withCredentials: true,
    });
    bot.telegram.sendMessage(ctx.chat.id, 'Done.');
  } catch (e) {
    bot.telegram.sendMessage(ctx.chat.id, 'An error has occured.');
    // console.log(e);
  }
});

const run = () => {
  mongoose.connect(config.mongoUrl, { useUnifiedTopology: true })
    .catch((err) => { console.log(`Mongodb err: ${err}`); })
    .then(() => { bot.launch(); })
    .catch((err) => { console.log(`Telegram bot err: ${err}`); })
    .then(() => { console.log('Bot has been started...'); });
};

run();
