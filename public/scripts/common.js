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