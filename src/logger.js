const colors = require('colors');

var global_methods = {};

global_methods.debug = function(text)
{
    console.log("[DEBUG]\t".blue + text);
}

global_methods.error = function(text)
{
    console.log("[ERROR]\t".red + text.red);
}

global_methods.success = function(text)
{
    console.log("[SUCCS]\t".green + text);
}

global_methods.warning = function(text)
{
    console.log("[WARNG]\t".yellow + text);
}

global_methods.info = function(text)
{
    console.log("[INFOM]\t".cyan + text);
}

global_methods.startup = function(text)
{
    console.log("[INFOM]\t".italic.magenta + text.italic);
}

global_methods.startup.splash = function(text)
{
    console.log(text.blue);
}

global_methods.dim = function(text)
{
    console.log("[DIM ]\t".dim + text.dim);
}

global_methods.session = class session
{
    constructor(url, session_data)
    {
        this.url = session_data.url;
        this.loggedin = session_data.loggedin;
        this.expiry = session_data.expiry;
        this.token_refresh = session_data.token_refresh;


        var token_refresh;
        if(session_data.tokenrefresh)
        {
            token_refresh = "true".green
        }
        else
        {
            token_refresh = "false".orange
        }

        this.data = 
        "REQUEST: ".green + url.cyan + 
        " SESSION: ".green + 
        "LOGGED IN: " + session_data.loggedin + 
        " TIMESTAMP: " + session_data.expiry +
        " TOKENREFRESH: " + token_refresh;

        console.log(this.data);
    }

    print()
    {
        
    }

}



module.exports = global_methods;