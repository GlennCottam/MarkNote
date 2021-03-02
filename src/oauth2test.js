const Express = require('express');
const App = Express();
const Cors = require('cors');
const User = require('user');

const Passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const passport = require('passport');
const {Datastore} = require('@google-cloud/datastore')

// Passport.use(new GoogleStrategy({
//     clientID: "498580518200-u42iatg215hij6n6u73gnfv7f0kdlshr.apps.googleusercontent.com",
//     clientSecret: "4CXu3HxGI5XW1LaeIiLaa_rH",
//     callbackURL: "http://localhost:8080/oauth2callback",
//     passReqToCallback: true
// }, function(accessToken, refreshToken, profile, done){
//     console.log(JSON.stringify(profile));
//     User.findOrCreate({googleId: profile.id}, function(err, user){
//         return done(err, user);
//     })
// }));

const datastore = new Datastore();



Passport.use(new GoogleStrategy({
    clientID: "498580518200-u42iatg215hij6n6u73gnfv7f0kdlshr.apps.googleusercontent.com",
    clientSecret: "4CXu3HxGI5XW1LaeIiLaa_rH",
    callbackURL: "http://localhost:8080/oauth2callback"
  },  
    function(accessToken, refreshToken, profile, done) {
        datastore.save({
            key: datastore.key("googleId"),
            data: profile
        });
        console.log(JSON.stringify(profile));
        return done();
        // User.findorCreate({ googleId: profile.id }, function (err, user) {
        //     return done(err, user);
        // });
  }
));



passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

App.use(Cors());
App.enable('trust proxy');
App.set('view engine', 'ejs');
App.use(Express.static('public'));
App.use(require('cookie-parser')());
App.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized: true}));
App.use(Passport.initialize());
App.use(Passport.session());

const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file'
];

App.get('/get/logins', async function(req, res)
{
    const query = datastore.createQuery('googleId');
    data = await datastore.runQuery(query);

    res.json(data);
    res.end();
});

App.get('/login',
    Passport.authenticate('google', { scope: scopes }
), function(req, res){
    console.log("Accessed '/login'");
    // req.login();
    req.redirect('/');
});

App.get('/oauth2callback',
    Passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/error'
    }
));

// App.get('/login', Passport.authenticate('google', {scope: ['drive']));
// App.get('/oauth2callback', Passport.authenticate('google', {failureRedirect: '/error'}), function(req, res){
//     res.redirect('/');
// })


App.get('/', function(req, res)
{
    console.log("Accessed '/'");
    res.render('index', {login_url:"http://localhost:8080/login"});
})

App.get('/error', function(req, res)
{
    console.log("Accessed '/error'");
    req.logout();
    res.write('shits fucked');
    res.end();
});

App.get('/logout', function(req, res)
{
    console.log("Accessed '/logout'");
    req.logout();
    res.redirect('/');
});

App.listen(8080, function()
{
    console.log("Ready");
})