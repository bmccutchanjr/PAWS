//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  functions used to validate and set the error class for the password <input>

function passwordClearError (text)
{   event.preventDefault ();

    const input = event.target;
    input.select();
    const section = input.parentNode;
    const errors = section.getElementsByClassName ("error-text");
    const length = errors.length;
    for (let x=0; x<length; x++)
    {
        errors[x].remove ();
    }

    setErrorClass (input, false);
    errors.password = false;
}

function passwordSetError (input, text)
{
    const section = document.getElementById ("password-section");
    configureElement ("div",
        {
            "class": "error-text",
            "innerText": text
        },
        section);

    setErrorClass (input, true);
    errors.password = true;
}

function passwordValidation ()
{   //  This function is called by the 'change password' event handler and not by an 'onchange' event on the
    //  <input> element.  Both are equally effective and efficient, but this way may seem more intuitive to the
    //  user.

    const input = document.getElementById ("password");
    const password = input.value;

    if (password == "")
    {   passwordSetError (input, "A password is required");
        return false;
    }

    if (password.length < 8)
    {   passwordSetError (input, "Password must be at least 8 characters in length");
        return false;
    }

    return true;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function postPassword (event)
{   event.preventDefault ();

    if (errors.password)
    {   playAudio (buzz);
        return false;
    }

    if (passwordValidation ())
    {
        AJAX ("POST", "/api/people/changePassword/" + getCookie ("peopleId"), xml =>
        {
            if (xml.status == 200)
            {
                playAudio (ting);
                const input = document.getElementById ("password");
                input.value = null;
                alert ("All good!");
            }
            else
            {
                playAudio (buzz);
                alert (xml.responseText);
            }
        },
        { "password": password } );
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

class PasswordSection
{   //  PasswordSection collects all of the functions required to get the 'password-section' on the screen,
    //  and switch between 'create' and 'change'.
    //
    //  This class was created because the inline script in person.html was getting very long, very complicated and
    //  inflexible.  I was introducing bugs every time I had to make a change and I still had a lot of changes to make.
    //
    //  The class does not validate the input fields, as that seems like it would be complicating the code rather than
    //  simplifying it.

    constructor (peopleId)
    {
        this.changeMode = false;
        this.createMode = false;
        this.hasPrivledge = false;
    
        AJAX ("GET", "/api/people/hasPasswordPrivledge/" + getCookie ("peopleId"), xml =>
        {
            if (xml.status == 200)
            {
                this.hasPrivledge = (xml.responseText == "true" ? true : false);
                this.initialize (this.hasPrivledge);
            }
//  01  This is not an error condition...it is normal and expected and there is nothing to do here
//  01              else
//  01                  alert ("/hasPasswordPrivledge\n\n" + xml.responseText);
        });
    }

    setChangeMode ()
    {   //  Set the display properties of appropriate DOM elements to allow the administrator to submit changes to the
        //  server

        //  By default this class sets up for create mode...the password section remains in the DOM but is hidden.
        //
        //  If we're setting change mode, the password section should be visible but only if the administrator has the
        //  'Change password' privledge.
        //
        //  When the page was set up, the password section was removed from the DOM if the administrator doesn't have the
        //  'Change password' privledge.  Using that flag here as a short hand to make sure the element still exists before
        //  trying to access it.

        if (this.hasPrivledge)
        {   document.getElementById ("password-section").style.display = "block";
            document.getElementById ("password-option").style.display = "inline-block";
        }
    }

    initialize (allow)
    {   if (!this.hasPrivledge)
            document.getElementById ("password-section").remove ();
    }
}