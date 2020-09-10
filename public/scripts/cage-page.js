////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function addMenu ()
{   //  Create the side-bar menu

    //  Menu options vary from page to page, but the empty side-bar and associated functions are
    //  the same.  So call a function to create the menu and return a reference to the DOM element
    //  so we can put the appropriate menu option in it.

    const menu = createMenu ();

    configureElement ("a",
        {   "class": "menu-option",
            "href": "login.html",
            "innerText": "Log in"
        },
        menu);

    configureElement ("a",
        {   "class": "menu-option",
            "href": "#",
            "innerText": "My Profile"
        },
        menu);

    configureElement ("hr",
        {   "class": "menu-separator",
        },
        menu);

    configureElement ("a",
        {   "class": "menu-option",
            "href": "#",
            "innerText": "View Comments",
        },
        menu);

    configureElement ("a",
        {   "class": "menu-option",
            "href": "#",
            "innerText": "Start Walking"
        },
        menu);

    configureElement ("hr",
        {   "class": "menu-separator",
        },
        menu);

    configureElement ("a",
        {   "class": "menu-option",
            "href": "#",
            "innerText": "Add Comments",
        },
        menu);

    configureElement ("a",
        {   "class": "menu-option",
            "href": "#",
            "innerText": "Add Public Comments",
        },
        menu);

    configureElement ("a",
        {   "class": "menu-option",
            "href": "#",
            "innerText": "Color-Test Notes"
        },
        menu);

    configureElement ("hr",
        {   "class": "menu-separator",
        },
        menu);

    configureElement ("a",
        {   "class": "menu-option",
            "href": "#",
            "innerText": "About"
        },
        menu);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function closeModal (event)
{
    event.preventDefault ();

    const modal = document.getElementById ("modal");
    modal.remove (modal);
}

function createModal (message)
{   //  Create a modal message and add it to the DOM

    const modal = configureElement ("div",
        {   "class": "modal",
            "id": "modal"
        },
        document.body);

    const msg = configureElement ("div",
        {   "class": "modal-message",
        },
        modal);

    configureElement ("div",
        {
            "class": "modal-text",
            "innerText": message
        },
        msg);

    const div = configureElement ("div",
        {   "class": "modal-options",
        },
        msg);

    configureElement ("a",
        {   "class": "modal-option",
            "href": "#",
            "innerText": "CLOSE",
            "onclick": "closeModal(event)"
        },
        div)
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

let dataset = [];

function parseCookies (cookie)
{   //  Parse the cookie string and return the value of the selected cookie

    let value = undefined;

    const cookies = document.cookie.split (";");
    cookies.forEach (c =>
    {
        const cPrime = c.split ("=");
        if (cPrime[0].trim() == cookie) value = cPrime[1];
    })

    return value;
}

function buildPage ()
{
    document.body.style.background = dataset[0].color;

    if (dataset[0].text != null)
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
            if (d.text != null)
                configureElement ("div",
                    {   "class": "restriction",
                        "innerText": d.text
                    },
                    div)
        })
    }

    document.getElementById ("footer-name").innerText = dataset[0].name;    
    document.getElementById ("footer-color").innerText = "(" + dataset[0].color + ")";    
}

function getAnimalData (animalId)
{   //  Retrieve data from server for the selected animal

    const xml = new XMLHttpRequest ();
    xml.onreadystatechange = () =>
    {
        if (xml.readyState == 4)
        {   switch (xml.status)
            {   case 200:
                {
//  01                      console.log (xml.responseText)
                    dataset = JSON.parse(xml.responseText);
                    buildPage();
                    break;
                }
                default:
                {
                    createModal ("PAWS was unable to complete this action.  An unspecified "
                               + "internal error occured on the server.  Please contact your "
                               + "IT support for assistance.");
                }
            }
        }
    }

    xml.open ("GET", "/api/animals/get/" + animalId, true);
    xml.send ();
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener ("load", () =>
{   //  When the page is fully rendered in the DOM...

    addMenu ();
})

getAnimalData (parseCookies ("animalId"));