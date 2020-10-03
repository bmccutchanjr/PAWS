////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function handleLoginOption (event)
{   //  This is the event handler for the 'Log In' option.

    //  At this time, there is no effort to validate data.  This function submits data to the server for purposes of
    //  validating authentication credentials and does not update any data on the server.  Invalid or missing data only
    //  means the user cannot be authenticated -- and at this point in development, the inconvenience of making a second
    //  (or third) attempt to log in is not such a big deal.
    
    event.preventDefault ();

    AJAX ("POST", "/api/people/login/", xml =>
        {
            switch (xml.status)
            {   case 200:
                {
//  01                             status.data = true;
//  I'm not sure I have anything to do here...if the user has properly authenticated with the server there's no need to receive and
//  handle data from the server.  I'm just going to reload the page, and that's a status 205 not 200 (although 200 isn't exactly
//  incorrect, it just implies that data was sent data with the response.)
// console.log ("status: 200");
// console.log (xml.status);
// console.log (xml.responseText);
// console.log (xml.getAllResponseHeaders());
// window.location.reload();
                    break;
                }
                case 205:
                {
//  01                             status.data = true;
// console.log ("status: 205");
//  02  console.log (xml.status);
//  02  console.log (xml.responseText);
// console.log (JSON.stringify(xml.getAllResponseHeaders(), null, 2));
//  02  console.log (xml.getAllResponseHeaders());
window.location.reload();
                    break;
                }
                default:
                {   
// console.log ("status: default");
// console.log (xml.status);
// console.log (xml.responseText);
                    alert (xml.responseText);
                    break;
                }
            }
        },
        {
            "email": document.getElementById ("email").value,
            "password": document.getElementById ("password").value
        });
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  Functions and variables used to validate the login credentials

function isEmail (text)
{
    const indexAt = text.indexOf ("@");
    const indexDot = text.indexOf (".", indexAt);
    const length = text.length;

    if ((indexAt <= 0) || (indexAt == length)) return false;

    if ((indexDot <= 0) || (indexDot == length)) return false;

    if (indexDot < indexAt) return false;

    return true;
}

function isVolgistics (text)
{
    try
    {   Number (text)
    }
    catch (error)
    {   return false;
    }

    if (text.trim().length != 6) return false;

    return true;
}

function removeErrorText (div)
{
    const errors = div.getElementsByClassName ("error-text");
    const length = errors.length;
    for (let x=0; x<length; x++)
    {
        errors[x].remove ();
    };

    div.setAttribute ("class", div.getAttribute ("class").replace (" error", ""));
}

function validatePassword(event)
{   event.preventDefault ();

    const input = event.target;
    const parent = input.parentNode;

    if (input.value.trim() == "")
    {
        configureElement ("div",
            {
                "class": "error-text",
                "innerText": "You must enter a password"
            },
            parent);

        parent.setAttribute ("class", parent.getAttribute ("class") + " error");
    }
    else
    {
        removeErrorText (parent);
    }
}

function validateUser(event)
{   event.preventDefault ();

    let errors = false;

    const input = event.target;
    const parent = input.parentNode;

    const email = document.getElementById ("email");
    const volgistics = document.getElementById ("volgistics");

    if ((email.value.trim() == "") && (volgistics.value.trim() == ""))
    {
        configureElement ("div",
            {
                "class": "error-text",
                "innerText": "You must enter your email address or your Volgistics Id"
            },
            parent);

        errors = true;
    }

    if ((email.value.trim() != "") && (volgistics.value.trim() != ""))
    {
        configureElement ("div",
            {
                "class": "error-text",
                "innerText": "Only one.  Enter your email address or your Volgistics Id"
            },
            parent);

        errors = true;
    }

    if ((email.value.trim() != "") && (!isEmail (email.value)))
    {
        configureElement ("div",
            {
                "class": "error-text",
                "innerText": "This does not appear to be a valid email address"
            },
            parent);

        errors = true;
    }

    if ((volgistics.value.trim() != "") && (!isVolgistics (volgistics.value)))
    {
        configureElement ("div",
            {
                "class": "error-text",
                "innerText": "This does not appear to be a valid Volgistics Id"
            },
            parent);

        errors = true;
    }

    if (errors)
        parent.setAttribute ("class", parent.getAttribute ("class") + " error");
    else
    {
        removeErrorText (parent);
    }
}

