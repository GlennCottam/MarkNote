const Express = require('express');
const app = Express();
const cors = require('cors');
const Keys = require('../secure/keys');
const {google} = require('googleapis');
const drive = google.drive('v3');
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();

const oauth2Client = new google.auth.OAuth2(
    Keys.google.clientID,
    Keys.google.clientSecret,
    Keys.google.redirectURL,
);

const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',     // User Profile, Needed for everything to work.
    'https://www.googleapis.com/auth/drive.appdata',        // Drive Appdata
    'https://www.googleapis.com/auth/drive.file',            // Drive files (save, read, modify etc...)
    'https://www.googleapis.com/auth/drive'
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
    var params = {};
    files = await drive.files.list(params);

    
    res.json(files.data);
    res.end();
});


app.listen(8080, function()
{
    console.log("ready");
});



Passport.use(new GoogleStrategy(
    {
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: "/oauth2callback"
    },
    (accessToken, refreshToken, profile, done) => 
    {

        var userKey = datastore.key(['googleId', profile.id])

        var user = 
        {
            id: profile.id,
            accessToken: accessToken,
            refreshToken: refreshToken,
            profile: profile
        };
        
        console.log("Creating User: " + profile.id);
        datastore.save({
            key: userKey,
            data: user
        });

        
        done(null, user);
    }
));

// Serialize User
Passport.serializeUser((user, done) =>
{
    done(null, user.id);
});

// Deseralize User
Passport.deserializeUser(async function (id, done)
{
    // Find on database
    var userKey = datastore.key(['googleId', id]);
    var query = datastore.createQuery('googleId');
    const [users] = await datastore.runQuery(query);
    var user = users[0]; // !TODO: Fix this garbage (not safe).
    // console.log("!!!!!!!DeserializeUser:\n\tUSER: " + JSON.stringify(user) + "\n\tID: " + id);
    done(null, user);
});