//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  functions that request APIs to update data

function postAdditionalPermissions (event)
{   event.preventDefault ();

    let postData = [];

    let changed = 0;

    const target = event.target;
    const section = target.parentNode;
    const permissions = section.getElementsByClassName ("additional-permission");

    const length = permissions.length;
    for (let x=0; x<length; x++)
    {
        //  checked is supposed to be the state of the checkbox at the time the element was added to the DOM, and it is 
        //  not changed by clicking on the checkbox.  It would make an excellent way to check the original state of the
        //  checkbox, except (apparently) you can't access the attribute.  So I had to add a custom attribute to do the
        //  same thing.
        //
        //  To make thisngs even less intuitive, the value of the checkbox is stored in a property of the HTML element
        //  called -- wait for it -- checked!

        const originalstate = permissions[x].getAttribute ("originalstate") == "checked" ? true : false;

        //  The checked property (not to be confused with the checked attribute) is the current state of the checkbox
        
        const currentstate = permissions[x].checked;

        if ((currentstate == originalstate) == false)
        {   changed++;
            let obj =
                {
                    [ permissions[x].getAttribute ("restrictId") ]: currentstate
                };

            postData.push (obj);
        }
    }

    if (changed > 0)
    {
        const user = getCookie ("peopleId");
        const species = target.getAttribute ("species");
//  01          AJAX ("POST", "/api/people/updateAdditionalPermissions/" + user + "/" + species, xml =>
//  01          {
//  01              if (xml.status == 200)
//  01              {   playAudio (ting);
//  01                  alert ("Successfully updated additional permissions");
//  01              }
//  01              else
//  01              {
//  01                  playAudio (buzz);
//  01                  alert (xml.responseText);
//  01              }
//  01          },
        AJAX ("POST", "/api/people/updateAdditionalPermissions/" + user + "/" + species, 
        {   200: xml =>
            {   playAudio (ting);
                alert ("Successfully updated additional permissions");
            }
        },
        postData);
    }
}

function postColorUpdates (event)
{   event.preventDefault ();

    let postData = [];

    let changed = 0;

    const target = event.target;
    const section = target.parentNode;
    const colors = section.getElementsByClassName ("color-permission");

    const length = colors.length;
    for (let x=0; x<length; x++)
    {
        //  checked is supposed to be the state of the checkbox at the time the element was added to the DOM, and it is 
        //  not changed by clicking on the checkbox.  It would make an excellent way to check the original state of the
        //  checkbox, except (apparently) you can't access the attribute.  So I had to add a custom attribute to do the
        //  same thing.
        //
        //  To make thisngs even less intuitive, the value of the checkbox is stored in a property of the HTML element
        //  called -- wait for it -- checked!

        const originalstate = colors[x].getAttribute ("originalstate") == "checked" ? true : false;

        //  The checked property (not to be confused with the checked attribute) is the current state of the checkbox
        
        const currentstate = colors[x].checked;

        if ((currentstate == originalstate) == false)
        {   changed++;
            let obj = { [colors[x].name] : currentstate }
            postData.push (obj);
        }
    }

    if (changed > 0)
    {
        const user = getCookie ("peopleId");
        const species = target.getAttribute ("species");
//  01          AJAX ("POST", "/api/people/updateColorPermissions/" + user + "/" + species, xml =>
//  01          {
//  01              if (xml.status == 200)
//  01              {   playAudio (ting);
//  01                  alert ("Successfully updated color permissions");
//  01              }
//  01              else
//  01              {
//  01                  playAudio (buzz);
//  01                  alert (xml.responseText);
//  01              }
        AJAX ("POST", "/api/people/updateColorPermissions/" + user + "/" + species,
        {   200: xml =>
            {   playAudio (ting);
                alert ("Successfully updated color permissions");
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
    
        AJAX ("GET", "/api/people/getAnimalPermissions/" + getCookie ("peopleId"),
        {   200: xml =>
            {
                const data = JSON.parse(xml.responseText);
                this.hasPrivledge = data.allow;
                this.initialize (data, "cat");
                this.initialize (data, "dog");
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

        //
        //  create <input> elements for color permissions
        //

        data.permissions.forEach (p =>
        {
            const box = configureElement ("div",
                {
                },
                div);

            const input = configureElement ("input",
                {
                    "class": "color-permission",
                    "disabled": "disabled",
                    "name": p.color,
                    "type": "checkbox",
                },
                box);

            if (p[species])
            {
                input.setAttribute ("checked", "checked");
                input.setAttribute ("originalstate", "checked");
                // if (!data.allow) input.setAttribute ("disabled", "true");
            }

            if (this.hasPrivledge)
                input.removeAttribute ("disabled");

            configureElement ("label",
                {
                    "for": p.color,
                    "innerText": toProperCase(p.color)
                },
                box);
        });

        if (this.hasPrivledge)
        {   
            const button = configureElement ("button",
                {
                    "id": "post-color-permissions",
                    "innerText": "SUBMIT",
                    "onclick": "postColorUpdates(event);",
                    "species": species
                },
                div);

            button.style.display = "inline-block";
        }

        //
        //  create <input> elements for additional permissions
        //

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
 
                const input = configureElement ("input",
                    {
                        "class": "additional-permission",
                        "disabled": "disabled",
                        "name": index,
                        "restrictId": add["restrictId"],
                        "type": "checkbox"
                    },
                    box);

//  This is where I set the status of the checkbox (is it preselected or not) based on the property
//  'allowed' in the data set
                if (add["allow"])
                {
                    input.setAttribute ("checked", "checked");
                    input.setAttribute ("originalstate", "checked");
                }

                if (this.hasPrivledge)
                    input.removeAttribute ("disabled");

                configureElement ("label",
                    {
                        "for": index,
                        "innerText": add.restriction
                    },
                    box);
            }
        })

        if (hr && this.hasPrivledge)
        {   
            const button = configureElement ("button",
                {
                    "id": "post-additional-permissions",
                    "innerText": "Submit Changes",
                    "onclick": "postAdditionalPermissions(event);",
                    "species": species
                },
                div);

            button.style.display = "inline-block";
        }

        //
        //  create <input> elements for animal restrictions/permissions
        //

//
//  This is not implemented as yet, but when it is...this is where it will go
//
    }
}