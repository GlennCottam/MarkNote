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



module.exports = global_methods;