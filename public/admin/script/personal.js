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

//  function nameValidator (input)
//  {   const name = input.value;
//  
//      if ((input.name != "middle") && (name == ""))
//      {   nameSetError (input, input.name + " is required");
//          return false;
//      }
//  
//      let length = name.length;
//      for (let x=0; x<length; x++)
//      {   //  Names can include titles which means names might also include periods.  Some names, like O'Neal, include
//          //  apostrophes ("'").  Other than that, names should only include alpha characters
//  
//          if ((name.charAt (x) != "'") && (name.charAt (x) != "."))
//              if (name.charAt (x).toLowerCase () == name.charAt (x).toUpperCase ())
//              {   nameSetError (input, "This does not appear to be a real name");
//                  return false;
//              }
//      }
//  
//      return true;
//  }
//  
//  function nameValidation (event)
//  {   event.preventDefault ();
//  
//      const input = event.target;
//      nameValidator (input);
//  }

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

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

    AJAX ("POST", "/api/people/updatePerson/" + getCookie ("peopleId"),
    {   200: xml =>
        {
            playAudio (ting);

    //  And reset the value attribute of the various <input> elements with the new data

    document.getElementById ("name-given").setAttribute ("value", document.names.given.value);
    document.getElementById ("name-middle").setAttribute ("value", document.names.middle.value);    
    document.getElementById ("name-surname").setAttribute ("value", document.names.surname.value);
    document.getElementById ("email-input").setAttribute ("value", document.names.email.value);
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

    AJAX ("POST", "/api/people/createPerson",
    {   200: xml =>
        {
            playAudio (ting);
            peopleId = JSON.parse(xml.responseText).insertId;
            setCookie ("peopleId", peopleId, 3600);
            createMode = false;
            personSection.setChangeMode();
            passwordSection.setChangeMode();
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
        modal ("You haven't made any changes", buzz);
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

class DeleteButton
{   //  DeleteButton collects all of the functions directly associated with entering, validating and posting
    //  a request to delete a user account to the server.  It exists for organizational purposes and clarity.
    //  It is not intended to be instantiated.

    //  The properties of the Class.
    //
    //  There are no associated getter functions because they are strictly used by the static methods of the Class, nothing
    //  else in the application has need of them, nor could anything else make use of them.

    static #buttonDelete = document.getElementById ("delete-button");
    static #hasAddPrivledge; 

    static post (event)
    {   event.preventDefault ();

        modal ("You are about to delete this user account.  This action is permanent and cannot be undone.  Do you want to continue?",
            buzz,
            {    config: modal =>
                {
                    const div = configureElement ("div",
                        {
                            "class": "modal-buttons"
                        },
                        modal);
                        
                    const okay = configureElement ("button",
                        {
                            "class": "modal-button",
                            "innerText": "OK"
                        },
                        div);

                    configureElement ("div",
                        {
                            "class": "spacer"
                        },
                        div);
                        
                    configureElement ("button",
                        {
                            "class": "modal-button",
                            "innerText": "Cancel",
                            "onclick": "removeModal(event);"
                        },
                        div);
                
                    okay.addEventListener ("click", event => { this.#postIt (event); } );
                }
            });
    }

    static #postIt (event)
    {   //  Send a GET request to the server to delete the selected user account.  This is a private method that is only called
        //  from .post().  .post() is the event handler for the delete button.

        removeModal (event);

        AJAX ("GET", "/api/people/deactivatePerson/" + getCookie ("peopleId"),
        {   204: xml =>
            {
                modal (document.names.given.value + " " + document.names.surname.value + " has been deactivated.", ting);
                window.location.href="/admin/people-picker";
            }
        })
    }

    static setPrivledge (privledge)
    {
        this.#hasAddPrivledge = privledge;

        if (privledge)
        {
            this.#buttonDelete.style.display = "inline-block";
            this.#buttonDelete.addEventListener ("click", event => { this.post(event) } );
        }
        else
            this.#buttonDelete.remove();
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

class LockSection
{   //  LockSection collects all of the functions directly associated with entering, validating and posting
    //  the "lock" section to the server.  It exists for organizational purposes and clarity.  It is not
    //  intended to be instantiated.

    //  The properties of the Class.
    //
    //  There are no associated getter functions because they are strictly used by the static methods of the Class, nothing
    //  else in the application has need of them, nor could anything else make use of them.

    static #buttonLock = document.getElementById ("lock-button");
    static #buttonUnLock = document.getElementById ("unlock-button");
    static #lockMessage = document.getElementById ("lock-message");
    static #lockStatus = undefined;
    static #section = document.getElementById ("lock-section");

    static #hasAddPrivledge; 
    static #hasChangePrivledge; 

    static display (changeMode)
    {
        if (changeMode)
            this.#section.style.display = "block";
    }

    static initialize (data)
    {
        if (data.change) this.#hasChangePrivledge = true;

        DeleteButton.setPrivledge (data.add)
 
        this.#lockStatus = false;
        if (data.results[0] && data.results[0].locked) this.#lockStatus = data.results[0].locked;

        this.#buttonLock.addEventListener ("click", event => { this.post (event) } );
        this.#buttonUnLock.addEventListener ("click", event =>  { this.post (event) } );

        this.#setLockStatus (this.#lockStatus);
    }

    static post (event)
    {   event.preventDefault ();

        const api = "/api/people/lockPerson/" + getCookie ("peopleId") + "/" + (this.#lockStatus ? "false" : "true");
        AJAX ("GET", api,
        {   200: xml =>
            {
                modal ("This user account is now " + (this.#lockStatus ? "unlocked" : "locked out"), ting);
                this.#setLockStatus(!this.#lockStatus);
            }
        })
    }

    static setAddPrivledge (privledge)
    {
        DeleteButton.setPrivledge (privledge);
    }

    static setChangePrivledge (privledge)
    {
        this.#hasChangePrivledge = privledge; 

        if (!privledge)
        {
            this.#buttonLock.remove();
            this.#buttonUnLock.remove();
        }
    }

    static #setLockStatus (lockStatus)
    {
        this.#lockStatus = lockStatus;

        if (lockStatus)
        {
            this.#lockMessage.innerText = "This account has been temporarilly disabled by an administrator.";

            if (this.#hasChangePrivledge)
            {
                this.#buttonLock.style.display = "none";
                this.#buttonUnLock.style.display = "inline-block";
            }
        }
        else
        {
            this.#lockMessage.innerText = "This account is not disabled.";

            if (this.#hasChangePrivledge)
            {
                this.#buttonLock.style.display = "inline-block";
                this.#buttonUnLock.style.display = "none";
            }
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

class NameInput
{
    #error = true;
    #errorDiv = undefined;
    #input = undefined;
    #section = document.getElementById("personal-section");

    constructor (id, value)
    {
        this.#input = document.getElementById (id);
        this.#input.value = value;
        this.#input.setAttribute ("value", value);

        //  Add onchange and onfocus event handlers to the <input> element.
        //  
        //  If event listeners are added to the <input> elements in the HTML, I need a reference to each of the objects,
        //  individually.  But by adding the event handlers to the elements here, I don't.  The code is cleaner.

        this.#input.addEventListener ("focusout", event =>
        {   this.validate (event);
        });

        this.#input.addEventListener ("focus", event =>
        {   
            this.#input.select();
            
            if (this.#errorDiv)
            {
                this.#errorDiv.remove();
                clearError (PersonalSection.getSection(), this.#input);
            }
        });
    }

    readonly (readonly)
    {
        if (!readonly)
            this.#input.removeAttribute ("readonly");
    }

    #getAttribute (attribute)
    {
        return this.#input.getAttribute(attribute);
    }

    getError ()
    {
        return this.#input.error;
    }

    validate (event)
    {   if (event) event.preventDefault();
        
        this.#error = false;

//          const name = input.value;
        const name = this.#input.value;

//          if ((input.name != "middle") && (name == ""))
//          {   nameSetError (input, input.name + " is required");
//              return false;
//          }
        if ((this.#getAttribute("name") != "middle") && (name == ""))
        {
            this.#error = true;
            this.#errorDiv = setError (this.#section, this.#input, "A " + this.#getAttribute("name") + " name is required");
            return false;
        }

        let length = name.length;
        for (let x=0; x<length; x++)
        {   //  Names can include titles which means names might also include periods.  Some names, like O'Neal, include
            //  apostrophes ("'").  Other than that, names should only include alpha characters

            if ((name.charAt (x) != "'") && (name.charAt (x) != "."))
                if (name.charAt (x).toLowerCase () == name.charAt (x).toUpperCase ())
//                  {   nameSetError (input, "This does not appear to be a real name");
                {
                    this.#error = true;
                    this.#errorDiv = setError (this.#section, this.#input, "This does not appear to be a real name");
                    return false;
                }
        }

        return true;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

class PersonalSection
{   //  PersonalSection collects all of the functions directly associated with entering, validating and posting
    //  personal information to the server.  It exists for organizational purposes and clarity.  It is not
    //  intended to be instantiated.

    //  The properties of the Class.
    //
    //  There are no associated getter functions because they are strictly used by the static methods of the Class, nothing
    //  else in the application has need of them, nor could anything else make use of them.

    static #buttonCreate = document.getElementById ("create-option");
    static #buttonChange = document.getElementById ("change-option");
    static #createMode = false;
    static #hasAddPrivledge = false;
    static #hasChangePrivledge = false;
    static #section = document.getElementById ("personal-section");

    static #input =
    {
        given: undefined,
        middle: undefined,
        surname: undefined
    }

    static #allowInputs (data)
    {   //  By default, all of the input fields are 'readonly'.  If this administrator is allowed to make changes to
        //  personal information (not all do) the 'readonly' attribute must be removed from the input fields

        if (data.add || data.change)
        {
            this.#input["given"].readonly (false);
            this.#input["middle"].readonly (false);
            this.#input["surname"].readonly (false);
            document.getElementById ("email-input").removeAttribute ("readonly");
        }   
    }

    getChangePermission ()
    {   return this.permission.change;
    }

    static getSection ()
    {   return this.#section;
    }
    
    static #configure (data)
    {
        //  Configure <input> elements for PersonalSection
        //  Set default values

        if (data.results.length > 0)
        {
            this.#input["given"] = new NameInput ("given", data.results[0].given),
            this.#input["middle"] = new NameInput ("middle", data.results[0].middle),
            this.#input["surname"] = new NameInput ("surname", data.results[0].surname)

            document.names.email.value = data.results[0].email;
            document.getElementById ("email-input").setAttribute ("value", data.results[0].email);
        }
        else
        {
            this.#input["given"] = new NameInput ("given", ""),
            this.#input["middle"] = new NameInput ("middle", ""),
            this.#input["surname"] = new NameInput ("surname", "")

            document.names.email.value = "";
            document.getElementById ("email-input").setAttribute ("value", "");
        }

        //  And readonly property

        this.#allowInputs (data);

        //  Configure LockSection

        LockSection.initialize (data);

        //  Configure PermissionSection

        PrivledgeSection.display (this.#createMode);
        
    }

    static initialize (peopleId, callback)
    {
        if (peopleId == 0) this.#createMode = true;

        AJAX ("GET", "/api/people/getPerson/" + peopleId,
        {   200: xml =>
            {
                const data = JSON.parse(xml.responseText);
                this.#setAddPermission (data.add);
                this.#setChangePermission (data.change);
                this.#configure (data);
                this.#setCreateMode (peopleId);

            }
        });
    }

    static #setChangeMode ()
    {   //  Set the display properties of appropriate DOM elements to allow the administrator to submit changes to the
        //  server

        this.#createMode = false;

        this.#buttonCreate.remove();

        if (this.#hasChangePrivledge)
            this.#buttonChange.style.display = "inline-block";

        PasswordSection.display(this.#hasChangePrivledge);
        PrivledgeSection.display(this.#hasChangePrivledge);

        LockSection.display (!this.#createMode)
    }

    static #setCreateMode (peopleId)
    {   //  By default, the constructor sets up the page in "change mode".  If this is a new user, sections and options
        //  must be hidden.

        if (peopleId != 0)
        {   //  peopleId represents the primary key of the row representing this user in the database.  If peopleId is not
            //  zero, we know this is not a new user
        
            this.#setChangeMode ()
            return;
        }

        this.#createMode = true;
        this.#buttonCreate.style.display = "inline-block";
    }

    static #setAddPermission (allow)
    {   if (allow) this.#hasAddPrivledge = true;
    }

    static #setChangePermission (allow)
    {   if (allow) this.#hasChangePrivledge = true;
    }
}
