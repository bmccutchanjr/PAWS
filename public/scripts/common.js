//  01  JavaScript throws a DOMException if you try to play audio before the user has interacted with the page,
//      and many (maybe most) calls to AJAX() are retrieving data at page load...the user has't had a chance to
//      interact with the page.  I would really like to have that audio though.

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function AJAX (method, route, switchHandlers, data)
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

    //  Because the function call is expecting a Promise, it needs a reject or resolve, not a simple boolean
    //  value.  Reject and resolve are only available in the Promise's callback and so the parameters must be
    //  validated in callback.

    if (typeof method != "string") reject ("'method' is not a string.");
    method = method.toUpperCase ();
    if ((method != "GET") && (method != "POST")) reject ("'method' is not a supported HTTP method.");

    if (typeof route != "string") reject ("'route' is not a string.");

    let postData = "";

    if (method == "POST")
    {   if (data == undefined) reject ("'request data' is required for POST requests.");
        if (typeof data != "object") reject ("'request data' is not JSON object.");

        let post = [];

        try
        {   data.forEach (d =>
            {
                Object.entries (d).forEach (entry =>
                {
                    post.push (entry[0] + "=" + entry[1]);
                });
            })
        }
        catch (error)
        {   //  This is not actually an error.  The data passed to this function is either an array or an object.  I
            //  can iterate an array with .forEach(), but JavaScript will throw an error if I try to use it on an object.
            //  Use .forAll() with objects.
            //
            //  Simply put, if JavaScript throws an error when I try to use .forEach() I have an object and I
            //  want to use this code.
            
            Object.entries (data).forEach (entry =>
            {
                post.push (entry[0] + "=" + entry[1]);
            });
        }

        postData = post.join ("&");
    }

    const xml = new XMLHttpRequest ();

    xml.open (method, route);
    if (method != "POST")
        xml.send ();
    else
    {
        xml.setRequestHeader ("Content-Type", "application/x-www-form-urlencoded");
        xml.send (postData);
    }

    xml.onreadystatechange = () =>
    {
        if (xml.readyState == 4)
        {   
//  Error handling SUCKS!  When you catch errors, JavaScript won't expose all of the information that is available when
//  you don't catch error -- it makes debugging very difficult.  So error handling is disabled during the development
//  cycle.
//              try
//              {
                switch (xml.status)
                {
                    case 200:
                    {
                        switchHandlers[200](xml);
                        break;
                    }
                    case 204:
                    {
                        switchHandlers[204](xml);
                        break;
                    }
                    case 205:
                    {
                        switchHandlers[205](xml);
                        break;
                    }
                    default:
                {
//  01                          playAudio (buzz);
                        if (switchHandlers["default"])
                            switchHandlers["default"](xml);
                        else
                            modal (xml.responseText);
                        break;
                    }
                }
//              }
//              catch(error)
//              {
//  //  01                  playAudio (buzz);
//                  modal (error);
//              }
        }
    }

    xml.onfailure = error =>
    {
//  01          playAudio(buzz);
        modal (error);
    }
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

//  cookies

function getCookie (cookie)
{   //  Parse the cookie string and return the value of the selected cookie

    let value = undefined;

    const cookies = document.cookie.split (";");
    const length = cookies.length;
    for (let x=0; x<length; x++)
    {
        const cPrime = cookies[x].split ("=");
        if (cPrime[0].trim() == cookie) return cPrime[1];
    }

    return false;
}

function setCookie (name, value, maxAge=86400, path="/")
{
    document.cookie = name + "=" + value + ";"
                    + "path=" + path + ";"
                    + "maxAge=" + maxAge + ";"
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  functions and variables needed to implement the modal message element

//  02  function removeModal (event)
function removeModal (event, callback)
{   event.preventDefault ();

    //  The modal element to be removed from the DOM is actually the grandparent of the element that triggers
    //  this event.

//  I thought since I put the onclick event on a <div> that <div> should be the target of the event.  A quick and efficient
//  way to reference the <div> since this function received the event as a parameter.  Which would make the <div> with class
//  "modal" the parent of event.target.  Nope!  It turns out I need the grandparent (even though the <div> I want is the
//  container of the one with the event listener).
//  
//  But now I find that doesn't work consistently.  Sometimes this function removed the <div> element with id = modal (the
//  one I wanted) and sometimes it removes the <div> with class = modal-message (which is the <div> with the onclick event).
//  Which means that sometimes the DOM event is triggered by the <div> and sometimes by some child of the <div>.   EVEN WHEN
//  THE ELEMENTS ARE CREATED IN THE SAME FUNCTION.
//  
//  The event target can't be relied on, and it's not worth trying to figure it out.
//      const modal = event.target.parentNode.parentNode;
//
//  Get a reference to the element I really want with an ID.  That will always work.  It also means I have a lot of code
//  that is now suddenly suspect and fixing it may add unnecessary complications.  Not DRY -- but also not my fault.  I can't
//  do what the browser doesn't do.
    const modal = document.getElementById("modal-wrapper");
    modal.remove ();
    playAudio (ting);

    if (callback) callback();
}

function modal (message, audio=false, callback=undefined)
{   //  Create a modal message and add it to the DOM

    if (audio) playAudio (audio);

    const wrapper = configureElement ("div",
        {   "class": "modal-wrapper",
            "id": "modal-wrapper"
        },
        document.body);

    const modal = configureElement ("div",
        {   "class": "modal-div",
        },
        wrapper);

    modal.addEventListener ("click", event =>
    {
        if (callback && callback["final"])
            removeModal(event, callback["final"]);
        else
            removeModal(event);
    });

    configureElement ("div",
        {
            "class": "modal-text",
            "id": "modal-text",
            "innerText": message
        },
        modal);

    if (callback && callback["config"])
    {
        modal.removeEventListener ("click");
        callback["config"]();
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  various and assundry functions and variables

// pre-load audio files

const buzz = new Audio("../audio/buzz.mp3");
const ting = new Audio("../audio/ting.mp3");

function playAudio (sound)
{
    sound.load ();
    sound.play ();
}
