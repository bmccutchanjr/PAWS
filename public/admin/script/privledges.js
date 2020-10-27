class PrivledgeSection
{   //  PrivledgeSection collects all of the functions directly associated with entering, validating and posting
    //  administrative privledges to the server.  It exists for organizational purposes and clarity.  It is not
    //  intended to be instantiated.

    //  The properties of the Class.
    //
    //  There are no associated getter functions because they are strictly used by the static methods of the Class, nothing
    //  else in the application has need of them, nor could anything else make use of them.

    static #button = undefined;
    static #changeMode = false;
    static #createMode = false;
    static #checkbox = [];
    static #hasPrivledge = false;
    static #section = undefined;

    static initialize ()
    {   
        this.#section = document.getElementById ("admin-privledges");

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
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////

    //  private methods

    static #configure (data)
    {
        configureElement ("div",
            {
                "class": "section-header",
                "innerText": "Admin Privledges"
            },
            this.#section);

        data.privledges.forEach (p =>
        {
            const check = configureElement ("div", { }, this.#section);

            const input = configureElement ("input",
                {
                    "name": p.adminId,
                    "selected": p.allow == true ? true : false,
                    "type": "checkbox",
                },
                check);

            this.#checkbox.push (input);

            if (p.allow == true) input.setAttribute ("checked", "checked");
            if (this.#hasPrivledge != true) input.setAttribute ("disabled", "true");

            configureElement ("label",
                {
                    "for": p.adminId,
                    "innerText": p.privledge
                },
                check);
        });

        if (this.#hasPrivledge == true)
        {
            this.#button = configureElement ("button",
                {
                    "id": "post-privledge-updates",
                    "innerText": "Submit Changes",
                    "onclick": "PrivledgeSection.post(event);"
                },
                this.#section);
        }
 
        this.#setChangeMode ();
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
