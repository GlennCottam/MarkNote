const colors = require('colors');

var global_methods = {};

global_methods.debug = function(text)
{
    console.log("[DEBUG]\t".blue + text);
}

global_methods.error = function(text)
{
    console.log("[ERROR]\t".red + text);
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


module.exports = global_methods;