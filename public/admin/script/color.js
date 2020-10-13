//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function postColorUpdates (event)
{   event.preventDefault ();

    let postData = [];

    let changed = 0;

    const target = event.target;
    const section = target.parentNode;
    const colors = section.getElementsByTagName ("input");

    const length = colors.length;
    for (let x=0; x<length; x++)
    {
        const checked = colors[x].checked;
        const selected = colors[x].getAttribute ("selected") == "true" ? true : false;

        if ((checked == selected) == false)
        {   changed++;
            let obj = { [colors[x].name] : checked }
            postData.push (obj);
        }
    }

    if (changed > 0)
    {
        const user = getCookie ("peopleId");
        const species = target.getAttribute ("species");
        AJAX ("POST", "/api/people/updateColorPermissions/" + user + "/" + species, xml =>
        {
            if (xml.status == 200)
            {   playAudio (ting);
                alert ("Successfully updated color permissions");
            }
            else
            {
                playAudio (buzz);
                alert (xml.responseText);
            }
        },
        postData);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

class ColorSection
{   //  ColorSection collects all of the functions required to request the animal waliking permissions and
    //  restrictions and get them on the screen.
    //
    //  This class was created because the inline script in person.html was getting very long, very complicated and
    //  inflexible.  I was introducing bugs every time I had to make a change and I still had a lot of changes to make.

    constructor (peopleId)
    {
        this.changeMode = false;
        this.createMode = false;
        this.hasPrivledge = false;
    
        AJAX ("GET", "/api/people/getAnimalPermissions/" + getCookie ("peopleId"), xml =>
        {
            if (xml.status == 200)
            {
                const data = JSON.parse(xml.responseText);
console.log (JSON.stringify(data, null, 2));
                this.hasPrivledge = data.allow;
                this.initialize (data, "cat");
                this.initialize (data, "dog");
            }
            else
            {   alert ("/getAnimalPermissions\n\n" + xml.responseText);
            }
        });
    }

    setChangeMode ()
    {   //  Set the display properties of appropriate DOM elements to allow the administrator to submit changes to the
        //  server

        //  By default this class sets up for create mode...the color sections are rendered in the DOM but are hidden.
        //
        //  If we're setting change mode, the color sections should always be visible.  However, the 'Submit Changes'
        //  button should only be displayed if the administrator has the 'Change animal colors' privledge.

        document.getElementById ("cat-permissions").style.display = "block";
        document.getElementById ("dog-permissions").style.display = "block";

        if (this.hasPrivledge)
        {   
            document.getElementById ("post-cat-updates").style.display = "inline-block";
            document.getElementById ("post-dog-updates").style.display = "inline-block";
        }
    }

    initialize (data, species)
    {   
        const div = document.getElementById (species + "-permissions");

        configureElement ("div",
        {
            "class": "section-header",
            "innerText": toProperCase(species) + " Permissions"
        },
        div);

        //  create <input> elements for color permissions

        data.permissions.forEach (p =>
        {
            const box = configureElement ("div",
                {
                },
                div);

            const input = configureElement ("input",
                {
                    "name": p.color,
                    "type": "checkbox",
                },
                box);

            if (p[species])
            {
                input.setAttribute ("checked", "checked");
                if (data.allow != true) input.setAttribute ("disabled", "true");
            }

            configureElement ("label",
                {
                    "for": p.color,
                    "innerText": toProperCase(p.color)
                },
                box);
        });

        if (this.hasPrivledge)
        {   configureElement ("a",
                {
                    "class": "menu-option",
                    "href": "#",
                    "id": "post-color-permissions",
                    "innerText": "SUBMIT",
                    "onclick": "postColorUpdates(event);",
                    "species": species
                },
                div);
        }

        //  create <input> elements for additional permissions

        let hr = false;

        data.additional.forEach ((add, index) =>
        {
            if (add[species])
            {
                if (!hr)
                {
                    hr = true;
                    configureElement ("hr", {}, div);
                }

                const box = configureElement ("div",
                    {
                    },
                    div);
 
                configureElement ("input",
                    {
                        "name": index,
                        "type": "checkbox"
                    },
                    box);

//  This is where I set the status of the checkbox (is it preselected or not) based on the property
//  'allowed' in the data set
                if (add[allow])
                {
                    input.setAttribute ("checked", "checked");
                    input.setAttribute ("originalvalue", "checked");
                    // if (data.allow != true) input.setAttribute ("disabled", "true");
                }


                configureElement ("label",
                    {
                        "for": index,
                        "innerText": add.restriction
                    },
                    box);
            }
        })

        if (hr && this.hasPrivledge)
        {   configureElement ("a",
                {
                    "class": "menu-option",
                    "href": "#",
                    "id": "post-additional-permissions",
                    "innerText": "Submit Changes",
                    "onclick": "postAdditionalPermissions(event);",
                    "species": species
                },
                div);
        }
    }
}