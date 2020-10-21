////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  Various functions that add elements to the page.

function addFooter ()
{   //  Populate the footer...

    const div = document.body.getElementsByTagName ("footer")[0];

    const inner = configureElement ("div",
        {
            "class": "inner-footer",
            "id": "inner-footer"
        },
        div);

    configureElement ("div",
        {
            "class": "left",
            "innerText": "PAWS Log in"
        },
        inner);

    configureElement ("div",
        {
            "class": "right",
            "innerHTML": "&copy All Rights Reserved"
        },
        inner);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function handleLoginOption (event)
{   //  This is the event handler for the 'Log In' option.

    //  At this time, there is no effort to validate data.  This function submits data to the server for purposes of
    //  validating authentication credentials and does not update any data on the server.  Invalid or missing data only
    //  means the user cannot be authenticated -- and at this point in development, the inconvenience of making a second
    //  (or third) attempt to log in is not such a big deal.
    
    event.preventDefault ();

    AJAX ("POST", "/api/people/login/",
        {   205: xml =>
            {
//  During this development cycle, I don't want to redirect the page so I don't have to keep loading the page everytime
//  nodemon restarts the server.
                    if (window.location.href.indexOf("/login") > 0)
//                          window.location.href = "/";
                            alert ("you're in!");
                    else
                        window.location.href.reload();
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

document.addEventListener ("DOMContentLoaded", event =>
{
    addFooter ();
    document.getElementById("email").focus();
});