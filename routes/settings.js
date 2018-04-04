// Routing page for pages on the root level

const express = require('express');
const logger = require('winston');
const SQL = require('sql-template-strings');
const mysql = require('mysql2/promise');
const Promise = require('bluebird');
const Discord = require('discord.js');

const router = express.Router();

logger.level = process.env.LOG_LEVEL || 'error'; // default to error, we don't need everything

const opts = {
  supportBigNumbers: true,
  bigNumberStrings: true,
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'genesis',
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB || 'genesis',
};
const db = mysql.createPool(opts);

// this is where we will handle requests comming from /guild/:id in /routes/index.js

router.post('/', async (req, res) => {
  // handle something in here & check they have permission to change setting
});

module.exports = router;
