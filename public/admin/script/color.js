let additionalCat = undefined;
let additionalDog = undefined;

class ColorPermissions
{   //  ColorSection collects all of the functions directly associated with entering, validating and posting
    //  color permissions to the server.  It exists for organizational purposes and clarity.  Unlike the other class
    //  modules, ColorPermissionSection is intended to be instantiated for different species of animals.

    //  The properties of the Class.
    //
    //  There are no associated getter functions because they are strictly used by the static methods of the Class, nothing
    //  else in the application has need of them, nor could anything else make use of them.

    #button = undefined;
    static #changeMode = false;
    #checkbox = [];
    static #createMode = false;
    static #dataset = [];
    static #hasPrivledge = false;
    #instanceName = undefined;
    static #peopleId = undefined;
    #section = undefined;
    #species = undefined

    constructor (dataset, species)
    {
        this.#species = species;
        this.#section = document.getElementById (species + "-permissions");
        if (species == "cat") this.#instanceName = "additionalCat";
        if (species == "dog") this.#instanceName = "additionalDog";

        this.#configure (ColorPermissions.#dataset, species);

        const additionalPermissions = new AdditionalPermissions (this.#section, ColorPermissions.#dataset, species);
    }

    #configure (data, species)
    {
        if (data.permissions.length == 0) return;

        const div = configureElement ("div", { }, this.#section);

        configureElement ("div",
        {
            "class": "section-header",
            "innerText": toProperCase(species) + " Permissions"
        },
        div);

        data.permissions.forEach ((color, index) =>
        {
            this.#createCheckbox (div, species, color, index)
        });

        this.#createSubmitButton(div, species);
    }

    #createCheckbox (div, species, color, index)
    {
        const box = configureElement ("div", { }, div);

        this.#checkbox.push (configureElement ("input",
            {
                "class": "color-permission",
                "disabled": "disabled",
                "name": color.color,
                "type": "checkbox",
            },
            box));

        if (color[species])
        {
            this.#checkbox[index].setAttribute ("checked", "checked");
            this.#checkbox[index].setAttribute ("originalstate", "checked");
        }

        if (ColorPermissions.getPrivledge())
            this.#checkbox[index].removeAttribute ("disabled");

        configureElement ("label",
            {
                "for": color.color,
                "innerText": toProperCase(color.color)
            },
            box);
    }

    #createSubmitButton (div, species)
    {   //  Create a <button> element to allow the user to submit changes made to the color permissions, only if the
        //  currently authenticated user has the appropriate privledge.

        //  All administrators are authorized to see color permissions, but not all of them are authorized to change
        //  them.

        if (ColorPermissions.#hasPrivledge)
        {   
            this.#button = configureElement ("button",
               {
                    "id": "post-color-permissions",
                    "innerText": "Submit Changes",
                    "onclick": this.#instanceName + ".post(event);",
                    "species": species
                },
                div);
 
            this.#button.style.display = "inline-block";
        }
    }

    displaySection ()
    {   //  ColorPermission does not know whether the application is in "change mode" or "create" mode.  The DOM element is
        //  either in the DOM or it is not.  By default, it is not.
        //
        //  This method is invoked by a process outside of the scope of this Class to change the display property of the
        //  DOM element if it is appropriate.  The element is not displayed when a new user is being created and is always
        //  displayed when an existing user is being viewed or changed.  Regardless of whether the currently authenticated
        //  user has authority to change these permissions, they still have authority to see them.

        this.#section.style.display = "block";
    }

    post (event)
    {   event.preventDefault ();

        let postData = [];

        let changed = false;

        const target = event.target;

        this.#checkbox.forEach ((color, index) =>
        {
            //  checked is supposed to be the state of the checkbox at the time the element was added to the DOM, and it is 
            //  not changed by clicking on the checkbox.  It would make an excellent way to check the original state of the
            //  checkbox, except (apparently) you can't access the attribute.  So I had to add a custom attribute to do the
            //  same thing.
            //
            //  To make thisngs even less intuitive, the value of the checkbox is stored in a property of the HTML element
            //  called -- wait for it -- checked!

            const originalstate = color.getAttribute ("originalstate") == "checked" ? true : false;

            //  The checked property (not to be confused with the checked attribute) is the current state of the checkbox
        
            const currentstate = color.checked;

            if ((currentstate == originalstate) == false)
            {
                changed = true;
                let obj = { [color.name] : currentstate }
                postData.push (obj);
            }
        })

        if (changed)
        {
            const user = getCookie ("peopleId");
            const species = target.getAttribute ("species");

            AJAX ("POST", "/api/people/updateColorPermissions/" + user + "/" + species,
            {   200: xml =>
                {   playAudio (ting);
                    alert ("Successfully updated color permissions");
                }
            },
            postData);
        }
        else
            modal ("You didn't make any changes to these permissions", buzz);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////

    //  Static methods
    //
    //  ColorPermissions is used to create two (or perhaps someday, more than two) objects representing the animals
    //  at the shelter.  Training and experience with one species does not necessarilly translate to any others and
    //  so permissions must be specific to the species.
    //
    //  But when I originally wrote these functions, data for all animals were retrieved from the server with a
    //  single API request and I had many similar functions and code to handle the data independently.  I don't
    //  want to revisit the API at this time, nor do I want to invoke the same API to download the same data
    //  repeadtedly.  So I have static functions to download the data and save the data to static properties.
    //
    //  Which makes the data available to all instances of the class with a single use of the API.

