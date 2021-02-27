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
            convert_markdown();
        }
    }
})

const base_url = "http://localhost:8080/";
var index = 0;

function convert_markdown()
{
    var settings = {
        "url": base_url + "mdconvert/",
        "method": "POST",
        "timeout": 0,
        "data": {
            "text": $('#editor').val()
        }
    }

    $.ajax(settings).done(function (response) {
        $('#editor').val('');
        $('#viewer').append('<div class="d-flex flex-row"><div class="p-2 text-muted">' + index + '</div><div class="p-2">' + response + '</div></div>');
        // $('#viewer').append(response);
        console.log(response);
        // reloadCSS();
    });

    index++;
}

function convert_hightlight()
{
    var settings = {
        "url": base_url + "highlight/",
        "method": "POST",
        "timeout": 0,
        "data": {
            "text": $('#editor').val()
        }
    }

    $.ajax(settings).done(function (response) {
        $('#editor').val('');
        $('#viewer').append('<div class="d-flex flex-row"><div class="p-2 text-muted">' + index + '</div><div class="p-2">' + response + '</div></div>');
        // $('#viewer').append(response);
        console.log(response);
        // reloadCSS();
    });

    index++;
}

// Reload CSS
function reloadCSS()
{
    var queryString = '?reload=' + new Date().getTime();
    $('link[rel="stylesheet"]').each(function ()
    {
        this.href = this.href.replace(/\?.*|$/, queryString);
    });
}