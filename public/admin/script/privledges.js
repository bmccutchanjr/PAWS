//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function postPrivledges (event)
{   event.preventDefault ();

    let postData = [];

    let changed = 0;

    const admin = document.getElementById ("admin-privledges");
    const privledges = admin.getElementsByTagName ("input");

    const length = privledges.length;
    for (let x=0; x<length; x++)
    {
        const checked = privledges[x].checked;
        const selected = privledges[x].getAttribute ("selected") == "true" ? true : false;

        if ((checked == selected) == false)
        {   changed++;
            let o = { [privledges[x].name] : checked }
            postData.push (o);
        }
    }
    if (changed > 0)
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

class PrivledgeSection
{   //  PrivledgeSection collects all of the functions required to get the 'privledges' on the screen,
    //  and switch between 'create' and 'change'.
    //
    //  This class was created because the inline script in person.html was getting very long, very complicated and
    //  inflexible.  I was introducing bugs every time I had to make a change and I still had a lot of changes to make.
    //

    constructor (peopleId)
    {
        this.changeMode = false;
        this.createMode = false;
        this.hasPrivledge = false;

        AJAX ("GET", "/api/people/getAdminPrivledges/" + getCookie ("peopleId"),
        {   200: xml =>
            {
                const data = JSON.parse(xml.responseText);
                this.hasPrivledge = data.allow;
                this.initialize (data);
            }
        });
    }

    setChangeMode ()
    {   //  Set the display properties of appropriate DOM elements to allow the administrator to submit changes to the
        //  server

        //  By default this class sets up for create mode...the privledge section remains in the DOM but is hidden.
        //
        //  If we're setting change mode, the privledge section should always visible.  However, the submit button should
        //  only be displayed if the administrator has the 'Grant admin privledges' privledge.

        if (this.hasPrivledge)
            document.getElementById ("post-privledge-updates").style.display = "inline-block";
    }

    initialize (data)
    {   
        const div = document.getElementById ("admin-privledges");

        configureElement ("div",
            {
                "class": "section-header",
                "innerText": "Admin Privledges"
            },
            div);

        data.privledges.forEach (p =>
        {
            const check = configureElement ("div",
                {
                },
                div);

            const input = configureElement ("input",
                {
                    "name": p.adminId,
                    "selected": p.allow == true ? true : false,
                    "type": "checkbox",
                },
                check);

            if (p.allow == true) input.setAttribute ("checked", "checked");
            if (data.allow != true) input.setAttribute ("disabled", "true");

            configureElement ("label",
                {
                    "for": p.adminId,
                    "innerText": p.privledge
                },
                check);
        });

        if (data.allow == true)
        {   configureElement ("button",
                {
                    "id": "post-privledge-updates",
                    "innerText": "Submit Changes",
                    "onclick": "postPrivledges(event);"
                },
                div);
        }
 
        this.setChangeMode ();
    }
}