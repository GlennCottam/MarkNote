/*
    File: index.js
    Author: Glenn Cottam
    Description: index.js will be used for the entry point of the project.
        This is where the web server will be run from.

    V 0.0.1
*/

console.log(
    "---------------------------------\n" +
    "░█▄█░█▀█░█▀▄░█░█░█▀█░█▀█░▀█▀░█▀▀\n" + 
    "░█░█░█▀█░█▀▄░█▀▄░█░█░█░█░░█░░█▀▀\n" + 
    "░▀░▀░▀░▀░▀░▀░▀░▀░▀░▀░▀▀▀░░▀░░▀▀▀\n" + 
    "Created by: Glenn Cottam\n" +
    "MIT License\n" + 
    "---------------------------------"
);


// Debug Statement for following imported packages
console.log("Server Starting, Importing Tools.\n\tImporting: Express");

// Importing Express Webserver
const Express = require('express');
const app = Express();
const session = require('express-session');

// Importing Cors Policy
console.log("\tImporting: Cors");
const Cors = require('cors');

// Importing File System API
console.log("\tImporting: fs");
const File_system = require('fs');

// Setting Global Values
const config = JSON.parse(File_system.readFileSync('config/global.json'));
const port = config.server.port;
const keys = require('../secure/keys');
// const client_secret = JSON.parse(File_system.readFileSync('secure/client_secret.json'));

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
// console.log("Server URI: " + global_web_uri);                // Server confirmation on running the correct URI

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
const drive = google.drive('v3');
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();

const oauth2Client = new google.auth.OAuth2(
    keys.google.clientID,
    keys.google.clientSecret,
    keys.google.redirectURL,
);

const global_auth_url = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: scopes
});

google.options({auth: oauth2Client});

console.log("Import Complete.");

/*
===============================================================================
                            Main Application
===============================================================================
*/


/*
    Express Server:
        Below are the URL access points the server will listen for.
*/
// Setting up the server with frameworks
app.use(Express.static('public'));                                              // Sets public directory
app.use(Cors());        
app.enable('trust proxy');                                                        // Sets Cors Policy
app.set('view engine', 'ejs');
app.use(session({
    secret: keys.session.cookieKey,
    name: 'MarkNote', 
    resave: true, 
    saveUninitialized: true,
    cookie: 
    {
        secure: false,
        path: '/',
        sameSite: true
    }
}));

// app.use(function(req, res, next)
// {
//     if(!req.session.user)
//     {
//         req.session.user = {}
        
//     }
//     next();
// });

/*
    The Server Itself:
        Below are the endpoints the server will listen too. These endpoints will
        do different things like login, editor etc...
*/

// Endoint: '/login': The login endpoint will focus on logging the user in.
// app.get(
//     '/login',
//     Passport.authenticate('google', {scope: scopes}),
//     function(req, res)
//     {
//         console.log("ENDPOINT: '/login'");
//         // req.redirect('/editor');
//     }
// );

// Endoint: '/login': The login endpoint will focus on logging the user in.
app.get('/login', function(req, res)
{
    console.log("ENDPOINT: '/login'");
    res.redirect(global_auth_url);
});

// Endpoint '/oauth2callback': Endpoint to grab the code for Oauth2.
app.get('/oauth2callback', async function(req, res)
{
    console.log("ENDPOINT: '/oauth2callback'");
    var code = req.query.code;
    var {tokens} = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);


    // Database user entry
    var user = await google.people('v1').people.get({
        resourceName: 'people/me',
        personFields: 'clientData,names,nicknames,photos,externalIds'
    });
    var user_id = user.data.resourceName.replace('people/', '');
    console.log("User ID: " + user_id);

    var userKey = datastore.key(['googleId', user_id]);

    var user_data = 
    {
        id: user_id,
        tokens: {tokens},
        profile: user.data
    };

    console.log("Entering User into Database: " + user_id);

    // datastore.save({
    //     key: userKey,
    //     data: user_data
    // });

    // res.json(user);
    // res.end();
    // req.session.save(function(err)
    // {
    //     if(err) throw err;
        
    // });

    // console.log("Session ID: " + req.session.id);

    req.session.user = user_data;
    // req.session.save(function(err)
    // {
    //     if(err) throw err;
    // });

    console.log("User Data from Session: " + JSON.stringify(req.session) + "\nID: " + req.session.id);

    // res.json(user);
    // res.end();

    res.redirect('/');

});

// app.get(
//     '/oauth2callback',
//     Passport.authenticate('google'), (req, res) =>
//     {
//         // res.send(req.user);
//         // res.send("Redirect URI!");
//         res.redirect('/');
//     }
// );

// Endpoint: '/logout': Allows the user to logout of their account.
app.get('/logout', function(req, res)
{
    console.log("Accessed '/logout'");
    // req.logout();
    req.session.destroy(function(err)
    {
        if(err) {throw err};
    });
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

app.get('/get/drivedata', async function (req, res)
{
    var files = null;
    google.options({auth: oauth2Client});
    var params = {};
    files = await drive.files.list(params);

    
    res.json(files.data);
    res.end();
});



// Endpoint: '/': Landing page for the application. Anyone can access.
app.get('/', function(req, res)
{
    
    console.log("User Data from Session: " + JSON.stringify(req.session) + "\nID: " + req.session.id);

    // If Logged in:
    if(req.session.user)
    {
        res.render('index', {user: req.session.user});
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
