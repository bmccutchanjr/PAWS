function configureElement (elementType, object, parent = undefined)
{   //  A generic function to configure HTML elements in the DOM.
    //
    //  'elementType' and 'object are required.
    //
    //  'parent' is an optional parameter.  If passed it is some DOM element that the newly created
    //  element will be appended to.

    if (typeof elementType != "string")
    {   console.log ("Invalid parameter type: elementType");
        return false;
    }

    if (typeof object != "object")
    {   console.log ("Invalid parameter type: object");
        return false;
    }

    if (parent && (typeof parent != "object"))
    {   console.log ("Invalid parameter type: parent");
        return false;
    }

    //  First thing is to create the new HTML element...
    let element = document.createElement (elementType);

    //  And apply formatting...
    let keys = Object.entries (object);
    keys.forEach (attribute =>
    {   switch (attribute[0])
        {   case "display":
            {   element.style.display = attribute[1];
                break;
            }
            case "innerText":
            {   element.innerText = attribute[1];
                break;
            }
            case "innerHTML":
            {   element.innerHTML = attribute[1];
                break;
            }
            case "top":
            {   element.style.top = attribute[1];
                break;
            }
            default:
            {   element.setAttribute (attribute[0], attribute[1]);
                break;
            }
        }
    })

    //  And finally append it to it's parent
    if (parent)
        parent.append (element);

    return element;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  AUTHENTICATION
//
//  Functions and variables used to authenticate users.
//

////////////////////////////////////////////////////////////////////////////////////////////////////
//  MENUS
//
//  Functions and variables used to create and implement the page menu.  This code is common to
//  all pages and does not include anything page specific.
//

function createMenu ()
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

    return menu;
}

function expandMenu (event)
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
