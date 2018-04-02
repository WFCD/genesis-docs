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

const app = express();
const scopes = ['identify', 'guilds'];
logger.level = process.env.LOG_LEVEL || 'error';
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', handlebars({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', '.hbs');

// favicon and caching options (cache is 7 days)
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 604800000
}));

// oauth

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new DiscordStrategy({
  clientID: '170751319915626497',
  clientSecret: 'gh1x0S1EcNlZldIcPnc-VcEgBT9EvVkn',
  callbackURL: 'http://127.0.0.1:3647/callback',
  scope: scopes
}, function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    return done(null, profile);
  });
}));

app.use(session({
  secret: require('crypto').randomBytes(64).toString('hex'),
  resave: true,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// default node js includes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// dev logger that should not be used in prod

app.use('/', require('./routes/index'));

//app.use('/server', require('./routes/??'));

app.use('/login', passport.authenticate('discord', {
  scope: scopes
}));
app.get('/callback',
  passport.authenticate('discord', {
    failureRedirect: '/'
  }),
  function(req, res) {
    res.redirect('/')
  }
);

app.get('/404', (req, res) => {
  logger.info(`Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.render('404', {
    title: '404 Error',
    loggedIn: req.isAuthenticated(),
    user: req.user
  });
});

app.get('*', (req, res) => {
  logger.error(`ABNORMAL ${req.method} REQUEST for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.render('404', {
    title: '404 Error',
    loggedIn: req.isAuthenticated(),
    user: req.user
  });
});

module.exports = app;
