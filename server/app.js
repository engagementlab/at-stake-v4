/* eslint-disable no-console */
/**
 * @Stake server
 * Developed by Engagement Lab, 2015-19
 * ==============
 * App start
 *
 * @author Johnny Richardson
 *
 * ==========
 */

// Load .env vars
if (process.env.NODE_ENV !== 'test') require('dotenv').config();

const winston = require('winston'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  bootstrap = require('@engagementlab/el-bootstrapper'),
  express = require('express');

const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const {
      timestamp,
      level,
      message,
      ...args
    } = info;

    const ts = timestamp.slice(0, 19).replace('T', ' ');
    return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
  }),
);

// Globals
_ = require('underscore');

logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [new winston.transports.Console()],
});

const app = express();

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

bootstrap.start(

  './config.json',

  app,
  `${__dirname}/`, {
    name: '@Stake CMS',
  },

  () => {
    mongoose.connect('mongodb://localhost/at-stake', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));

    // Load sockets and serve http
    const http = require('http').Server(app);
    require('./sockets/')(http);

    // Start redis on core lib
    let redis = require('learning-games-core').Redis;
    redis.Init(async () => {
      /*  
      redis.SetHash('sesh', 'player.uid', JSON.stringify({
        id: 0,
        id2: 1
      }));

      let res2 = await redis.GetHashLength('sesh');
      console.log(res2) 
      */
    });

    http.listen(process.env.PORT);
  }

);