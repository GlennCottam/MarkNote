/*
    File: index.js
    Author: Glenn Cottam
    Description: index.js will be used for the entry point of the project.
        This is where the web server will be run from.

    V 0.0.1
*/

const global_web_uri = "http://localhost:8080";

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
const File_system = require('fs');

// Importing Body-Parser for HTTP requests
console.log("\tImporting: Body-Parser");
const BodyParser = require('body-parser');

// Importing PATH
console.log("\tImporting: Path");
const path = require('path');

console.log("\tImporting: URL Parser");
const url = require('url');

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

// Setting Global Values
const config = JSON.parse(File_system.readFileSync('config/global.json'));
const port = config.server.port;

/*
    Importing Google API's:
        - Import GAPI's
        - Set oauth2Client
        - add scopes
        - Generate Aut URL

*/
console.log("\tImporting: Google API's");
const {google} = require('googleapis');
const { type } = require('os');
const { oauth2 } = require('googleapis/build/src/apis/oauth2');
const { error } = require('console');

const client_secret = JSON.parse(File_system.readFileSync('secure/client_secret.json'));

// Google Cloud Platform Test Function of OAuth2
const oauth2Client = new google.auth.OAuth2(
    client_secret.web.client_id,
    client_secret.web.client_secret,
    client_secret.web.auth_url,
    client_secret.web.redirect_uris[0]
);

// GCloud Assign GDrive scope
const scopes = [
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file'
];

// Generate Auth URL
var oauth2_auth_url = oauth2Client.generateAuthUrl
({
    access_type: 'offline',      // 'online' (default) or 'offline (gets refresh_token)
    scope: scopes               // If you only need one scope you can pass it as a string
// }) + config.server.offical_url_code;
}) + global_web_uri + "/oauth2callback";

console.log("oauth2_auth_url: " + oauth2_auth_url);


console.log("Import Complete. Setting Up Enviroment.");



/*
    Express Server:
        Below are the URL access points the server will listen for.
*/

// Setting up the server with frameworks
app.use(Express.static('public'));                                              // Sets public directory
app.use(Cors());                                                                // Sets Cors Policy
app.set('view engine', 'ejs');
app.use(BodyParser.urlencoded());


// Listens for the callback for Oauth2
app.get('/oauth2callback', async function(req, res)
{
    var data = new URL(req.url, global_web_uri);
    var parsed_url = {};
    var code = data.searchParams.get('code');
    parsed_url.scope = data.searchParams.get('scope')
    console.log(JSON.stringify(parsed_url));

    console.log("CODE: " + code);

    var {tokens} = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // const {tokens} = {};

    // try {
    //     tokens = await oauth2Client.getToken(code)
    //     console.log("response: " + response);
    // } catch (error)
    // {
    //     console.log("error: " + error);
    // }
 
    // oauth2Client.setCredentials(tokens);
    // get_tokens(JSON.stringify(parsed_url.code));
    
    // var {tokens} = oauth2Client.getToken(parsed_url.code);
    // oauth2Client.setCredentials(tokens);

    // Sends user to editor
    res.render('editor', {login_url: global_web_uri + "/login"});
});

async function get_tokens(code)
{
    var {tokens} = await oauth2Client.getToken(code).catch(function(err)
    {
        console.log("Rejection: " + err);
    });

    oauth2Client.setCredentials(tokens);
    
}

// Login Redirect for OAuth2
app.get('/login', async function(req, res)
{
    res.redirect(oauth2_auth_url);
});

// Running the server
app.get('/', function(req, res)
{
    res.render('index', {login_url: global_web_uri + "/login"});
});

// Direct to the Editor
app.get('/editor', function(req, res)
{
    res.render('editor', {login_url: global_web_uri + "/login"});
});

// Request for markdown conversion
app.post('/mdconvert', function(req, res)
{
    console.log("Post Request for MD > HTML:" + req.body);
    var text = req.body.text;
    var html = mdconverter.makeHtml(text);
    res.send(html);
});

// Request for highlight conversion
app.post('/highlight', function(req, res)
{
    console.log("Post Requst for HTML > Highlight" + req.body);
    var code = req.body.text;
    var html = h1js.highlightAuto(code).value;
    res.send(html);
})

// Default server listen port.
app.listen(port, function()
{
    console.log("Server Ready on Port: " + config.server.port);
});


// oauth2Client.on('tokens', (tokens) =>
// {
//     if(tokens.refresh_token)
//     {
//         console.log(tokens.refresh_token);
//     }
//     console.log(tokens.access_token);
// })