const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();


var global_methods = {}

global_methods.saveUser = async function(id, access_token, refresh_token)
{
    const kind = 'User';
    const userID = id;
    const userKey = datastore.key([kind, userID]);

    const user = 
    {
        key: userKey,
        data:
        {
            access_token,
            refresh_token
        }
    }

    await datastore.save(user);
    console.log("User Saved to Database!: " + JSON.stringify(user));

}

global_methods.getTokens = async function(id)
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