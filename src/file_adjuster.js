var global_methods = {}

const highlighter = require('highlight.js');
const showdown = require('showdown');
showdown.setOption('ghCodeBlocks', 'true');
showdown.setOption('tasklists', 'true');
showdown.setOption('parseImgDimensions', 'true');
showdown.setOption('allOn');
var mdconverter = new showdown.Converter();


global_methods.scrub_string = function(str)
{
    result = str.replace(new RegExp('\r?\n','g'), '<br />');
    // console.log("SCRUBBER:\n\tBEFORE: " + str + "\n\tAFTER: " + result);
    return result

};

global_methods.markdown_to_html = function(markdown)
{
    return mdconverter.makeHtml(markdown);
};


global_methods.highlight = function(html)
{
    // return highlighter.highlightAuto(html);
    return highlighter.highlightAll(html);
};


global_methods.all = function(str)
{
    var result1 = this.scrub_string(str);
    console.log(result1);
    result2 = this.markdown_to_html(result1);
    console.log(result2);
    result3 = this.highlight(result2);
    console.log(result3);
    return result3;
};






module.exports = global_methods;