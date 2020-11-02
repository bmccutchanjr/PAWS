class PrivledgeSection
{   //  PrivledgeSection collects all of the functions directly associated with entering, validating and posting
    //  administrative privledges to the server.  It exists for organizational purposes and clarity.  It is not
    //  intended to be instantiated.

    //  The properties of the Class.
    //
    //  There are no associated getter functions because they are strictly used by the static methods of the Class, nothing
    //  else in the application has need of them, nor could anything else make use of them.

    static #admin = document.getElementById ("admin-privledges");
    static #button = document.getElementById ("admin-privledges");
    static #changeMode = false;
    static #createMode = false;
    static #checkbox = [];
    static #hasPrivledge = false;
    static #section = document.getElementById ("permissions");

    static #configure (data)
    {
        configureElement ("div",
            {
                "class": "section-header",
                "innerText": "Admin Privledges"
            },
            this.#admin);

        data.privledges.forEach ((p, index) =>
        {
            this.#createCheckbox (p, index);
        });

        this.#createSubmitButton(this.#admin);
        this.#setChangeMode ();
    }

    static #createCheckbox (privledge, index)
    {   //  Create and configure an <input> element for the administrative privledge, and add it to the DOM.

        const check = configureElement ("div", { }, this.#admin);

        const input = configureElement ("input",
            {
                "name": privledge.adminId,
                "selected": privledge.allow == true ? true : false,
                "type": "checkbox",
            },
            check);

        this.#checkbox.push (input);

        if (privledge.allow == true) input.setAttribute ("checked", "checked");
        if (this.#hasPrivledge != true) input.setAttribute ("disabled", "true");

        configureElement ("label",
            {
                "for": privledge.adminId,
                "innerText": privledge.privledge
            },
            check);
    }

    static #createSubmitButton (div)
    {
        if (this.#hasPrivledge == true)
        {
            this.#button = configureElement ("button",
                {
                    "id": "post-privledge-updates",
                    "innerText": "Submit Changes",
                    "onclick": "PrivledgeSection.post(event);"
                },
                div);
        }
    }

    static display (createMode)
    {   
        if (!createMode)
            this.#section.style.display = "block";

        if (this.#hasPrivledge)
            this.#button.style.display = "inline-block";
    }

    static initialize ()
    {   
        AJAX ("GET", "/api/people/getAdminPrivledges/" + getCookie ("peopleId"),
        {   200: xml =>
            {
                const data = JSON.parse(xml.responseText);
                this.#hasPrivledge = data.allow;
                this.#configure (data);
            }
        });
    }

    static post (event)
    {   event.preventDefault ();

        let postData = [];

        let changed = false;

        this.#checkbox.forEach (check =>
        {
            const checked = check.checked;
            const selected = check.getAttribute ("selected") == "true" ? true : false;

            if ((checked == selected) == false)
            {
                changed = true;
                postData.push ( { [check.name] : checked } );
            }
        })

        if (changed)
        {
            AJAX ("POST", "/api/people/changeAdminPrivledges/" + getCookie ("peopleId"),
            {   200: xml =>
                {   playAudio (ting);
                    alert ("Successfully updated admin privledges");
                }
            },
            postData);
        }
    }

    static #setChangeMode ()
    {   //  Set the display properties of appropriate DOM elements to allow the administrator to submit changes to the
        //  server

        //  By default this class sets up for create mode...the privledge section remains in the DOM but is hidden.
        //
        //  If we're setting change mode, the privledge section should always visible.  However, the submit button should
        //  only be displayed if the administrator has the 'Grant admin privledges' privledge.

        if (this.#hasPrivledge)
            document.getElementById ("post-privledge-updates").style.display = "inline-block";
    }
}
