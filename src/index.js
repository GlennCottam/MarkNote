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
console.log("\n\tImporting: Cors");
const Cors = require('cors');

// Impporting File System API
console.log("\n\tImporting: fs");
const FS = require('fs');

console.log("Import Complete. Setting Up Enviroment.");

// Setting Global Values
const config = JSON.parse(FS.readFileSync('config/global.json'));
const port = config.server.port;

console.log("Server will be running on port: " + port);

// Setting Server Up
app.use(cors());                                                                // Sets Cors Policy
app.set('view engine', 'ejs');                                                  // Sets EJS as view engine
app.use(Express.static('public'));                                              // Sets Public access to the folder "public"


