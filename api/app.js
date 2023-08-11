const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('./config/config');
const sheduledJobs = require('./scheduledJobs/scheduledJobs');

const todoItemRouter = require('./routes/todoItemRouter');
const authRouter = require('./routes/authRouter');

const { cookieJwtAuth } = require('./middleware/cookieJwtAuth');

sheduledJobs.registerSheduledJobs();

const app = express();
app.use(cors({ credentials: true, origin: true }));

app.use(express.json());
app.use(cookieParser());

app.use('/api/todo', cookieJwtAuth, todoItemRouter);
app.use('/api/auth', authRouter);

const run = () => {
  mongoose.connect(config.mongoUrl, { useUnifiedTopology: true })
    .catch((err) => { console.log(`Mongodb err: ${err}`); })
    .then(() => { app.listen(config.appPort); })
    .catch((err) => { console.log(`Express server err: ${err}`); })
    .then(() => { console.log(`Сервер ожидает подключения http://localhost:${config.appPort}`); });
};

run();

module.exports.app = app;
