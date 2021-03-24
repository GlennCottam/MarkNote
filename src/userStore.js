const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();
const logger = require('./logger');


var global_methods = {}

global_methods.saveUser = async function(id, access_token, refresh_token, expiry)
{
    const kind = 'User';
    const userID = id;
    const userKey = datastore.key([kind, userID]);
    const timestamp = Date.now();

    // if(!refresh_token)
    // {
    //     logger.error("NO REFRESH TOKEN!!!!");
    //     process.exit();
    // }

    logger.debug("saveUser: Data Inputted:\n\tid: " + id + "\n\taccess_token: " + access_token + "\n\trefresh_token: " + refresh_token + "\n\texpiry: " + expiry);

    const user = 
    {
        key: userKey,
        data:
        {
            access_token,
            refresh_token,
            expiry,
            timestamp
        }
    }

    await datastore.save(user);
    console.log("User Saved to Database!: " + JSON.stringify(user));

}

global_methods.updateAccessToken = async function(id, access_token, expiry)
{
    var original = await this.getData(id);
    const userKey = datastore.key(['User', id]);
    
    const user = 
    {
        key: userKey,
        data:
        {
            access_token: access_token,
            refresh_token: original.refresh_token,
            expiry,
            timestamp: Date.now()
        }
    }

    await datastore.save(user);
    logger.info("User " + id + " Updated: " + JSON.stringify(user))
}

global_methods.getData = async function(id)
{
    const userKey = datastore.key(['User', id]);
    const query = datastore
    .createQuery('User')
    .filter('__key__', '=', userKey)
    ;

    const [users] = await datastore.runQuery(query);
    console.log("Users: " + JSON.stringify(users[0]));
    return users[0];
}



module.exports = global_methods;