////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  Various functions that add elements to the page.

function addFooter ()
{   //  Populate the footer...

    const div = document.body.getElementsByTagName ("footer")[0];

    const inner = configureElement ("div",
        {
            "class": "inner-footer",
            "id": "inner-footer"
        },
        div);

    configureElement ("div",
        {
            "class": "left",
            "innerText": "PAWS Administration"
        },
        inner);

    configureElement ("div",
        {
            "class": "right",
            "innerHTML": "&copy All Rights Reserved"
        },
        inner);
}

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
                    "target": "iframe"
                },
                people);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "",
                    "id": "new-person",
                    "innerText": "Add a new person",
                    "onclick": "closeSidebar();newPerson(event);"
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

//  Various functions and event handlers that are specific to this page

function newPerson (event)
{   event.preventDefault ();

    const target = event.target;
    
    //  This sucks, but it's how cookies work.  I need to get the value of the index for the selected person to 
    //  person.html, but client processes cannot read cookies set by the server and vice versa.  That means this
    //  page must set a cookie for person.html to read and that means I can't simpley use a link and set the cookie
    //  on the server (which would be one line of code, if I could do it that way).
    //
    //  I need an event handler to set a cookie and reload the page...
    
    //  peopleId represents the index of a record in the People table and is used by severl fincutins in /admin/person.html
    //  to get retrieve data specific to some individual.  Since all indices are positive integers, anindex of '0' will
    //  not appear in any tables.  Those queries will function without error but return no results.
    //
    //  Seems the cleanest way to signal that it should configure to create a new user rather than modify an existing
    //  user.  And better than writing a second page just for the new user since almost everything about creating or
    //  modifying users is the same.

//
//  I should check that the current user has the "Create people" privledge first...
//
    setCookie ("peopleId", 0, 3600);

    window.iframe.location = "/admin/person/new";
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  various event handlers for the window object

document.addEventListener ("DOMContentLoaded", (event) =>
{   
    const hasPeoplePrivledge = true;
    if (hasPeoplePrivledge)
        window.iframe.location = "/admin/people-picker";
    else
        window.iframe.location = "/admin/animal-picker";

    addFooter ();
    addMenu ();
});

window.addEventListener ("message", (event) =>
{   //  Something happened in a child document loaded into the <iframe> element that may have changed the size
    //  of the content rendered in the <iframe>.  Change the height of the <iframe> to match it.

    document.getElementById ("admin-frame").style.height = event.data + "px";
});
