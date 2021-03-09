const Express = require('express');
const app = Express();
const cors = require('cors');
const Keys = require('../secure/keys');
const {google} = require('googleapis');
const drive = google.drive('v3');

const oauth2Client = new google.auth.OAuth2(
    Keys.google.clientID,
    Keys.google.clientSecret,
    Keys.google.redirectURL,
);

const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',     // User Profile, Needed for everything to work.
    'https://www.googleapis.com/auth/drive.appdata',        // Drive Appdata
    'https://www.googleapis.com/auth/drive.file'            // Drive files (save, read, modify etc...)
];

const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
});

app.use(Express.static('public'));
app.use(cors());
app.enable('trust proxy');
app.use(require('express-session')({secret: Keys.session.cookieKey, resave: true, saveUninitialized: true}));
app.set('view engine', 'ejs');


app.get('/login', function(req, res)
{
    res.redirect(url);
});

app.get('/oauth2callback', async function(req, res)
{
    var code = req.query.code;
    console.log(JSON.stringify(req.query.code));

    var {tokens} = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    res.redirect('/get/drivedata');
});



app.get('/get/drivedata', async function (req, res)
{
    // console.log("shite: " + JSON.stringify(req.user));
    // const {tokens} = await oauth2Client.getToken()
    // oauth2Client.setCredentials(req.user.accessToken, req.user.refreshToken);

    var files = null;
    google.options({auth: oauth2Client});
    var params = {pageSize: 10};
    // params.q = query;
    files = await drive.files.list(params);

    
    res.json(files);
    res.end();
});


app.listen(8080, function()
{
    console.log("ready");
});