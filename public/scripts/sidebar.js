//  This module collects the various functions used to create the sidebar menu and implement the menu options that
//  are common to all pages.
//

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  The API requests used to configure menu options

function checkAdmin ()
{   //  Ask the PAWS server if the user has admin privledges and return an appropriate boolean value

    return AJAX ("GET", "/api/people/isAdmin", xml =>
        {
            return (xml.responseText == "true") ? true : false;
        });
}

function checkAuthenticated ()
{   //  Determines if the user is authenticated with the server and return an appropriate boolean value

    //  Apparently I have to ask the server, so another API request.  Deleting the session cookie is not an automatic
    //  process performed by the browser.  Maybe it can't, after all the browser doesn't know what the function of
    //  "cookie.sid" is.  In any case, the cookie persists after logging out so I can't use it's presence to determine
    //  if the user is authenticated.
    //
    //  And I can't just delete the cookie either.  The Logout function is a route and on success, redirects to "/log".
    //  The original page and its script will no longer exist and there's no way for me to know if "/log" was served because
    //  the user clicked on the Log Out option or if they hit the browser's back button.

    return AJAX ("GET", "/api/people/isAuthenticated", xml =>
        {
            return ((xml.responseText == "true") ? true : false);
        });
}

function checkOptions (options)
{
    //  Some of the common options are hidden unless the user has authenticated with the server or the user has
    //  admin privledges.  The conditions may be true when the page loads, so verify with the server if these
    //  options should be hidden or visible.

    checkAuthenticated ()
    .then (result =>
    {
        if (result)
        {
            document.getElementById ("menu-login").style.display = "none";
            document.getElementById ("menu-logout").style.display = "inline-block";

            if (options.MyProfile != false)
                document.getElementById ("menu-profile").style.display = "inline-block";
        }
    })
    .catch (error =>
    {
        console.log (error);
    });

    if (options.AdminFunctions != false)
        checkAdmin ()
        .then (result =>
        {
            if (result)
                document.getElementById ("menu-admin").style.display = "inline-block";
        })
        .catch (error =>
        {
            console.log (error);
        });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function configureSidebar (commonOptions, additionalOptions)
{   //  Create the menu.
    //
    //  The menu consists of two elements; a small menu icon that is always visible in the top left
    //  corner of the page and the menu iteself which is runs the height of the page but is hidden
    //  until the menu icon is seleced.
    //

    const icon = configureElement ("div",
        {   "class": "menu-icon",
            "expanded": "false",
            "id": "menu-icon"
        },
        document.body);

    configureElement ("a",
        {   "class": "menu-option",
            "href": "#",
            "innerText": "►",
            "onclick": "openSidebar (event)"
        },
        icon);

    let menu = configureElement ("menu",
        {
            "class": "menu",
            "id": "menu"
        },
        document.body);

    //  Add options that are common to all pages...

    configureElement ("a",
        {   "class": "menu-option",
            "href": "/login",
            "id": "menu-login",
            "innerText": "Log In"
        },
        menu);

    configureElement ("a",
        {   "class": "menu-option",
            "href": "/logout",
            "id": "menu-logout",
            "innerText": "Log Out"
        },
        menu);

    if (commonOptions.HomePage != false)
        configureElement ("a",
            {   "class": "menu-option",
                "href": "/",
                "innerText": "Home"
            },
            menu);

    if (commonOptions.MyProfile != false)
        configureElement ("a",
            {   "class": "menu-option",
                "href": "/profile",
                "id": "menu-profile",
                "innerText": "My Profile"
            },
            menu);

    if (commonOptions.AdminFunctions != false)
        configureElement ("a",
            {   "class": "menu-option",
                "href": "/admin",
                "id": "menu-admin",
                "innerText": "Admin Functions"
            },
            menu);

    //  The menu includes options that are intended to be available only when certain conditions are met; when the user is
    //  authenticated to the server or when the user has admin privledges.  Otherwise, these options should be hidden.

    checkOptions (commonOptions);

    //  The menu may also include options that are page specific.  These options are created by a function passed from the
    //  page.

    if (additionalOptions != undefined)
    {   
        configureElement ("hr",
        {   "class": "menu-separator",
        },
        menu);

        additionalOptions ();

        configureElement ("hr",
        {   "class": "menu-separator",
        },
        menu);
    }

    //  There are additional menu options that are common to all pages and appear at the end of the menu.

    configureElement ("input",
        {   "class": "menu-option",
            "id": "suggest-a-name",
            "name": "suggest-a-name",
            "onchange": "submitNames (event)",
            "placeholder": "Suggest a name",
            "title": "Suggest a name for the animals.  Suggest multiple names by separating them with a comma."
        },
        menu);

    configureElement ("a",
        {   "class": "menu-option",
            "href": "#",
            "innerText": "About"
        },
        menu);
}

function closeSidebar ()
{   //  Hide the side bar...this function may be called from event handlers for various menu options or from the internal
    //  callback of a setTimeout, but it is not directly invoked by an event handler witha reference to either the sidebar
    //  or the menu-icon

    const icon = document.getElementById ("menu-icon");
    const expanded = icon.getAttribute ("expanded");

    //  It would not be an error for this function to be invoked after the siderbar has been hidden.  The user may have closed
    //  the sidebar explicitly by clicking on menu-icon, or implicitly by clicking on a menu-option that invokes this function.
    //  In any case, the sidebar may not be on screen when this function is invoked.  If the sidebar is not on screen, there
    //  is nothing to do here...

    if (expanded != "true") return;

    const menu = document.getElementById ("menu");

    menu.setAttribute ("class", menu.getAttribute ("class").replace (" menu-show", " menu-hide"));
    icon.setAttribute ("expanded", "false");
    icon.firstChild.innerText = "►";
}

const sidebar =
{   expanded: false,
    delay: 60000,
    time: undefined
}

function sidebarTimeout ()
{   //  Automatically close the side bar after one minute of inactivity, but only if the sidebar is actually on the screen.

    //  Some menu options will close the sidebar when selected, and some menu options will load another page, so I only want
    //  to do this if the side bar is expanded.

    const icon = document.getElementById ("menu-icon");
    const expanded = icon.getAttribute ("expanded");
    if (expanded != "true") return;

    //  If it has been less than 60 seconds since the user last interacted with the sidebar, set another timeout.  Set the
    //  delay to be 60 seconds from the last interaction (current time - previous time)

    const milliseconds = Date.now() - sidebar.time;
    if (milliseconds < sidebar.delay)
    {   //  If it hasn't been 60 seconds set a new timeout for the remaining time

        setTimeout (sidebarTimeout, (sidebar.delay - milliseconds));
        return;
    }

    //  finally close the sidebar
    closeSidebar ();
}

function openSidebar (event)
{   //  Show the sidebar and set a timeout to close it automatically after 60 seconds...

    event.preventDefault ();
    const icon = event.target.parentNode;
    const expanded = icon.getAttribute ("expanded");
    const menu = document.getElementById ("menu");

    //  sidebar.time is not a Date object, but the number of seconds since Jan 1, 1970.  I don't really need a Date object, 
    //  but I do need a number to do some math in sidebarTimeOut().  setTimeout doesn't want a Date either, but a number of
    //  milliseconds.  So a number is less work...

    sidebar.time = Date.now ();

    setTimeout (sidebarTimeout, sidebar.delay);

    if (menu.getAttribute ("class").indexOf ("menu-hide") == -1)
        menu.setAttribute ("class", menu.getAttribute ("class") + " menu-show");
    else
        menu.setAttribute ("class", menu.getAttribute ("class").replace (" menu-hide", " menu-show"));
    icon.setAttribute ("expanded", "true");
    icon.firstChild.innerText = "◄";
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function submitNames (event)
{   //  Submit a suggested name for the animals

    event.preventDefault ();

    const name = document.getElementById ("suggest-a-name").value;
    if ((name == "") || (name == null) || (name == undefined)) return;

    AJAX ("POST", "/api/animal/suggestName", xml =>
        {
            if (xml.status == 200)
                alert ("This name has been successfully added to the 'name jar'");
            else
            if (xml.status == 500)
                alert (xml.resultText);
            else
                alert (xml.responseText)
        },
        {   name
        });
}