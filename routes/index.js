// Routing page for pages on the root level

const express = require('express');
const logger = require('winston');

const router = express.Router();

logger.level = process.env.LOG_LEVEL || 'error'; // default to error, we don't need everything

router.get('/', (req, res) => {
  logger.info(`Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.render('index', {
    title: 'Index',
    loggedIn: req.isAuthenticated(),
    user: req.user
  });
});

module.exports = router;
