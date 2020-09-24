//  This module collects the various functions used to create the sidebar menu and implement the menu options that
//  are common to all pages.
//

function checkOptions (options)
{
    //  Some of the common options are hidden unless the user has authenticated with the server or the user has
    //  admin privledges.  The conditions may be true when the page loads, so verify with the server if these
    //  options should be hidden or visible.

    checkAuthenticated ()
    .then (authenticated =>
    {
console.log ("promise");
console.log ("authenticated: " + authenticated);
        if (authenticated)
        {
            document.getElementById ("menu-login").style.display = "none";
            document.getElementById ("menu-logout").style.display = "inline-block";
            if (options.MyProfile != false)
                document.getElementById ("menu-profile").style.display = "inline-block";

            if (options.AdminFunctions != false)
                checkAdmin ()
                .then (isAdmin =>
                {
                    if (isAdmin)
                        document.getElementById ("menu-admin").style.display = "inline-block";
                })
                .catch (error =>
                {
                    console.log (error);
                });
        }
    })
    .catch (error =>
    {
        //  There may not be anything to do here...
        console.log (error);
    })
}

function configureSidebar (commonOptions, additionalOptions)
{   //  Create the menu.
    //
    //  The menu consists of two elements; a small menu icon that is always visible in the top left
    //  corner of the page and the menu iteself which is runs the height of the page but is hidden
    //  until the menu icon is seleced.
    //

    let icon = configureElement ("div",
        {   "class": "menu-icon",
            "id": "menu-icon"
        },
        document.body);

    configureElement ("a",
        {   "class": "menu-option",
            "expanded": "false",
            "href": "#",
            "innerText": "►",
            "onclick": "expandMenu (event)"
        },
        icon);

    let menu = configureElement ("menu",
        {
            "class": "menu",
            "id": "menu"
        },
        document.body);

    //  Not all of the common options are visible when the page loads.

    checkOptions (commonOptions);

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

    //  Now add the menu options that are page specific.  These options are created by a function passed from
    //  the page.

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

    //  And a couple more options that are common to all pages.

    configureElement ("input",
        {   "class": "menu-option",
            "onchange": "submitNames (event)",
            "placeholder": "Suggest a name for the animals"
        },
        menu);

    configureElement ("a",
        {   "class": "menu-option",
            "href": "#",
            "innerText": "About"
        },
        menu);

}

function openSidebar (event)
{   //  The 'menu-icon' option has been selected.  Either display or hide the menu depending on
    //  it's current state.

    event.preventDefault ();

    const icon = event.target;
    const expanded = icon.getAttribute ("expanded");
    const menu = document.getElementById ("menu");

    if (expanded == "true")
    {   menu.style.display = "none";
        menu.setAttribute ("class", menu.getAttribute ("class").replace (" menu-show", ""));
        icon.setAttribute ("expanded", "false");
        icon.innerText = "►";
    }
    else
    {   menu.style.display = "block";
        menu.setAttribute ("class", menu.getAttribute ("class") + " menu-show");
        icon.setAttribute ("expanded", "true");
        icon.innerText = "◄";
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkAdmin ()
{   //  Ask the PAWS server if the user has admin privledges and return an appropriate boolean value

    return new Promise ((resolve, reject) =>
    {
        const xml = new XMLHttpRequest ();
        xml.onreadystatechange = () =>
        {
            if (xml.readyState == 4)
            {   
                if (xml.status == 200)
                    resolve (true);
                else
                    reject (false);
            }
        }

        xml.open ("GET", "/api/people/isAdmin");
        xml.send ();
    })
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

    return new Promise ((resolve, reject) =>
    {
        const xml = new XMLHttpRequest ();
        xml.onreadystatechange = () =>
        {
            if (xml.readyState == 4)
            {   
console.log ("checkAuthentication ()");
console.log (xml.responseText);

//  01                  if (xml.status == 200)
//  01                      resolve (xml.responseText);
//  01                  else
//  01                      reject (xml.responseText);
                    resolve (xml.responseText == true) ? true : false;
            }
        }

        xml.open ("GET", "/api/people/isAuthenticated");
        xml.send ();
    })
}

function hideAdmin (isAuthenticated)
{   //  Set the CSS display attribute to hide or display the Admin option.  The parameter indicates whether the user
    //  is authenticated.  It remains to be seen if they have admin privledges.

    if (isAuthenticated)
    {   
        checkAdmin ()
        .then (result =>
        {
            document.getElementById ("menu-admin").style.display = "inline-block";
        })
        .catch (error =>
        {
            document.getElementById ("menu-admin").style.display = "none";
            
        })
    }
    else
    {   
        document.getElementById ("menu-admin").style.display = "none";
    }
}

function hideLogin (isAuthenticated)
{   //  Set the CSS display attribute to hide or display the Login and Logout options as indicated by the parameter

    if (isAuthenticated)
    {   
        document.getElementById ("menu-login").style.display = "inline-block";
        document.getElementById ("menu-logout").style.display = "none";
    }
    else
    {   
        document.getElementById ("menu-login").style.display = "none";
        document.getElementById ("menu-logout").style.display = "inline-block";
    }
}
