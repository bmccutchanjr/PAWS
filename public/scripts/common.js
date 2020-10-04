////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function AJAX (method, route, result, data)
{   //  Gosh, but I'm writing this code a lot!  And I'm going to need to write it a lot more!  That strongly
    //  suggests a function call...

    //  Parameters 'method', 'route' and 'function' are required.
    //
    //      'method' is a string value containing the HTTP method to use.
    //
    //      'route' is a string value containing the route or end-point to request
    //
    //      'result is a function used to process the result returned from the server
    //
    //  Parameter 'data' is an optional parameter that contains the request data.  'data' is required if
    //  method == 'POST'.

    return new Promise ((resolve, reject) =>
    {
        //  Because the function call is expecting a Promise, it needs a reject or resolve, not a simple boolean
        //  value.  Reject and resolve are only available in the Promise's callback and so the parameters must be
        //  validated in callback.

        if (typeof method != "string") reject ("'method' is not a string.");
        method = method.toUpperCase ();
        if ((method != "GET") && (method != "POST")) reject ("'method' is not a supported HTTP method.");

        if (typeof route != "string") reject ("'route' is not a string.");

        if (typeof result != "function") reject ("'result' is not a function.");

        let requestData = "";

        if (method == "POST")
        {   if (data == undefined) reject ("'request data' is required for POST requests.");
            if (typeof data != "object") reject ("'request data' is not JSON object.");

            if (data.forEach)
            {   data.forEach (d =>
                {   
                    if (requestData.length != 0) requestData += "&";

                    Object.entries (d).forEach (entry =>
                    {
                        requestData += entry[0] + "=" + entry[1];
                    });
                })
            }
            else
            {   Object.entries (data).forEach (entry =>
                {
                    if (requestData.length != 0) requestData += "&";
                    requestData += entry[0] + "=" + entry[1];
                });
            }
        }

        const xml = new XMLHttpRequest ();

        xml.open (method, route);
        if (method != "POST")
            xml.send ();
        else
        {
            xml.setRequestHeader ("Content-Type", "application/x-www-form-urlencoded");
            xml.send (requestData);
        }

        xml.onreadystatechange = () =>
        {
            if (xml.readyState == 4)
            {   
                resolve (result (xml));
            }
        }
    })
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

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
////////////////////////////////////////////////////////////////////////////////////////////////////

function removeModal (event)
{   event.preventDefault ();

    //  The modal element to be removed from the DOM is actually the grandparent of the element that triggers
    //  this event.

    const modal = event.target.parentNode.parentNode;
    modal.remove ();    
}