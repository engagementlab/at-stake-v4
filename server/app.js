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
import {
  format as _format,
  createLogger,
  transports as _transports,
} from 'winston';
import { json, urlencoded } from 'body-parser';
import { connect, connection } from 'mongoose';

import { start } from '@engagementlab/el-bootstrapper';
import express from 'express';

if (process.env.NODE_ENV !== 'test') require('dotenv').config();

const logFormat = _format.combine(
  _format.colorize(),
  _format.timestamp(),
  _format.align(),
  _format.printf((info) => {
    const {
      timestamp, level, message, ...args
    } = info;

    const ts = timestamp.slice(0, 19).replace('T', ' ');
    return `${ts} [${level}]: ${message} ${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
    }`;
  }),
);

// Globals
_ = require('underscore');

logger = createLogger({
  level: 'info',
  format: logFormat,
  transports: [new _transports.Console()],
});

const app = express();

// for parsing application/json
app.use(json());

// for parsing application/xwww-
app.use(
  urlencoded({
    extended: true,
  }),
);

start(
  './config.json',
  app,
  `${__dirname}/`,
  {
    name: '@Stake CMS',
  },
  () => {
    connect('mongodb://localhost/at-stake', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = connection;
    db.on('error', console.error.bind(console, 'connection error:'));

    // Load sockets and serve http
    const http = require('http').Server(app);
    require('./sockets/')(http);

    http.listen(process.env.PORT);
  },
);
