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

router.get('/', async (req, res) => {
  logger.info(`Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  let guilds;
  if (req.isAuthenticated()) {
    guilds = req.user.guilds;
    const guildIds = guilds.map(guild => guild.id);

    const query = SQL`select distinct guild_id from channels where guild_id in (${guildIds});`;
    const queryResult = (await db.query(query))[0].map(row => row.guild_id);

    guilds = guilds.filter(guild => {
      const hasGuild = queryResult.indexOf(guild.id) !== -1;

      const perm = new Discord.Permissions(guild.permissions);
      const hasPerm = perm.has('MANAGE_ROLES', true);
      return hasPerm && hasGuild;
    });
  }
  res.render('index', {
    title: 'Index',
    loggedIn: req.isAuthenticated(),
    user: req.user,
    guilds
  });
});

module.exports = router;
