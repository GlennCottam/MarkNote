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
const adjuster = require('./file_adjuster');
const port = config.server.port;
const keys = require('../secure/keys');
// const client_secret = JSON.parse(File_system.readFileSync('secure/client_secret.json'));

// GCloud scopes
const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',     // User Profile, Needed for everything to work.
    'https://www.googleapis.com/auth/drive',                // ALL Drive data
];

/* 
    Global URL set for Testing on Localhost, or set to URL for application. 
*/
const global_web_uri = config.server.uri.local + ":" + port; // Comment Out When In production
// const global_web_uri = config.server.uri.production;      // Uncomment out when in production

// Importing Body-Parser for HTTP requests
console.log("\tImporting: Body-Parser");

/* 
    ! Showdown Framework
    The Showdown framework is used to convert Markdown into
        HTML. Here I will set the options I will need, and 
        configure it for the usecase.
*/
console.log("\tImporting: Showdown");
const showdown = require('showdown');
console.log("\tImporting: Showdown-Highlight Extension");
// https://github.com/Bloggify/showdown-highlight
const showdownHighlight = require('showdown-highlight');
showdown.setOption('ghCodeBlocks', 'true');
showdown.setOption('tasklists', 'true');
showdown.setOption('parseImgDimensions', 'true');
showdown.setOption('allOn');
// var mdconverter = new showdown.Converter();

var mdconverter = new showdown.Converter({extensions: [showdownHighlight]});


/*
    HIghlight JS framework:
        This framework highlights specific code snippts with
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
const {DatastoreStore} = require('@google-cloud/connect-datastore');

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
    resave: false,
    saveUninitialized: false,
}));

// On every request, do this:
app.use(function(req, res, next)
{
    // Check for session in database, and set tokens.
    if(req.session.user)
    {
        console.log("Setting User Tokens");
        oauth2Client.setCredentials(req.session.user.tokens.tokens);
    }
    console.log("REQUEST: " + req.url);
    next();
})

/*
    The Server Itself:
        Below are the endpoints the server will listen too. These endpoints will
        do different things like login, editor etc...
*/

// Endpoint: '/login': The login endpoint will focus on logging the user in.
app.get('/login', function(req, res)
{
    // console.log("ENDPOINT: '/login'");
    res.redirect(global_auth_url);
});

// Endpoint '/oauth2callback': Endpoint to grab the code for Oauth2.
app.get('/oauth2callback', async function(req, res)
{
    // Grabs the Code from Google, turns it in for a token
    var code = req.query.code;
    var {tokens} = await oauth2Client.getToken(code);
    console.log("New Tokens: \n" + JSON.stringify(tokens));
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
    console.log("User ID: " + user_id);

    var user_data = 
    {
        id: user_id,
        tokens: {tokens},
        profile: user.data
    };

    req.session.user = user_data;

    res.redirect('/');

});

// Endpoint: '/logout': Allows the user to logout of their account.
app.get('/logout', function(req, res)
{
    // TODO: When logout: de-auth app so they can choose another account
    // req.logout();
    req.session.destroy(function(err)
    {
        if(err) {throw err};
    });
    // res.send(req.user);
    res.redirect('/');
});

app.get('/get/userdata', function(req, res)
{
    res.json(req.session.user);
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
    
    // console.log("User Data from Session: " + JSON.stringify(req.session) + "\nID: " + req.session.id);
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

// TODO: Delete this horrible shit
app.get('/new', async function(req, res)
{
    var folder = {}

     // Search for MarkNote folder to see if has been created
    var pageToken = null;

    drive.files.list({
        q: "name='MarkNote'", 
        fields: 'nextPageToken, files(id, name)',
        spaces: 'drive',
        pageToken: pageToken
    }, function(err, res_folders)
    {
        if(err)
        {
            console.log(err);
            finish({"err": err});
        }
        else
        {
            folder.current = res_folders.data.files;
            console.log("Step 1, Grabbed CURRENT Folders: " + JSON.stringify(folder));
            // res.files.forEach(function(file)
            // {
            //     console.log("Found File: ", file.data.name, file.data.id);
            // });
            // pageToken = res.nextPageToken;

            // finish(folder);


            // If no folders, create one
            if(!folder.current.files)
            {
                console.log("WE AIN'T FOUND SHIT, creating new folder");
                var folderMetadata = 
                {
                    'name': 'MarkNote',
                    'mimeType': 'application/vnd.google-apps.folder'
                };

                drive.files.create({
                    resource: folderMetadata,
                    fields: 'id'
                }, function(err, file)
                {
                    if(err) {console.log(err);}
                    else
                    {
                        folder.marknote.id = file.data.id;
                        console.log("Created Folder: New Folder List: " + JSON.stringify(folder));
                    }
                });
            }
            else
            {
                folder.marknote.id = folder.current.files[0].id;
                console.log("You have a folder already made.");
            }

            console.log(JSON.stringify(folder));

            // Create new File to write to
            var new_file_metadata =
            {
                'name': 'untitled.md',
                parents: [folder.marknote.id]
            }
            var new_file = 
            {
                mimeType: 'text/markdown',
                body: File_system.createReadStream('assets/drive/template.md')
            };

            drive.files.create({
                resource: new_file_metadata,
                media: new_file,
                fields: 'id'
            },
            function(err, file)
            {
                if(err)
                {
                    console.log(err);
                } 
                else
                {
                    console.log("New File ID: " + file.marknote.id);
                }
            });


            finish(folder);

        }
    });
    

    

    function finish(data)
    {
        res.json(data);
        res.end();
    }

});

app.get('/picker', function(req, res)
{
    res.render('picker', {user: req.session.user});
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

        var converted_data = mdconverter.makeHtml(file.data);
        res.render('editor', {user: req.session.user, file: converted_data, raw: file.data, fileId: fileId});
    }
    else
    {
        res.redirect('/');
    }
});

// Error Page
app.get('/error', function(req, res)
{
    res.render('error');
});

app.on('error', function(req, res)
{
    res.redirect('/error');
});

app.post('/update', function(req, res)
{
    console.log("Action: " + req.body.action + "\nData: " + req.body.data + "\nFileID: " + req.body.fileId);




    res.send("Updated");
    res.end();
});

// Endpoint: '/mdconvert': Used to convert markdown to HTML. I will need to 
//  secure this endpoint though userauth so Joe doesn't use it in another API.
app.post('/mdconvert', function(req, res)
{
    console.log("Post Request for MD > HTML:" + JSON.stringify(req.body));
    // var text = adjuster.scrub_string(req.body.text);
    var text = req.body.text;
    var scrubbed_text = text.replace(/\\r\\n/g, "<br />");
    var html = mdconverter.makeHtml(scrubbed_text);
    res.send(html);
});

// Endpoint: '/highlight': Used similar to /mdconvert but with highlighting of
//      code.
app.post('/highlight', function(req, res)
{
    console.log("Post Request for HTML > Highlight" + req.body);
    var code = req.body.text;
    var html = h1js.highlightAuto(code).value;
    res.send(html);
});

// Web server startup.
app.listen(port, function()
{
    console.log("Server Ready on URL: " + global_web_uri);
});
