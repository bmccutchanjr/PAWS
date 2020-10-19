////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  Various functions that add elements to the page.

function addFooter ()
{   //  Populate the footer...

    //  It may be possible (although I think not) that the API to retrieve data for this animal from the server
    //  to complete before the DOMContentLoaded event to invoke this function (or even before the DOMContentLoaded
    //  event fires).  If so, these elements will not be in the DOM when the API event handler tries to access
    //  them and the page will blow up.  I think it is very unlikely, all <script> tags follow the the <body> tag
    //  and the API request triggers two network transactions and a database transaction.   That has to take longer
    //  than rendering six elements to the DOM.

    const div = document.body.getElementsByTagName ("footer")[0];

    configureElement ("div",
        {   "class": "name",
            "id": "footer-name",
        },
        div);

    configureElement ("div",
        {   "class": "color",
            "id": "footer-color",
        },
        div);
}

function enableOptions ()
{   //  enable menu options if the current user is authenticatded with the server

    if (checkAuthenticated ())
    {   document.getElementById ("post-comments").style.display = "block";
        document.getElementById ("start-walking").style.display = "block";
        document.getElementById ("walk-separator").style.display = "block";
    }

    AJAX_2 ("GET", "/api/people/hasOpenSession")
    .then(result =>
    {
        if (result.data != "false")
        {   //  If 'result' is the boolean value false, there is no open session and nothing to do.  But if
            //  'result' is not false it is the primary key of the record in Interactions representing the
            //  session.

            const data = JSON.parse(result.data);

            document.getElementById ("start-walking").style.display = "none";
            const stop = document.getElementById ("stop-walking")
            stop.setAttribute ("sessionId", data[0].id);
            stop.style.display = "block";
        }
    })
    .catch(error =>
    {
        if (error.status == 500)
            modal (error.data);
    })
}

function addMenu ()
{   //  Create the side-bar menu

    //  Menu options vary from page to page, but the empty side-bar and associated functions are
    //  the same.  So call a function to create the menu and return a reference to the DOM element
    //  so we can put the appropriate menu option in it.

    configureSidebar ( { HomePage: false, MyProfile: true, AdminFunctions: true }, () =>
        {   configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "id": "start-walking",
                    "innerText": "Start Walking",
                    "onclick": "closeSidebar();startWalk(event);"
                },
                menu);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "id": "stop-walking",
                    "innerText": "Stop Walking",
                    "onclick": "closeSidebar();stopWalk(event);"
                },
                menu);

            configureElement ("hr",
                {   "class": "menu-separator",
                    "id": "walk-separator",
                },
                menu);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "id": "view-comments",
                    "innerText": "View Comments",
                    "onclick": "closeSidebar();getNotes(event)"
                },
                menu);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "id": "post-comments",
                    "innerText": "Enter Comments",
                    "onclick": "closeSidebar();postNote(event)"
                },
                menu);
            });

    enableOptions ();
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  event handlers for menu options

function addNoteFrame ()
{   //  Add an <iframe> element to the DOM.  The <iframe> is used to load an execute another page as a child
    //  process of cagepage.html.  This seems the most intuitive way to handle these pages for the user and seems
    //  to be the easiest to implement as well.

    //  It seems that an <iframe> cannot be positioned directly with CSS.  The rendering engine appear to ignore
    //  properties like 'margin: 0px auto' and 'left: 10%' when applied to an <iframe> element.  So the <iframe>
    //  must be placed inside a container that can be positioned.  And the container must be placed inside yet
    //  another to use 'margin: 0px auto'.
    //
    //  Isn't CSS just grand!

    const outer = configureElement ("div",
        {   "class": "outer-wrapper",
            "id": "note-wrapper"
        },
        document.body);

    const inner = configureElement ("div",
        {   "class": "inner-wrapper",
        },
        outer);

    const frame = configureElement ("iframe",
        {   "class": "note-frame",
            "id": "note-frame",
            "name": "iframe"
        },
        inner);
}

function getNotes (event)
{   event.preventDefault ();

    //  Add an <iframe> element to the DOM to load the page "getNotes.html".  getNotes.html includes scripts which
    //  will only be executed if the content is loaded into an <iframe> element (as opposed to any other container
    //  element such as a <div> or <section>).

    addNoteFrame();
    window.iframe.location = "cagepage/getNotes.html";
}

function postNote (event)
{   event.preventDefault ();

    //  Add an <iframe> element to the DOM to load the page "postNote.html".  postNote.html includes scripts which
    //  will only be executed if the content is loaded into an <iframe> element (as opposed to any other container
    //  element such as a <div> or <section>).
    
    addNoteFrame();
    window.iframe.location = "cagepage/postNotes.html";
}

//  01  begins
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  Various functions that to start/stop walks and timer

const timer =
{   interval: undefined,
    startTime: undefined
}