    static getPrivledge ()
    {   return this.#hasPrivledge;
    }

    static initialize (peopleId)
    {
        this.#peopleId = peopleId;

        AJAX ("GET", "/api/people/getAnimalPermissions/" + peopleId,
        {   200: xml =>
            {
                this.#dataset = JSON.parse(xml.responseText);
                this.#hasPrivledge = this.#dataset.allow;
                additionalCat = new ColorPermissions (this.#dataset, "cat");
                additionalDog = new ColorPermissions (this.#dataset, "dog");
            }
        });
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

class AdditionalPermissions
{   //  AdditionalPermissions collects all of the functions directly associated with entering, validating and posting
    //  additional permissions to the server.  It exists for organizational purposes and clarity.  Unlike most of the other
    //  class modules, AdditionalPermissions is intended to be instantiated for different species of animals.

    //  The properties of the Class.
    //
    //  There are no associated getter functions because they are strictly used by the static methods of the Class, nothing
    //  else in the application has need of them, nor could anything else make use of them.

    #button = undefined;
    #checkbox = [];
    static #createMode = undefined;
    #hasPrivledge = undefined;
    #instanceName = undefined;
    #section = undefined;
    #species = undefined;

    constructor (section, data, species)
    {
        this.#hasPrivledge = ColorPermissions.getPrivledge();
        if (species == "cat") this.#instanceName = "additionalCat";
        if (species == "dog") this.#instanceName = "additionalDog";
        this.#section = section;
        this.#species = species;

        this.#configure (data, species)
    }

    #configure (data, species)
    {   //  Create <input> elements for the additional permissions

        if (data.additional.length == 0) return;

        //  Now that we've made sure that there is in fact data to deal with, add an HTML <div> element to the DOM as
        //  a parent container.

        const div = configureElement ("div", { });

        //  And create the <input> elements to display the permissions and allow the user to interact with them.

        configureElement ("hr", { }, div);

        configureElement ("div",
            {
                "innerText": "Additional Permissions"
            },
            div);

        let addedPermissions = false;
        
        data.additional.forEach ((add, index) =>
        {
            let added = this.#createCheckbox (div, species, add, index);
            if (added) addedPermissions = true;
        })

        if (addedPermissions)
        {   this.#createSubmitButton (div);
            this.#section.append (div);
        }
    }

    #createCheckbox (div, species, permission, index)
    {   //  Create and configure an <input> element to represent this permission.  Add it to the DOM.

        let addedPermission = false;

        if (permission[species])
        {
            addedPermission = true;

            const box = configureElement ("div", { }, div);

            const input = configureElement ("input",
                {
                    "class": "additional-permission",
                    "disabled": "disabled",
                    "name": index,
                    "restrictId": permission["restrictId"],
                    "type": "checkbox"
                },
                box);

//  This is where I set the status of the checkbox (is it preselected or not) based on the property
//  'allowed' in the data set
            if (permission["allow"])
            {
                input.setAttribute ("checked", "checked");
                input.setAttribute ("originalstate", "checked");
            }

            if (this.#hasPrivledge)
                input.removeAttribute ("disabled");

            configureElement ("label",
                {
                    "for": index,
                    "innerText": permission.restriction
                },
                box);
        }

        return addedPermission;
    }

    #createSubmitButton (div)
    {   
        if (ColorPermissions.getPrivledge())
        {   
            this.#button = configureElement ("button",
               {
                    "id": "post-additional-permissions",
                    "innerText": "Submit Changes",
                    "onclick": this.#instanceName + ".post(event);",
                    "species": this.#species
                },
                div);

            this.#button.style.display = "inline-block";
        }
    }

    post (event)
    {   event.preventDefault ();

        let postData = [];

        let changed = false;

        const target = event.target;

        this.#checkbox.forEach ((permission, index) =>
        {
            //  checked is supposed to be the state of the checkbox at the time the element was added to the DOM, and it is 
            //  not changed by clicking on the checkbox.  It would make an excellent way to check the original state of the
            //  checkbox, except (apparently) you can't access the attribute.  So I had to add a custom attribute to do the
            //  same thing.
            //
            //  To make things even less intuitive, the value of the checkbox is stored in a property of the HTML element
            //  called -- wait for it -- checked!

            const originalstate = permissions[index].getAttribute ("originalstate") == "checked" ? true : false;

            //  The checked property (not to be confused with the checked attribute) is the current state of the checkbox
            
            const currentstate = permissions[index].checked;

            if ((currentstate == originalstate) == false)
            {
                changed = true;
                let obj = { [ permissions[index].getAttribute ("restrictId") ]: currentstate };

                postData.push (obj);
            }
        })

        if (changed)
        {
            const user = getCookie ("peopleId");
            const species = target.getAttribute ("species");

            AJAX ("POST", "/api/people/updateAdditionalPermissions/" + user + "/" + species, 
            {   200: xml =>
                {   playAudio (ting);
                    alert ("Successfully updated additional permissions");
                }
            },
            postData);
        }
        else
            modal ("You didn't make any changes to these permissions", buzz);
    }
}