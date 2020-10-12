////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  functions used to validate and set the error class for the email <input>

function emailSetError (field, text)
{
    const section = document.getElementById ("name-section");
    configureElement ("div",
        {
            "class": "error-text",
            "id": "email-error",
            "innerText": text
        },
        section);

    setErrorClass (field, true);
    errors.names = true;
}

function charTest (char)
{   
    //  An email address must include both an '@' and period.  Those characters are not errors

    if ((char == "@") || (char == "."))
        return true;

    //  An email address may also include numeric digits

    if (!isNaN (parseInt (char)))
        return true;

    if (char.toLowerCase () == char.toUpperCase ())
        return false;

    return true;
}

function emailValidator (email)
{   const value = document.names.email.value.trim();
    if (value == "")
    {   nameSetError (email, "An email address is required");
        return false;
    }

    const indexAt = value.indexOf ("@");
    const indexDot = value.indexOf ("@", indexAt);

    //  No need to test all three error conditions.  They all check that the e-mail address appears to be a valid
    //  format, and they all display the same error message.  There's no need to have the same test on the screen
    //  multiple times.  So if any of them is true, that's enough.

    //  there must be an '@' and it can't be the first character

    if (indexAt < 1)
    {   nameSetError (email, "This does not appear to be a valid email address");
        return false;
    }

    //  there must be no more then one '@'

    if (value.indexOf ("@", (indexAt + 1)) != -1)
    {   nameSetError (email, "This does not appear to be a valid email address");
        return false;
    }

    //  although there can be dots '.' before the '@', there must be at least one after

    if (indexDot == -1)
    {   nameSetError (email, "This does not appear to be a valid email address");
        return false;
    }

    //  the string cannot end with a '.'

    if (value.lastIndexOf (".") == (value.length -1))
    {   nameSetError (email, "This does not appear to be a valid email address");
        return false;
    }

    //  and finally check for invalid characters in the name

    let length = value.length;
    for (let x=0; x<length; x++)
    {
        if (!charTest (value.charAt (x)))
        {   nameSetError (email, "This does not appear to be a valid email address");
            return false;
        }
    }

    return true;
}

