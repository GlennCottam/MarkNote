/*
    File: index.js
    Author: Glenn Cottam
    Description: index.js will be used for the entry point of the project.
        This is where the web server will be run from.

    V 0.0.1
*/
const config = require('../config/global');
const logger = require('./logger');

logger.startup.splash(
    "---------------------------------\n" +
    "░█▄█░█▀█░█▀▄░█░█░█▀█░█▀█░▀█▀░█▀▀\n" + 
    "░█░█░█▀█░█▀▄░█▀▄░█░█░█░█░░█░░█▀▀\n" + 
    "░▀░▀░▀░▀░▀░▀░▀░▀░▀░▀░▀▀▀░░▀░░▀▀▀\n" + 
    "Created by: Glenn Cottam\n" +
    "MIT License\n" + 
    "---------------------------------"
);


logger.startup("Setting Environment Variables");
const _ENV = process.env;
_ENV.IS_PRODUCTION = config.server.production;
if(_ENV.IS_PRODUCTION === "true")
{
    _ENV.GLOBAL_URI = config.server.uri.production.url;
    _ENV.GLOBAL_PORT = config.server.uri.production.port;
    _ENV.GLOBAL_ROOT = config.server.uri.production.url;
}
else
{
    _ENV.GLOBAL_URI = config.server.uri.local.url;
    _ENV.GLOBAL_PORT = config.server.uri.local.port;
    _ENV.GLOBAL_ROOT = config.server.uri.local.url + ":" + config.server.uri.local.port;
}

logger.startup("GLOBAL VARIABLE SET: " +
            "\n\tIS_PRODUCTION: " + _ENV.IS_PRODUCTION +
            "\n\tGLOBAL_URI: " + _ENV.GLOBAL_URI +
            "\n\tGLOBAL_PORT: " +  _ENV.GLOBAL_PORT +
            "\n\tGLOBAL_ROOT: " + _ENV.GLOBAL_ROOT 
);

// Debug Statement for following imported packages
logger.startup("Server Starting, Importing Tools.\n\tImporting: Express");

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
const keys = require('../secure/keys');

// GCloud scopes
const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',     // User Profile, Needed for everything to work.
    'https://www.googleapis.com/auth/drive',                // ALL Drive data
];

/* 
    Global URL set for Testing on Localhost, or set to URL for application. 
*/

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
const {DatastoreStore} = require('@google-cloud/connect-datastore');
const userStore = require('./userStore');

const oauth2Client = new google.auth.OAuth2(
    keys.google.clientID,
    keys.google.clientSecret,
    _ENV.GLOBAL_ROOT + "/oauth2callback",
);

const global_auth_url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
});

google.options({auth: oauth2Client});

logger.success("Import Complete.");

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
app.use(Express.urlencoded({extended: false}));

// Save sessions to Google Datastore
app.use(session({
    store: new DatastoreStore({
        kind: 'express-sessions',
        expirationMs: 0,
        dataset: new Datastore({
            projectId: process.env.GCLOUD_PROJECT,
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
        })
    }),
    secret: 'my-secret',
    resave: true,
    saveUninitialized: false,
}));


// On every request, do this:
app.use(async function(req, res, next)
{
    if(req.session.user)
    {
        logger.debug("User session exists, testing to see if token needs to be refreshed.");
        var saved_user = await userStore.getData(req.session.user.id);
        // logger.debug("User data pulled.");
        var now = Date.now();
        // logger.info("Current Timestamp: " + now)

        // do it before 5 mins
        if(saved_user.expiry <= now + 300000)
        {
            logger.warning("Token needs to be refreshed, attempting to do so now.");
            // logger.info("saved_user.refresh_token: " + saved_user.refresh_token);

            // Refresh Token!
            await getTokenWithRefresh(saved_user.refresh_token, req);
        }
        else
        {
            logger.dim("User token still active, no need to refresh.");
            oauth2Client.setCredentials({
                refresh_token: saved_user.refresh_token,
                access_token: saved_user.access_token
            });

            req.session.user.tokens.tokens.refresh_token = saved_user.refresh_token;
            req.session.user.tokens.tokens.access_token = saved_user.access_token;

            // logger.debug("{every request} New Session Data: " + JSON.stringify(req.session.user));
            
        }

    }

    logger.info("REQUEST: " + req.url);
    next();
});

async function getTokenWithRefresh(refresh_token, request)
{
    new Promise(async function(resolve)
    {
        oauth2Client.setCredentials({
            refresh_token: refresh_token
        });
    
        await oauth2Client.refreshAccessToken( function(err, tokens)
        {
            if(err) 
            { 
                logger.error("Error grabbing new Access Token: " + err);
                resolve(null);
            }
            else
            {
                // logger.debug("New Tokens: " + JSON.stringify(tokens));
                oauth2Client.setCredentials(tokens);

                userStore.saveUser(request.session.user.id, tokens.access_token, refresh_token, tokens.expiry_date);
                request.session.user.tokens.tokens.access_token = tokens.access_token;
                request.session.user.tokens.tokens.refresh_token = tokens.refresh_token;
                oauth2Client.setCredentials(tokens);
                // logger.debug("New Session Tokens Set" + JSON.stringify(request.session.user.tokens));
                resolve(tokens);
            }
        });
    });
}

