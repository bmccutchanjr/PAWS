class PasswordSection
{   //  PasswordSection collects all of the functions directly associated with entering, validating and posting passwords
    //  to the server.  It exists for organizational purposes and clarity.  It is not intended to be instantiated.

    //  The properties of the Class.
    //
    //  There are no associated getter functions because they are strictly used by the static methods of the Class, nothing
    //  else in the application has need of them, nor could anything else make use of them.

    static #button = document.getElementById ("password-button");
    static #changeMode = false;
    static #createMode = false;
    static #errorDiv = undefined;
    static #errors = false;
    static #hasPrivledge = false;
    static #input = document.getElementById ("password");
    static #section = document.getElementById ("password-section");

    static clearError (event)
    {   event.preventDefault();

        this.#input.select();
        setErrorClass (this.#input, false);
        this.#errors = false;

        const errors = this.#section.getElementsByClassName ("error-text");
        const length = errors.length;
        for (let x=0; x<length; x++)
        {
            errors[x].remove ();
        }
    }

    static display ()
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

        if (this.#hasPrivledge)
        {   this.#section.style.display = "block";
        }
    }

    static initialize (peopleId)
    {
        AJAX ("GET", "/api/people/hasPasswordPrivledge/" + peopleId,
        {   200: xml =>
            {
                this.#hasPrivledge = (xml.responseText == "true" ? true : false);

                if (this.#hasPrivledge)
                    this.#button.style.display = "inline-block";
                else
                    this.#section.remove ();
            }
        });
    }

    static post (event)
    {   event.preventDefault ();

        const password = this.#validate ();

        if (!password)
            playAudio (buzz);
        else
        {
            AJAX ("POST", "/api/people/changePassword/" + getCookie ("peopleId"),
            {   200: xml =>
                {
                    this.#input.value = null;
                    modal ("Success!  The password has been reset.", ting);
                }
            },
            { "password": password } );
        }
    }

    static #validate ()
    {   //  This function is called by the 'change password' event handler and not by an 'onchange' event on the
        //  <input> element.  Both are equally effective and efficient, but this way may seem more intuitive to the
        //  user.

        const password = this.#input.value;

        if (password == "")
        {
            this.#errorDiv = setError (this.#section, this.#input, "A password is required");
            return false;
        }

        if (password.length < 8)
        {   setError (this.#section, this.#input, "Password must be at least 8 characters in length");
            return false;
        }

        return password;
    }
}