// Key enter for submit
$(document).keyup(function(e)
{
    var key = e.which;
    if(e.which == 13)
    {
        if(e.shiftKey === true)
        {
            // New Line Do Nothing
        }
        else
        {
            convert();
        }
    }
})

function convert()
{
    var settings = {
        "url": "https://8080-cs-329088372048-default.us-east1.cloudshell.dev/mdconvert/",
        "method": "GET",
        "timeout": 0,
        "data": {
            "text": $('#editor').val()
        }
    }

    $.ajax(settings).done(function (response) {
        $('#editor').val('');
        $('#viewer').append(response);
        console.log(response);
        reloadCSS();
    });

    // Reload CSS
    function reloadCSS()
    {
        var queryString = '?reload=' + new Date().getTime();
        $('link[rel="stylesheet"]').each(function ()
        {
            this.href = this.href.replace(/\?.*|$/, queryString);
        });
    }
}
