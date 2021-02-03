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
console.log("Client Secret:\n" + JSON.stringify(client_secret));

console.log("Import Complete. Setting Up Enviroment.");

// Setting Global Values
const config = JSON.parse(FS.readFileSync('config/global.json'));
const port = config.server.port;

console.log("Server will be running on port: " + port);

// Setting Server Up
app.use(Express.static('public'));                                              // Sets public directory
app.use(Cors());                                                                // Sets Cors Policy
app.set('view engine', 'ejs');                                                  // Sets EJS as view engine

app.get('/', function(req, res)
{
    res.render('index');
});


app.listen(port, function()
{
    console.log("Server Ready");
});


// Google Cloud Platform Test Function of OAuth2
const oauth2Client = new google.auth.OAuth2(
    client_secret.web.client_id,
    client_secret.web.client_secret,
    client_secret.web.auth_url
);

