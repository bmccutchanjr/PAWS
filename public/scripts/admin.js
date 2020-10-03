////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function addMenu ()
{   //  Create the side-bar menu

    //  Menu options vary from page to page, but the empty side-bar, many options and associated functions are
    //  the same.  So call a function to create the menu and return a reference to the DOM element so we can
    //  add any page specific menu options.

    configureSidebar ( { HomePage: true, MyProfile: false, AdminFunctions: false }, () =>
        {
            let people = configureElement ("section",
                {   "id": "people-section",
                },
                menu);

            configureElement ("div",
                {   "class": "section-header",
                    "innerText": "People"
                },
                people);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "/admin/people-picker",
                    "id": "select-person",
                    "innerText": "Select a person",
                    // "onclick": "selectPerson(event);",
                    "target": "iframe"
                },
                people);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "",
                    "id": "new-person",
                    "innerText": "Add a new person",
                    "onclick": "newPerson(event);"
                },
                people);

            let animals = configureElement ("section",
                {   "id": "people-section",
                },
                menu);

            configureElement ("div",
                {   "class": "section-header",
                    "innerText": "Animals"
                },
                animals);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "id": "select-animal",
                    "innerText": "Select an animal",
                    "onclick": "selectAnimal(event);"
                },
                animals);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "id": "new-animal",
                    "innerText": "Add a new animal",
                    "onclick": "newAnimal(event);"
                },
                animals);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "id": "additional-restrictions",
                    "innerText": "Manage additional restrictions",
                    "onclick": "restrictions(event);"
                },
                animals);
        });
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  Functions to request and implement the various admin functions

function getPerson (event)
{
    event.preventDefault ();
    const person = event.target;

    const main = document.getElementById ("main");

    AJAX ("GET", "/admin/person.html", xml =>
    {
        if (xml.status == 200)
        {
            const section = configureElement ("section",
                {   "class": "people-picker",
                    "id": "main-section",
                    "innerHTML": xml.responseText
                },
                main);
        }
        else
            alert (xml.responseText);
    });

    AJAX ("GET", "/api/people/getOne/" + person.peopleId, xml =>
    {
        if (xml.status == 200)
        {
            document.getElementById ("person-div").innerText = xml.responseText;
        }
        else
            alert (xml.responseText);
    });

    main.removeChild (main.firstChild);
}

function peopleList (data)
{
    const main = document.getElementById ("main");

    const section = configureElement ("section",
        {   "class": "people-picker",
        },
        main);

    configureElement ("p",
        {   "innerText": "Select the person you want to administer.",
        },
        section);

    data.forEach (d =>
    {   configureElement ("a",
            {   "class": "menu-option",
                "href": "/admin/person.html",
                "innerText": d.surname + ", " + d.given,
                // "onclick": "getPerson (event);",
                "peopleId": d.peopleId,
                "target": "iframe"
            },
            section)
    })
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener ("load", (event) =>
{   
    const hasPeoplePrivledge = true;
    if (hasPeoplePrivledge)
        window.iframe.location = "/admin/people-picker";
    else
        window.iframe.location = "/admin/animal-picker";

    addMenu ();
});

window.addEventListener ("message", (event) =>
{   document.getElementById ("admin-frame").style.height = event.data + "px";
});
