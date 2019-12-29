'use strict';

const express = require('express');
const logger = require('winston');

const router = express.Router();

logger.level = process.env.LOG_LEVEL || 'error'; // default to error, we don't need everything

router.get('/', (req, res) => {
  logger.info(`Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.render('index', { title: 'Index' });
});

router.get('/404', (req, res) => {
  logger.info(`Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.render('404', { title: '404 Error' });
});

router.get('*', (req, res) => {
  logger.error(`ABNORMAL ${req.method} REQUEST for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.render('404', { title: '404 Error' });
});

module.exports = router;
