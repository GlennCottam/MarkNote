var global_methods = {}

const showdown = require('showdown');
showdown.setOption('ghCodeBlocks', 'true');
showdown.setOption('tasklists', 'true');
showdown.setOption('parseImgDimensions', 'true');
showdown.setOption('allOn');
var mdconverter = new showdown.Converter();


global_methods.scrub_string = function(str)
{
    result = str.replace(new RegExp('\r?\n','g'), '<br />');
    console.log("SCRUBBER:\n\tBEFORE: " + str + "\n\tAFTER: " + result);
    return result

};

global_methods.markdown_to_html = function(markdown)
{
    return mdconverter.makeHtml(markdown);
};












module.exports = global_methods;