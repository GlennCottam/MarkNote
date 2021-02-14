// ---------------------------------------------------------------------------
/*
    File: index.js
    Author: Glenn Cottam
    Description: index.js will be used for the entry point of the project.
        This is where the web server will be run from.

    V 0.0.1
*/

// Importing Packages
console.log("Server Starting, Importing Tools.\n\tImporting: Express");

// Importing Express Webserver
const Express = require('express');
const app = Express();

// Importing Cors Policy
console.log("\tImporting: Cors");
const Cors = require('cors');

// Importing File System API
console.log("\tImporting: fs");
const FS = require('fs');

// Importing ShowdownJS for Markdown > HTML conversion serverside
console.log("\tImporting: Showdown");
const showdown = require('showdown');
showdown.setOption('ghCodeBlocks', 'true');
showdown.setOption('tasklists', 'true');
showdown.setOption('parseImgDimensions', 'true');
showdown.setOption('allOn');
var mdconverter = new showdown.Converter();

// Importing Highlight.JS for Code to Text conversion
const h1js = require('highlight.js');
h1js.configure(
    {
        "useBR": true
    }
)

// Importing Google API
console.log("\tImporting: Google API");
const {google} = require('googleapis');
const client_secret = JSON.parse(FS.readFileSync('secure/client_secret.json'));

console.log("Import Complete. Setting Up Enviroment.");

// Setting Global Values
const config = JSON.parse(FS.readFileSync('config/global.json'));
const port = config.server.port;

console.log("Server will be running on port: " + port);

// Setting Server Up
app.use(Express.static('public'));                                              // Sets public directory
app.use(Cors());                                                                // Sets Cors Policy
app.set('view engine', 'ejs');                                                  // Sets EJS as view engine


// Google Cloud Platform Test Function of OAuth2
const oauth2Client = new google.auth.OAuth2(
    client_secret.web.client_id,
    client_secret.web.client_secret,
    client_secret.web.auth_url
);

const scopes = [
    'https://www.googleapis.com/auth/drive.metadata.readonly'
];

var url = oauth2Client.generateAuthUrl
({
    access_type: 'online',      // 'online' (default) or 'offline (gets refresh_token)
    scope: scopes               // If you only need one scope you can pass it as a string
}) + config.server.offical_url_code;

var post_data;

app.post('/code', function(req, res)
{
    console.log(req);
    res.end();
});

// Running the server
app.get('/', function(req, res)
{
    res.render('editor', {login_url: url});
});

app.get('/mdconvert', function(req, res)
{
    var text = req.param('text');
    var highlight = h1js.highlightAuto(text).value;
    var html = mdconverter.makeHtml(highlight);
    res.send(html);
});

// app.get('/editor', function(req, res)
// {
//     res.render('editor');
// });

app.listen(port, function()
{
    console.log("Server Ready");
});
