/*
    File: index.js
    Author: Glenn Cottam
    Description: index.js will be used for the entry point of the project.
        This is where the web server will be run from.

    V 0.0.1
*/

// Debug Statement for following imported packages
console.log("Server Starting, Importing Tools.\n\tImporting: Express");

// Importing Express Webserver
const Express = require('express');
const app = Express();

// Importing Cors Policy
console.log("\tImporting: Cors");
const Cors = require('cors');

// Importing File System API
console.log("\tImporting: fs");
const File_system = require('fs');

console.log("\tImporting: cookie-session");
const cookieSession = require('cookie-session');

// Setting Global Values
const config = JSON.parse(File_system.readFileSync('config/global.json'));
const port = config.server.port;
const keys = require('../secure/keys');
const client_secret = JSON.parse(File_system.readFileSync('secure/client_secret.json'));

// GCloud scopes
const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',     // User Profile, Needed for everything to work.
    'https://www.googleapis.com/auth/drive.appdata',        // Drive Appdata
    'https://www.googleapis.com/auth/drive.file'            // Drive files (save, read, modify etc...)
];

/* 
    Global URL set for Testing on Localhost, or set to URL for application. 
*/
const global_web_uri = config.server.uri.local + ":" + port; // Comment Out When In production
// const global_web_uri = config.server.uri.production;      // Uncomment out when in production
console.log("Server URI: " + global_web_uri);                // Server confirmation on running the correct URI

// Importing Body-Parser for HTTP requests
console.log("\tImporting: Body-Parser");
const BodyParser = require('body-parser');

/* 
    ! Showdown Framework
    The Showdown framework is used to convert Markdown into
        HTML. Here I will set the options I will need, and 
        configure it for the usecase.
*/
console.log("\tImporting: Showdown");
const showdown = require('showdown');
showdown.setOption('ghCodeBlocks', 'true');
showdown.setOption('tasklists', 'true');
showdown.setOption('parseImgDimensions', 'true');
showdown.setOption('allOn');
var mdconverter = new showdown.Converter();

/*
    HIghlight JS framework:
        This framework highlights sepcific code snippts with
        various themes and color schemes.
*/
const h1js = require('highlight.js');

/*
    Google API's:
        Below are a list of API's I will be using from google and their names.
        These will allow the application to access various google services from
        the end user.
*/
console.log("\tImporting: Google API's");
const {google} = require('googleapis');
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();
const oauth2Client = new google.auth.OAuth2(
    keys.clientID,
    keys.clientSecret,
    keys.redirectURL,
);


/*
    Passport Framwork:
        This framework does all the automation of handling tokens and is honestly
        sick as hell. Would highly recommend it for Oauth2.
*/
console.log("\tImporting: Passport Authentication");
const Passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

console.log("Import Complete.");

/*
===============================================================================
                            Main Application
===============================================================================
*/


// Main function for login of users
// https://dev.to/phyllis_yym/beginner-s-guide-to-google-oauth-with-passport-js-2gh4
Passport.use(new GoogleStrategy(
    {
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: "/oauth2callback"
    },
    (accessToken, refreshToken, profile, done) => 
    {

        var userKey = datastore.key(['googleId', profile.id])

        var user = 
        {
            id: profile.id,
            accessToken: accessToken,
            refreshToken: refreshToken,
            profile: profile
        };
        
        console.log("Creating User: " + profile.id);
        datastore.save({
            key: userKey,
            data: user
        });

        
        done(null, user);
    }
));

// Serialize User
Passport.serializeUser((user, done) =>
{
    done(null, user.id);
});

// Deseralize User
Passport.deserializeUser(async function (id, done)
{
    // Find on database
    var userKey = datastore.key(['googleId', id]);
    var query = datastore.createQuery('googleId');
    const [users] = await datastore.runQuery(query);
    var user = users[0]; // !TODO: Fix this garbage (not safe).
    // console.log("!!!!!!!DeserializeUser:\n\tUSER: " + JSON.stringify(user) + "\n\tID: " + id);
    done(null, user);
});



/*
    Express Server:
        Below are the URL access points the server will listen for.
*/
// Setting up the server with frameworks
app.use(Express.static('public'));                                              // Sets public directory
app.use(Cors());                                                                // Sets Cors Policy
app.set('view engine', 'ejs');
app.use(BodyParser.urlencoded());
app.use(cookieSession({
    maxAge: 24*60*60*1000,
    keys: [keys.session.cookieKey]
}));
app.use(Passport.initialize());
app.use(Passport.session());

/*
    The Server Itself:
        Below are the endpoints the server will listen too. These endpoints will
        do different things like login, editor etc...
*/

// Endoint: '/login': The login endpoint will focus on logging the user in.
app.get(
    '/login',
    Passport.authenticate('google', {scope: scopes}),
    function(req, res)
    {
        console.log("ENDPOINT: '/login'");
        // req.redirect('/editor');
    }
);

// Endpoint '/oauth2callback': Endpoint to grab the code for Oauth2.
app.get(
    '/oauth2callback',
    Passport.authenticate('google'), (req, res) =>
    {
        // res.send(req.user);
        // res.send("Redirect URI!");
        res.redirect('/');
    }
);

// Endpoint: '/logout': Allows the user to logout of their account.
app.get('/logout', function(req, res)
{
    console.log("Accessed '/logout'");
    req.logout();
    // res.send(req.user);
    res.redirect('/');
});

app.get('/get/logins', async function(req, res)
{
    const query = datastore.createQuery('googleId');
    data = await datastore.runQuery(query);

    res.json(data);
    res.end();
});

app.get('/get/drivedata', function (req, res)
{
    // console.log("shite: " + JSON.stringify(req.user));
    // const {tokens} = await oauth2Client.getToken()
    oauth2Client.setCredentials(req.user.accessToken, req.user.refreshToken);

    const files = null;
    const drive = google.drive({version: 'v3', oauth2Client});
    drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)'
    }, (err, res) => {
        if(err) console.log("API returned an error: " + err);
        files = res.data.files;
        if(files.length)
        {
            console.log("Files:");
            files.map((file) =>
            {
                console.log('${filename} (${file.id})');
            });
        } else
        {
            console.log("No files Found");
        }
    });

    res.json(files);
    res.end();
});



// Endpoint: '/': Landing page for the application. Anyone can access.
app.get('/', function(req, res)
{
    // If Logged in:
    if(req.user)
    {
        res.render('index', {user: req.user});
    }
    else
    {
        res.render('index', {user: null});
    }
    
});

// Endpoint: '/editor': used to access the editor. This will most likely change.
app.get('/editor', function(req, res)
{
    // res.render('editor', {login_url: global_web_uri + "/login"});
    res.render('editor');
});

// Error Page
app.get('/error', function(req, res)
{
    res.render('error');
});


// Endpoint: '/mdconvert': Used to convert markdown to HTML. I will need to 
//  secure this endpoint though userauth so Joe doesn't use it in another API.
app.post('/mdconvert', function(req, res)
{
    console.log("Post Request for MD > HTML:" + req.body);
    var text = req.body.text;
    var html = mdconverter.makeHtml(text);
    res.send(html);
});

// Endpoint: '/highlight': Used similar to /mdconvert but with highlighting of
//      code.
app.post('/highlight', function(req, res)
{
    console.log("Post Requst for HTML > Highlight" + req.body);
    var code = req.body.text;
    var html = h1js.highlightAuto(code).value;
    res.send(html);
});

// Web server startup.
app.listen(port, function()
{
    console.log("Server Ready on URL: " + global_web_uri);
});