function addWalkTimer ()
{   //  Add a <div> to the DOM for a timer, and initialize an interval

    const header = document.getElementsByTagName("header")[0];

    const div = configureElement ("div",
        {
            "class": "timer",
            "id": "timer",
            "innerText": "00:00:00"
        },
        header);

        timer.startTime = Date.now();

    timer.interval = setInterval (() =>
    {   //  Update the innerText property of the element "timer" with the number of hours, minutes and seconds since
        //  this walk began

        const timeDiv = document.getElementById("timer");
        if (timeDiv)
        {   //  The timer is not guaranteed to be in the DOM while this runs

            let timeDiff = Date.now() - timer.startTime;
            timeDiff = Math.floor (timeDiff / 1000);
            const seconds = (timeDiff % 60).toString().padStart(2, "0");
            const minutes = (Math.floor(timeDiff / 60) % 60).toString().padStart(2, "0");
            const hours = (Math.floor(timeDiff / 3600)).toString().padStart(2, "0");

            document.getElementById("timer").innerText = hours + ":" + minutes + ":" + seconds;
        }
    }, 1000)
}

function startWalk (event)
{   event.preventDefault();
    
    const target = event.target;
    target.style.display = "none";

    AJAX_2 ("GET", "/api/animals/startSession/" + getCookie ("animalId"))
    .then(result =>
    {
        //  add a timer to the DOM and setInterval() to time the session

        addWalkTimer();

        //  hide/display walking menu items

        const data = JSON.parse(result.data);

        document.getElementById("start-walking").style.display = "none";
        const stop = document.getElementById("stop-walking");
        stop.setAttribute ("sessionId", data.insertId);
        stop.style.display = "block";

        //  and play audio

        playAudio (ting);
    })
    .catch(error =>
    {
        modal (error.data);
        playAudio (buzz);
    })
}

function stopWalk (event)
{   event.preventDefault();

    //  End a walking session...

    AJAX_2 ("GET", "/api/animals/stopSession/" + document.getElementById("stop-walking").getAttribute("sessionId"))
    .then(_ =>
    {
        const timeDiv = document.getElementById("timer");
        if (timeDiv)
        {   //  If the timer is in the DOM (and it may not be if the user reloaded the page or navigated away and then back)
            //  remove the timer and clearInterval()

            timeDiv.remove();
            clearInterval(timer.interval);
        }

        //  hide/display walking menu items

        document.getElementById("start-walking").style.display = "block";
        const stop = document.getElementById("stop-walking");
        stop.removeAttribute ("sessionId");
        stop.style.display = "none";

        //  and play audio

        playAudio (ting);
    })
    .catch(error =>
    {
        modal (error);
        playAudio (buzz);
    })
}
//  01  ends

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

let dataset = [];

function animalImage (source)
{   //  Sets the background image of the page to a picture of the animal as indicated by the data set returned by
    //  the server.

    const body = document.body;
    body.style.backgroundImage = "url(" + source + ")";

    //  These properties of the background image are constant and wouldn't need to be set here, except that setting
    //  the source URL overrides all other background image properties set in CSS.  As this is the behavior I want, I
    //  have to set these properties here.

    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundPosition = "center";
    body.style.backgroundSize = "contain"
}

function buildPage ()
{
    document.body.style.background = dataset[0].color;
    animalImage (dataset[0].image)

    if (dataset[0].restriction != null)
    { 
        const modal = configureElement ("div",
            {   "class": "restriction-wrapper"
            },
            document.body);
        
        const div = configureElement ("div",
            {   "class": "restriction-text"
            },
            modal);

        dataset.forEach (d =>
        {
            if (d.restriction != null)
                configureElement ("div",
                    {   "class": "restriction",
                        "innerText": d.restriction
                    },
                    div)
        })
    }

    document.getElementById ("footer-name").innerText = dataset[0].name;    
    document.getElementById ("footer-color").innerText = "(" + dataset[0].color + ")";    
}

function getAnimalData (animalId)
{   //  Retrieve data from server for the selected animal

    AJAX_2 ("GET", "/api/animals/get/" + animalId)
    .then(result =>
    {
        dataset = JSON.parse(result.data);
        buildPage();
    })
    .catch(error =>
    {
        modal (error);
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener ("DOMContentLoaded", event =>
{   //  When the page is fully rendered in the DOM...

    addFooter ()
    addMenu ();
})

window.addEventListener ("message", event =>
{   //  The page that's active in the <iframe> needs cagepage.html to do something

    const keys = Object.keys (event.data);
    switch (keys[0])
    {   case "new-height":
        {   document.getElementById("note-frame").style.height = event.data[keys[0]] + "px";
            break;
        }
        case "remove-iframe":
        {
            if (event.data[keys[0]] == true)
            {   document.getElementById("note-wrapper").remove();
                playAudio (ting);
            }

            break;
        }
        default:
        {   console.log ("PAWS ERROR 105");
            console.log ("An unknown message was recieved from a child process");
            console.log (data);
            break;
        }
    }
})

getAnimalData (getCookie ("animalId"));
