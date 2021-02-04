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

// Impporting File System API
console.log("\tImporting: fs");
const FS = require('fs');

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
}) + "https://marknote.ue.r.appspot.com/code";

var post_data;

app.post('/code', function(req, res)
{
    console.log(req);
    res.end();
});

// Running the server
app.get('/', function(req, res)
{
    res.render('index', {login_url: url});
});


app.listen(port, function()
{
    console.log("Server Ready");
});




