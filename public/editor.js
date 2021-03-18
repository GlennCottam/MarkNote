// // Key enter for submit
// $(document).keyup(function(e)
// {
//     var key = e.which;
//     if(e.which == 13)
//     {
//         if(e.shiftKey === true)
//         {
//             // New Line Do Nothing
//         }
//         else
//         {
//             convert_markdown();
//         }
//     }
// })

// const base_url = "http://localhost:8080/";
// // const base_url = "https://8080-cs-329088372048-default.us-east1.cloudshell.dev/"
// var index = 0;

// function convert_markdown(data)
// {
//     if(!data)
//     {
//         data = $('#editor').val();
//     }

//     console.log("DATA: " + data);

//     var settings = {
//         "url": base_url + "mdconvert/",
//         "method": "POST",
//         "timeout": 0,
//         "data": {
//             "text": data
//         }
//     }

//     $.ajax(settings).done(function (response) {
//         $('#editor').val('');
//         $('#viewer').append('<div class="d-flex flex-row"><div class="p-2 text-muted">' + index + '</div><div class="p-2">' + response + '</div></div>');
//         // $('#viewer').append(response);
//         console.log(response);
//         // reloadCSS();
//     });

//     index++;
// }


// // Here how this thing gon work
// // 1. edit file
// // 2. store local value of file (will need to pass client non-converted markdown)
// //  2.1 find a way to grab fileline to edit. This will be difficult.
// // 3. send changed file to server
// // 4. on OK, send back converted HTML of new file.
// // 5. Pray it works.

// // https://github.com/sparksuite/simplemde-markdown-editor

// function update(action, fileId, data)
// {
//     var settings = {
//         "url": base_url + "update",
//         "method": "POST",
//         "timeout": 0,
//         "data": {
//             "action": action,
//             "fileId": fileId,
//             "data": data
//         }
//     }

//     $.ajax(settings).done(function(response)
//     {
//         console.log(response);
//     })
// }

// // Reload CSS
// function reloadCSS()
// {
//     var queryString = '?reload=' + new Date().getTime();
//     $('link[rel="stylesheet"]').each(function ()
//     {
//         this.href = this.href.replace(/\?.*|$/, queryString);
//     });
// }




