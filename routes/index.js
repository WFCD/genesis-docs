'use strict';

// Routing page for pages on the root level

const express = require('express');
const logger = require('winston');
const SQL = require('sql-template-strings');
const mysql = require('mysql2/promise');
const Promise = require('bluebird');
const Discord = require('discord.js');

const router = express.Router();

logger.level = process.env.LOG_LEVEL || 'error'; // default to error, we don't need everything

const defaults = {
  prefix: '/',
  respond_to_settings: true,
  platform: 'pc',
  language: 'en',
  delete_after_respond: true,
  delete_response: true,
  createPrivateChannel: false,
  deleteExpired: false,
  allowCustom: false,
  allowInline: false,
  defaultRoomsLocked: true,
  defaultNoText: false,
  defaultShown: false,
  tempCategory: false,
};

const opts = {
  supportBigNumbers: true,
  bigNumberStrings: true,
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'genesis',
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB || 'genesis',
  Promise,
};
const db = mysql.createPool(opts);

/* Utility Functions */
/**
 * Doing this as we need to get the guild list each time they go to a page.
 *
 * @param  {Object} req request to get information from
 * @returns {Array.<Object>} list of accessible guilds
 */
async function getGuilds(req) {
  let guilds;
  if (req.isAuthenticated()) {
    ({ guilds } = req.user);
    const guildIds = guilds ? guilds.map(guild => guild.id) : [];

    const query = SQL`select distinct guild_id from channels where guild_id in (${guildIds});`;
    const queryResult = (await db.query(query))[0].map(row => row.guild_id);

    guilds = guilds.filter((guild) => {
      const hasGuild = queryResult.indexOf(guild.id) !== -1;

      const perm = new Discord.Permissions(guild.permissions);
      const hasPerm = perm.has('MANAGE_ROLES', true);
      return hasPerm && hasGuild;
    });
  }
  return guilds;
}

/**
 * Aggregate channel settings
 * @param  {Object}        guild Guild to get channel settings for
 * @returns {Object.<Object>}         settings for each channel in the array
 */
async function aggregateChannels(guild) {
  const channelIds = (await db.query(SQL`select distinct id from channels where guild_id = ${guild.id};`))[0].map(row => row.id);
  const settings = {};
  channelIds.forEach((channelId) => {
    settings[channelId] = {};
  });
  const channelQuery = SQL`select * from settings where channel_id in (${channelIds})
    and setting in ('language', 'platform', 'allowCustom', 'allowInline',
      'createPrivateChannel', 'respond_to_settings', 'delete_after_respond', 'delete_response');`;

  const settingResults = await db.query(channelQuery);

  if (settingResults[0]) {
    settingResults[0].map(row => ({
      channel: row.channel_id,
      setting: row.setting,
      value: row.val,
    })).forEach((row) => {
      if (row.setting.indexOf('webhook') === -1) {
        settings[`${row.channel}`][row.setting] = row.value;
      }
    });

    /* eslint-disable no-param-reassign */
    Object.keys(settings).forEach((channel) => {
      const channelSettings = settings[channel];

      if (!channelSettings.platform) {
        channelSettings.platform = defaults.platform;
      }

      if (!channelSettings.prefix) {
        channelSettings.prefix = defaults.prefix;
      }
      if (typeof channelSettings.allowCustom === 'undefined') {
        channelSettings.allowCustom = defaults.allowCustom === '1';
      } else {
        channelSettings.allowCustom = channelSettings.allowCustom === '1';
      }
      if (typeof channelSettings.allowInline === 'undefined') {
        channelSettings.allowInline = defaults.allowInline === '1';
      } else {
        channelSettings.allowInline = channel.allowInline === '1';
      }

      if (typeof channelSettings.defaultRoomsLocked === 'undefined') {
        channelSettings.defaultRoomsLocked = defaults.defaultRoomsLocked === '1';
      } else {
        channelSettings.defaultRoomsLocked = channel.defaultRoomsLocked === '1';
      }

      if (typeof channelSettings.defaultNoText === 'undefined') {
        channelSettings.defaultNoText = defaults.defaultNoText === '1';
      } else {
        channelSettings.defaultNoText = channel.defaultNoText === '1';
      }

      if (typeof channelSettings.defaultShown === 'undefined') {
        channelSettings.defaultShown = defaults.defaultShown === '1';
      } else {
        channelSettings.defaultShown = channel.defaultShown === '1';
      }

      if (typeof channelSettings.createPrivateChannel === 'undefined') {
        channelSettings.createPrivateChannel = defaults.createPrivateChannel === '1';
      } else {
        channelSettings.createPrivateChannel = channel.createPrivateChannel === '1';
      }
    });
    /* eslint-enable no-param-reassign */
  }
  return settings;
}

/**
 * Get settings for single guild
 * @param  {Object} guild guild without settings
 * @returns {Object}      guild with settings
 */
async function getGuild(guild) { /* eslint-disable no-param-reassign */
  guild.channels = await aggregateChannels(guild);

  /*
  'defaultRoomsLocked', 'defaultNoText', 'defaultShown',
  'tempCategory', 'lfgChannel',
   */
  return guild;
}
/* End utility functions */


router.get('/', async (req, res) => {
  logger.info(`Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);

  res.render('index', {
    title: 'Index',
    loggedIn: req.isAuthenticated(),
    user: req.user,
    guilds: await getGuilds(req),
  });
});

router.get('/guild/:id', async (req, res) => {
  if (req.isAuthenticated()) {
    // Main guild page for dashboard
    // db get guild?
    let guild;
    const filteredGuilds = req.user.guilds.filter(userGuild => userGuild.id === req.params.id);
    if (filteredGuilds.length) {
      ([guild] = filteredGuilds);
    }
    res.render('guild', {
      title: guild ? guild.name : 'Nobody\'s Here',
      loggedIn: req.isAuthenticated(),
      user: req.user,
      guilds: await getGuilds(req),
      guild: guild ? await getGuild(guild) : {},
    });
  } else {
    res.redirect('/');
  }
});

module.exports = router;