/*
    The Server Itself:
        Below are the endpoints the server will listen too. These endpoints will
        do different things like login, editor etc...
*/

// Endpoint: '/login': The login endpoint will focus on logging the user in.
app.get('/login', function(req, res)
{
    res.redirect(global_auth_url);
});

// Endpoint '/oauth2callback': Endpoint to grab the code for Oauth2.
app.get('/oauth2callback', async function(req, res)
{
    // Grabs the Code from Google, turns it in for a token
    var code = req.query.code;
    var {tokens} = await oauth2Client.getToken(code);
    console.log("TOKENS: " + JSON.stringify(tokens));
    oauth2Client.setCredentials(tokens);

    // Grabs user information, sets it in the express-session
    var user = await google.people('v1').people.get({
        resourceName: 'people/me',
        personFields: 'clientData,names,nicknames,photos,externalIds'
    });

    // Gotta love lame API's, I need to trim "people/" from the ID.
    // Before: people/<googleid>
    // After: <googleid>
    var user_id = user.data.resourceName.replace('people/', '');
    logger.info("User ID: " + user_id);

    var users = await userStore.getData(user_id);

    // If no user exists, first time sign in.
    // On first time sign-in store everything
    // If not first time sign-in, grab refresh token, and resave.
    if(users)
    {
        // User exists, saving everything but refresh token
        logger.debug("User has already signed in, saving everything but refresh token");
        // logger.info("REFRESH TOKEN: " + JSON.stringify(users.refresh_token));
        await userStore.updateAccessToken(user_id, tokens.access_token, tokens.expiry_date);
    }
    else
    {
        logger.debug("First time user, creating entry");
        await userStore.saveUser(user_id, tokens.access_token, tokens.refresh_token, tokens.expiry_date);
        
    }

    var user_data = 
    {
        id: user_id,
        tokens: {tokens},
        profile: user.data
    };

    req.session.user = user_data;

    res.redirect('/');

});

// Endpoint: '/token': Allows the client to grab the access token
app.get('/token', function(req, res)
{
    if(req.session.user)
    {
        res.json(req.session.user.tokens.tokens.access_token);
        res.end();
    }
    else
    {
        res.json(null);
        res.end();
    }
});

// Endpoint: '/logout': Allows the user to logout of their account.
app.get('/logout', function(req, res)
{
    // TODO: When logout: de-auth app so they can choose another account
    req.session.destroy(function(err)
    {
        if(err) {throw err};
    });
    res.redirect('/');
});


// Endpoint: '/': Landing page for the application. Anyone can access.
app.get('/', function(req, res)
{
    
    // If Logged in:
    if(req.session.user)
    {
        res.render('index', {GLOBAL_ROOT: _ENV.GLOBAL_ROOT, user: req.session.user});
    }
    else
    {
        res.render('index', {GLOBAL_ROOT: _ENV.GLOBAL_ROOT, user: null});
    }
    
});

app.get('/new', async function(req, res)
{
    // Once Folder has been selected, Give it the name Untitled, and create to drive.
    // Once created, redirect to editor with file id.

    var folderId = req.query.folderId;

    var fileMetadata = 
    {
        'name': 'Untitled.md',
        parents: [folderId]
    };

    var media = 
    {
        mimeType: 'text/markdown',
    }

    await drive.files.create({
        resource: fileMetadata,
        media: media,
    }, function(err, res)
    {
        if(err)
        {
            logger.error(err);
            finish({err: err});
        }
        else
        {
            finish(res.data.id);
        }

    });

    function finish(data)
    {
        res.redirect('/editor?fileId=' + data);
    }

});

// Endpoint: '/editor': used to access the editor. This will most likely change.
app.get('/editor', async function(req, res)
{
    if(req.session.user)
    {
        var fileId = req.query.fileId;
        var file = await drive.files.get({
            fileId: fileId,
            alt: 'media'
        });

        var metadata = await drive.files.get({
            fileId: fileId,
        });

        res.render('editor', {GLOBAL_ROOT: _ENV.GLOBAL_ROOT, user: req.session.user, raw: file, fileId: fileId, filemetadata: metadata});
    }
    else
    {
        res.redirect('/');
    }
});



app.post('/save', async function(req, res)
{
    logger.info("FILEDATA: \tFILENAME: " + req.body.fileName);
    var file = await drive.files.update({
        fileId: req.body.fileId,
        resource:
        {
            'name': req.body.fileName
        },
        media: 
        {
            mimeType: 'text/markdown',
            body: req.body.data
        },
    }, (err, res) =>
    {
        if(err) {
            logger.error(err);
            finish({saved: false, err: err});
        }
        else
        {
            finish({saved: true, data: res.data});
        }
    });

    function finish(data)
    {
        res.json(data);
        res.end();
    }

    
});

// Error Page
app.get('/error', function(req, res)
{
    res.render('error', {GLOBAL_ROOT: _ENV.GLOBAL_ROOT,});
});

app.on('error', function(req, res)
{
    res.redirect('/error');
});

// Web server startup.
app.listen(_ENV.GLOBAL_PORT, function()
{
    logger.success("Server Ready on URL: " + _ENV.GLOBAL_URI + ":" + _ENV.GLOBAL_PORT);
});
