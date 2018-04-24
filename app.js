'use strict';

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const logger = require('winston');
require('handlebars-helpers')();

const app = express();
const scopes = ['identify', 'guilds'];
logger.level = process.env.LOG_LEVEL || 'error';
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', handlebars({
  defaultLayout: 'main',
  extname: '.hbs',
}));
app.set('view engine', '.hbs');

// favicon and caching options (cache is 7 days)
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 604800000,
}));

// oauth

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});


passport.use(new DiscordStrategy({
  clientID: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  callbackURL: 'http://127.0.0.1:3647/callback',
  scope: scopes,
}, ((accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
  })));

app.use(session({
  secret: require('crypto').randomBytes(64).toString('hex'), // eslint-disable-line global-require
  resave: true,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// default node js includes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use(cookieParser());

// dev logger that should not be used in prod

app.use('/', require('./routes/index'));

app.use('/', require('./routes/settings'));

app.use('/login', passport.authenticate('discord', {
  scope: scopes,
}));
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});
app.get(
  '/callback',
  passport.authenticate('discord', {
    failureRedirect: '/',
  }),
  (req, res) => {
    res.redirect('/');
  },
);

app.get('/404', (req, res) => {
  logger.info(`Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.render('404', {
    title: '404 Error',
    loggedIn: req.isAuthenticated(),
    user: req.user,
  });
});

app.get('*', (req, res) => {
  logger.error(`ABNORMAL ${req.method} REQUEST for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.render('404', {
    title: '404 Error',
    loggedIn: req.isAuthenticated(),
    user: req.user,
  });
});

module.exports = app;
