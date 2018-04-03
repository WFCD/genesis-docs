// Routing page for pages on the root level

const express = require('express');
const logger = require('winston');
const SQL = require('sql-template-strings');
const mysql = require('mysql2/promise');

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

router.get('/', async (req, res) => {
  logger.info(`Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  if (req.isAuthenticated()) {
    const guilds = req.user.guilds;
    const guildIds = guilds.map(guild => guild.id);

    const query = SQL `select distinct guild_id from channels where guild_id in (${guildIds});`;
    const queryResult = await db.query(query);

    logger.error(queryResult[0]);
  }
  res.render('index', {
    title: 'Index',
    loggedIn: req.isAuthenticated(),
    user: req.user,
    guilds: 'beep'
  });
});

module.exports = router;