function emailValidation (event)
{   event.preventDefault ();

    const email = event.target;
    
    emailValidator (email);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  functions used to validate and set the error class for the name <input> elements

function nameClearError (event)
{   event.preventDefault ();

    const input = event.target;
    input.select();
    const error = document.getElementById(input.name + "-error");
    if (error) error.remove();

    setErrorClass (input, false);
    errors.names = false;
}

function nameSetError (field, text)
{
    const section = document.getElementById ("name-section");
    configureElement ("div",
        {
            "class": "error-text",
            "id": field.name + "-error",
            "innerText": text
        },
        section);

    setErrorClass (field, true);
    errors.names = true;
}

function nameValidator (input)
{   const name = input.value;

    if ((input.name != "middle") && (name == ""))
    {   nameSetError (input, input.name + " is required");
        return false;
    }

    let length = name.length;
    for (let x=0; x<length; x++)
    {   //  Names can include titles which means names might also include periods.  Some names, like O'Neal, include
        //  apostrophes ("'").  Other than that, names should only include alpha characters

        if ((name.charAt (x) != "'") && (name.charAt (x) != "."))
            if (name.charAt (x).toLowerCase () == name.charAt (x).toUpperCase ())
            {   nameSetError (input, "This does not appear to be a real name");
                return false;
            }
    }

    return true;
}

function nameValidation (event)
{   event.preventDefault ();

    const input = event.target;
    nameValidator (input);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  functions that request APIs for various functions involving people

function sendDeactivate (event)
{   event.preventDefault ();

    AJAX ("GET", "/api/people/deactivatePerson/" + getCookie ("peopleId"), xml =>
    {
        if (xml.status == 205)
        {
            playAudio (ting);
            alert (document.names.give.value + " " + document.names.surname.value + " has been deactivated.");
            window.location.href="/admin/people-picker";
        }
        else
        {
            playAudio (buzz);
            alert (xml.responseText);
        }
    })
}

function sendLock (event)
{   event.preventDefault ();

    const target = event.target;
    let other = target.name == "lock" ? document.getElementById ("unlock-option") : document.getElementById ("lock-option");
        
    const api = "/api/people/lockPerson/" + getCookie ("peopleId") + "/" + (target.name == "lock" ? "true" : "false");
    AJAX ("GET", api, xml =>
    {
        if (xml.status == 200)
        {
            playAudio (ting);
            target.style.display = "none";
            other.style.display = "inline-block";
            alert ("This user account is now " + (target.name == "lock" ? "locked out" : "unlocked"))
        }
        else
        {
            playAudio (buzz);
            alert (xml.responseText);
        }
    })
}

function postNamesChange ()
{
    const postData =
    {
        user: getCookie ("peopleId"),
        given: document.names.given.value,
        middle: document.names.middle.value,
        surname: document.names.surname.value,
        email: document.names.email.value,
    };

    AJAX ("POST", "/api/people/updatePerson/" + getCookie ("peopleId"), xml =>
    {
        if (xml.status == 200)
        {
            playAudio (ting);
        }
        else
        {
            playAudio (buzz);
            alert (xml.responseText);
        }
    },
    postData);
}

function postNamesNew ()
{
    const postData =
    {
        given: document.names.given.value,
        middle: document.names.middle.value,
        surname: document.names.surname.value,
        email: document.names.email.value,
    };

    AJAX ("POST", "/api/people/createPerson", xml =>
    {
        if (xml.status == 200)
        {
            playAudio (ting);
            peopleId = JSON.parse(xml.responseText).insertId;
            setCookie ("peopleId", peopleId, 3600);
            createMode = false;
            doPersonData (
                {   add: false,
                    change: true,
                    results: [ postData ]
                });
        }
        else
        {
            playAudio (buzz);
            alert (xml.responseText);
        }
    },
    postData);
}

function postNamesValidate ()
{
    if (!nameValidator (document.names.given)) return false;
    if (!nameValidator (document.names.middle)) return false;
    if (!nameValidator (document.names.surname)) return false;

    if (!emailValidator (document.names.email)) return false;

    return true;
}

function postNames (event)
{   event.preventDefault ();

    //  this function is disabled if nothing has been changed

    let changed = false;

    let originalValue = document.getElementById ("name-given").getAttribute ("value");
    if (document.names.given.value != originalValue) changed = true;

    originalValue = document.getElementById ("name-middle").getAttribute ("value");
    if (document.names.middle.value != originalValue) changed = true;
    
    originalValue = document.getElementById ("name-surname").getAttribute ("value");
    if (document.names.surname.value != originalValue) changed = true;
    
    originalValue = document.getElementById ("email-input").getAttribute ("value");
    if (document.names.email.value != originalValue) changed = true;
    
    if (!changed)
    {
        playAudio (buzz);
        return false;
    }

    //  this function is disabled if there are errors in the data

    if (!postNamesValidate ())
    {
        playAudio (buzz);
        return false;
    }

    if (createMode)
        postNamesNew ();
    else
        postNamesChange ();
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

class PersonSection
{   //  PersonSection collects all of the functions required to acquire data for a user, get that data on the screen,
    //  and switch between 'create' and 'change' modes for the personal information (made up of the 'names' form and
    //  'lock section').
    //
    //  This class was created because the inline script in person.html was getting very long, very complicated and
    //  inflexible.  I was introducing bugs every time I had to make a change and I still had a lot of changes to make.
    //
    //  The class does not validate the input fields, as that seems like it would be complicating the code rather than
    //  simplifyingit.

    constructor ()
    {
        this.permission =
        {   add: false,
            change: false
        }

        this.lockMode = "unlocked";
    }

    allowInputs ()
    {   //  By default, all of the input fields are 'readonly'.  If this administrator is allowed to make changes to
        //  personal information (not all do) the 'readonly' attribute must be removed from the input fields

        if (this.permission.add || this.permission.change)
        {   document.getElementById ("name-given").removeAttribute ("readonly");
            document.getElementById ("name-middle").removeAttribute ("readonly");
            document.getElementById ("name-surname").removeAttribute ("readonly");
            document.getElementById ("email-input").removeAttribute ("readonly");
        }   
    }

    getChangePermission ()
    {   return this.permission.change;
    }

    initializeInputs (data)
    {
        this.lockMode = data.results.lock_code == undefined ? "unlocked" : "locked";

        if (data.results[0].given != "")
        {   
            document.names.given.value = data.results[0].given;
            document.getElementById ("name-given").setAttribute ("value", data.results[0].given);
        }

        if (data.results.middle != "")
        {   
            document.names.middle.value = data.results[0].middle;
            document.getElementById ("name-middle").setAttribute ("value", data.results[0].middle);
        }

        if (data.results.surname != "")
        {   
            document.names.surname.value = data.results[0].surname;
            document.getElementById ("name-surname").setAttribute ("value", data.results[0].surname);
        }

        if (data.results.email != "")
        {   
            document.names.email.value = data.results[0].email;
            document.getElementById ("email-input").setAttribute ("value", data.results[0].email);
        }

        this.allowInputs ();
    }

    retrievePersonData (peopleId)
    {
        return AJAX ("GET", "/api/people/getPerson/" + peopleId, xml =>
        {
            if (xml.status == 200)
            {
                const data = JSON.parse(xml.responseText);
                this.setAddPermission (data.add);
                this.setChangePermission (data.change);
                this.initializeInputs (data);
                this.setCreateMode (peopleId);
            }
            else
            {   alert ("PersonSection\n\n" + xml.responseText);
            }
        });
    }

    setChangeMode ()
    {   //  Set the display properties of appropriate DOM elements to allow the administrator to submit changes to the
        //  server

        document.getElementById ("create-option").remove();

        document.getElementById ("change-option").style.display = "inline-block";
        document.getElementById ("change-spacer").style.display = "inline-block";
        document.getElementById ("delete-option").style.display = "inline-block";

        document.getElementById ("permissions").style.display = "block";

        if (this.lockMode == "unlocked")
            document.getElementById ("lock-option").style.display = "inline-block";
        else
            document.getElementById ("unlock-option").style.display = "inline-block";

        if (this.permission.change)
            document.getElementById ("lock-section").style.display = "block";
        else
        {   document.getElementById ("change-option").remove();
            document.getElementById ("change-spacer").remove();
            document.getElementById ("lock-section").remove();
        }

        if (!this.permission.add)
            document.getElementById ("delete-option").remove();
    }

    setCreateMode (peopleId)
    {   //  By default, the constructor sets up the page in "change mode".  If this is a new user, sections and options
        //  must be hidden.

        if (peopleId != 0)
        {   //  peopleId represents the primary key of the row representing this user in the database.  If peopleId is not
            //  zero, we know this is not a new user
        
            this.setChangeMode ()
            return;
        }

        document.getElementById ("create-option").style.display = "inline-block";
    }

    setAddPermission (allow)
    {   if (allow) this.permission.add = true;
    }

    setChangePermission (allow)
    {   if (allow) this.permission.change = true;
    }
}