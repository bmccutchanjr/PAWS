//  This module collects the various functions used to create the sidebar menu and implement the menu options that
//  are common to all pages.
//

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  The API requests used to configure menu options

//  02  function checkAdmin ()
//  02  {   //  Ask the PAWS server if the user has admin privledges and return an appropriate boolean value

//  02      return AJAX ("GET", "/api/people/isAdmin", xml =>
//  02          {
//  02              return (xml.responseText == "true") ? true : false;
//  02          });
//  02  }
//  02  begins
function checkAdmin (success, failure)
{   //  Ask the PAWS server if the user has admin privledges and return an appropriate boolean value

    AJAX ("GET", "/api/people/isAdmin", xml =>
    {
        if ((xml.status == 200) && (xml.responseText == "true"))
            success();
        else
            failure(xml.responseText);
    });
}
//  02  ends

let isAuthenticated = undefined;

//  01  function checkAuthenticated ()
//  01  {   //  Determines if the user is authenticated with the server and return an appropriate boolean value
//  01  
//  01       //  Apparently I have to ask the server, so another API request.  Deleting the session cookie is not an automatic
//  01       //  process performed by the browser.  Maybe it can't, after all the browser doesn't know what the function of
//  01       //  "cookie.sid" is.  In any case, the cookie persists after logging out so I can't use it's presence to determine
//  01       //  if the user is authenticated.
//  01       //
//  01       //  And I can't just delete the cookie either.  The Logout function is a route and on success, redirects to "/log".
//  01       //  The original page and its script will no longer exist and there's no way for me to know if "/log" was served because
//  01       //  the user clicked on the Log Out option or if they hit the browser's back button.
//  01  
//  01       if (isAuthenticated != undefined) return isAuthentecated;
//  01  
//  01       return AJAX ("GET", "/api/people/isAuthenticated", xml =>
//  01           {
//  01               return ((xml.responseText == "true") ? true : false);
//  01           });
//  01   }
//  01  begins
function checkAuthenticated (success, failure)
{   //  Determines if the user is authenticated with the server and return an appropriate boolean value

    //  Apparently I have to ask the server, so another API request.  Deleting the session cookie is not an automatic
    //  process performed by the browser.  Maybe it can't, after all the browser doesn't know what the function of
    //  "cookie.sid" is.  In any case, the cookie persists after logging out so I can't use it's presence to determine
    //  if the user is authenticated.
    //
    //  And I can't just delete the cookie either.  The Logout function is a route and on success, redirects to "/log".
    //  The original page and its script will no longer exist and there's no way for me to know if "/log" was served because
    //  the user clicked on the Log Out option or if they hit the browser's back button.

    if (isAuthenticated == undefined)
        AJAX ("GET", "/api/people/isAuthenticated", xml =>
        {
            if ((xml.status == 200) && (xml.responseText == "true"))
                success();
            else
                failure(xml.responseText);
        });
    else
        if (isAuthenticated == true)
            success();
        else
            failure();
}
//  01  ends

function checkOptions (options)
{
    //  Some of the common options are hidden unless the user has authenticated with the server or the user has
    //  admin privledges.  The conditions may be true when the page loads, so verify with the server if these
    //  options should be hidden or visible.

//  01      checkAuthenticated ()
//  01       .then (result =>
//  01       {
//  01           if (result)
//  01           {
//  01               document.getElementById ("menu-login").style.display = "none";
//  01               document.getElementById ("menu-logout").style.display = "inline-block";
//  01  
//  01               if (options.MyProfile != false)
//  01                   document.getElementById ("menu-profile").style.display = "inline-block";
//  01           }
//  01       })
//  01       .catch (error =>
//  01       {
//  01           console.log (error);
//  01       });
//  01  begins
    checkAuthenticated (
        () =>
        {
            isAuthenticated = true;

            document.getElementById ("menu-login").style.display = "none";
            document.getElementById ("menu-logout").style.display = "inline-block";

            if (options.MyProfile != false)
                document.getElementById ("menu-profile").style.display = "inline-block";
        },
        error =>
        {
            console.log (error);
        });
//  01  ends

//  02      if (options.AdminFunctions != false)
//  02           checkAdmin ()
//  02           .then (result =>
//  02           {
//  02               if (result)
//  02                   document.getElementById ("menu-admin").style.display = "inline-block";
//  02           })
//  02           .catch (error =>
//  02           {
//  02               console.log (error);
//  02           });
//  02  begins
        checkAdmin (
        () =>
        {
            document.getElementById ("menu-admin").style.display = "inline-block";
        },
        error =>
        {
            console.log (error);
        });
//  02  ends
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

    configureElement ("a",
        {   "class": "menu-option",
            "href": "/help",
            "innerText": "Help"
        },
        menu);

    configureElement ("a",
        {   "class": "menu-option",
            "href": "/about",
            "innerText": "About"
        },
        menu);

    configureElement ("input",
        {   "class": "menu-option",
            "id": "suggest-a-name",
            "name": "suggest-a-name",
            // "onchange": "submitNames (event)",
            "placeholder": "(suggest a name)",
            "title": "Suggest a name for the animals.  Suggest multiple names by separating them with a comma."
        },
        menu);

    configureElement ("div",
        {   "class": "menu-option",
            "id": "post-suggest-name",
            "innerText": "Suggest Name",
            // "name": "suggest-a-name",
            "onclick": "postNameJar(event)"
            // "placeholder": "(suggest a name)",
            // "title": "Suggest a name for the animals.  Suggest multiple names by separating them with a comma."
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
    const expanded = icon.getAttribute ("expanded") == "true";
    if (expanded)
    {   closeSidebar ();
        return;
    }

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

function postNameJar (event)
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