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
const File_system = require('fs');

// Importing Body-Parser for HTTP requests
console.log("\tImporting: Body-Parser");
const BodyParser = require('body-parser');

// Importing PATH
console.log("\tImporting: Path");
const path = require('path');

console.log("\tImporting: URL Parser");
const Url_Parser = require('url');

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

// Importing All that Google Stuff I need to make OAuth2 Function
console.log("\tImporting: Google API's");
const {google} = require('googleapis');
const { type } = require('os');
const client_secret = JSON.parse(File_system.readFileSync('secure/client_secret.json'));
const {authenticate} = require('@google-cloud/local-auth');

console.log("Import Complete. Setting Up Enviroment.");

// Setting Global Values
const config = JSON.parse(File_system.readFileSync('config/global.json'));
const port = config.server.port;

console.log("Server will be running on port: " + port);

// Setting Server Up
app.use(Express.static('public'));                                              // Sets public directory
app.use(Cors());                                                                // Sets Cors Policy
app.set('view engine', 'ejs');
app.use(BodyParser.urlencoded());


// Google Cloud Platform Test Function of OAuth2
const oauth2Client = new google.auth.OAuth2(
    client_secret.web.client_id,
    client_secret.web.client_secret,
    client_secret.web.auth_url
);

const scopes = [
    'https://www.googleapis.com/auth/drive.metadata.readonly'
];

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
});

var url = oauth2Client.generateAuthUrl
({
    access_type: 'online',      // 'online' (default) or 'offline (gets refresh_token)
    scope: scopes               // If you only need one scope you can pass it as a string
// }) + config.server.offical_url_code;
}) + "http://localhost:8080/oauth2callback";

var post_data;

app.get('/oauth2callback', function(req, res)
{
    // const {tokens} = await oauth2Client.getToken()
    var query = Url_Parser.parse(req.url, true);
    console.log(query);
    res.end();
});

app.get('/login', async function(req, res)
{
    //  Oh god here we go... This function should try to get the user to login
    // though google and grab the Oauth2 token... I think...
    const auth = await authenticate({
        keyfilePath: path.join(__dirname, '../secure/oauth2.keys.json'),
        scopes: "https://www.google.apis.com/auth/drive.metadata.readonly",
    });
    google.options({auth});

    const service = google.drive('v3');
    const res2 = await service.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
    });
    const files = res2.addTrailers.files;
    if(files.length === 0)
    {
        console.log("WE AINT FOUND SHIT");
    }
    else
    {
        console.log("Files:");
        for (const file of files)
        {
            console.log(`${file.name} (${file.id})`);
        }
    }

});

// Running the server
app.get('/', function(req, res)
{
    res.render('index', {login_url: url});
});

app.get('/editor', function(req, res)
{
    res.render('editor', {login_url: test_oauth_library()});
});

app.post('/mdconvert', function(req, res)
{
    console.log("Post Request for MD > HTML:" + req.body);
    var text = req.body.text;
    var html = mdconverter.makeHtml(text);
    res.send(html);
});

app.post('/highlight', function(req, res)
{
    console.log("Post Requst for HTML > Highlight" + req.body);
    var code = req.body.text;
    var html = h1js.highlightAuto(code).value;
    res.send(html);
})

app.listen(port, function()
{
    console.log("Server Ready");
});


// Test method for attempting to use new library
function test_oauth_library()
{
    var OAuth_client_js = require('oauth2-client-js');
    var google = new OAuth_client_js.Provider({
        id: 'google',
        authorization_url: 'htps://google.com/auth'
    });

    var request = new OAuth_client_js.Request({
        client_id: client_secret.client_id,
        redirect_uri: 'http://localhost:8080/oauth2callback'
    });

    var uri = google.requestToken(request);
    google.remember(request);

    return uri;
}
