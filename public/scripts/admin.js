////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  02  begins
//  The sidebar menu and event handlers that are specific to this page

function getPerson (event)
{   event.preventDefault ();

    const target = event.target;
    
    //  This sucks, but it's how cookies work.  I need to get the value of the index for the selected person to 
    //  person.html, but client processes cannot read cookies set by the server and vice versa.  That means this
    //  page must set a cookie for person.html to read and that means I can't simpley use a link and set the cookie
    //  on the server (which would be one line of code, if I could do it that way).
    //
    //  I need an event handler to set a cookie and reload the page...
    
    const peopleId = "new";
    document.cookie = "peopleId=" + peopleId;

    window.location.href = "/admin/person/" + peopleId;
}
//  02  ends

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

//  01  This is no longer relevent.  All of the admin functions are now implemented as child pages loaded in an
//  01  <iframe> and not directly as part of this page.
//  01
//  01  //  Functions to request and implement the various admin functions
//  01  
//  01  function getPerson (event)
//  01  {
//  01      event.preventDefault ();
//  01      const person = event.target;
//  01  
//  01      const main = document.getElementById ("main");
//  01  
//  01      AJAX ("GET", "/admin/person.html", xml =>
//  01      {
//  01          if (xml.status == 200)
//  01          {
//  01              const section = configureElement ("section",
//  01                  {   "class": "people-picker",
//  01                      "id": "main-section",
//  01                      "innerHTML": xml.responseText
//  01                  },
//  01                  main);
//  01          }
//  01          else
//  01              alert (xml.responseText);
//  01      });
//  01  
//  01      AJAX ("GET", "/api/people/getOne/" + person.peopleId, xml =>
//  01      {
//  01          if (xml.status == 200)
//  01          {
//  01              document.getElementById ("person-div").innerText = xml.responseText;
//  01          }
//  01          else
//  01              alert (xml.responseText);
//  01      });
//  01  
//  01      main.removeChild (main.firstChild);
//  01  }
//  01  
//  01  function peopleList (data)
//  01  {
//  01      const main = document.getElementById ("main");
//  01  
//  01      const section = configureElement ("section",
//  01          {   "class": "people-picker",
//  01          },
//  01          main);
//  01  
//  01      configureElement ("p",
//  01          {   "innerText": "Select the person you want to administer.",
//  01          },
//  01          section);
//  01  
//  01      data.forEach (d =>
//  01      {   configureElement ("a",
//  01              {   "class": "menu-option",
//  01                  "href": "/admin/person.html",
//  01                  "innerText": d.surname + ", " + d.given,
//  01                  // "onclick": "getPerson (event);",
//  01                  "peopleId": d.peopleId,
//  01                  "target": "iframe"
//  01              },
//  01              section)
//  01      })
//  01  }

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  various event handlers for the window object

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
{   //  Something happened in a child document loaded into the <iframe> element that may have changed the size
    //  of the content rendered in the <iframe>.  Change the height of the <iframe> to match it.
    
    document.getElementById ("admin-frame").style.height = event.data + "px";
});
