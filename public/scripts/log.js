////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  These functions create, populate and implement the menu.

function addMenu ()
{   //  Create the side-bar menu

    //  Menu options vary from page to page, but the empty side-bar, many options and associated functions are
    //  the same.  So call a function to create the menu and return a reference to the DOM element so we can
    //  add any page specific menu options.

    configureSidebar ( { MyProfile: true, AdminFunctions: true }, () =>
        {
            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "innerText": "Switch to the Cats"
                },
                menu);

            configureElement ("hr",
                {   "class": "menu-separator",
                },
                menu);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "innerText": "Sort by Names",
                    "onclick": "sortByName(event)"
                },
                menu);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "innerText": "Sort by Color",
                    "onclick": "sortByColor(event)"
                },
                menu);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "innerText": "Sort by Total Time"
                },
                menu);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "innerText": "Sort by Most Recent Date"
                },
                menu);
        });
}


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  Collects the functions and variable that are used to manipulate the <div> elements that
//  represent individual animals

//  A few global variables used to coordinate and store data required by multiple functions
//  throughout this page...

let dataset = [];
let index = [];
let status =
{
    animals: undefined,
    data: undefined,
    menu: undefined, 
    page: undefined
}

function buildAnimals ()
{   //  Create an HTML <DIV> element to display the each animal in the dataset[] array -- but DON'T
    //  ADD IT TO THE DOM.  Instead, set a property in the respective element of the dataset[]
    //  array.  I only need to build the <DIV> once when data is retrieved from the server, but I'm
    //  going to want it every time the user opts to sort the data.
    //
    //  The content of the <DIV> doesn't change, why rebuild it over and over again?

    let sameName = 1;
    let prevName = undefined;

    const length = index.length;
    for (let x=0; x<length; x++)
    {   let name = undefined;

        if (index[x].name == prevName)
        {   dataset[x-1].firstChild.innerText = index[x-1].name + " (" + sameName + ")";
            ++sameName;
            name = index[x].name + " (" + sameName + ")";
        }
        else
        {   sameName = 1;
            name = index[x].name;
        }

        prevName = index[x].name;

        let animal = configureElement ("div",
            {
                "class": "animal " + index[x].color,
                "animalId": index[x].animalId
            });

        configureElement ("a",
            {
                "animalId": index[x].animalId,
                "class": "animal-name",
                "href": "#",
                "innerText": name,
                "onclick": "cagePage(event)"
            },
            animal);

        configureElement ("div",
            {
                "class": "animal-color",
                "innerText": index[x].color.toUpperCase ()
            },
            animal);

        configureElement ("div",
            {
                "class": "animal-cage",
                "innerText": index[x].cage_num ? index[x].cage_num : ""
            },
            animal);

        for (let x=0; x<4; x++)
        {
            for (let y=0; y<7; y++)
            {
                let day = configureElement ("div",
                    {
                        "class": "interaction-day week" + x
                    },
                    animal);

                let mark = configureElement ("div",
                    {
                        "class": "interaction-mark"
                    },
                    day);
            }
        }

        index[x].index = x;
        dataset.push (animal);
    }
}

function clearAnimals (main)
{   //  Remove all childNodes of the DOM element <MAIN>

    while (main.firstChild)
    {   main.removeChild (main.firstChild);
    }
}

function showAnimals ()
{   //  Data has been retrieved from the server, or has been sorted.  It needs to get on the screen.

    //  Do nothing if:
    //  1)  The animal data was previously rendered
    //  2)  The animal data has not downloaded from the server
    //  3)  The page is not yet rendered.

    if (status.animals) return;
    if (!status.data) return;
    if (!status.page) return;

    //  We don't want more than one process initiating more than one attempt to render the
    //  data to the DOM, so indicate the data is rendered to the DOM...since we're about to do that.

    status.animals = true;

    let main = document.getElementById ("main");
    clearAnimals (main);

    const length = index.length;
    for (let x=0; x<length; x++)
    {   main.append (dataset[index[x].index]);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  These are the various event handlers for the icons that appear on the page and are primarilly
//  used to sort the animals displayed on the page

const current =
    {   "group": "dog",
        "sort":
        {   "name": "ascending",
            "color": undefined,
            "time": undefined,
            "date": undefined
        }
    }

function animalHandler (event)
{   //  The two animalicons that appear on the page represent different actions depending on context
    //
    //  1)  There are two species in the database, and only one is retrieved and displayed at a time.
    //      It is either cats or dogs, never both.  If the animal clicked represents the species not
    //      currently on the page, retrieve data from the server and put it on the screen.
    //  2)  If the current data set matches the species represented by the icon, the current dataset
    //      is to be sorted by name.  In ascending or descending order depending on the current sort
    //      order.
    //
    //  The labels on the icons must be changes to match the current context.

    event.preventDefault();

    const icon = event.target;
    const group = icon.getAttribute ("group");

    if (group != current.group)
    {
        //  retrieve data
        //  buildAnimals();
        //  showAnimals();
        //  icon.setAttribute ("title")
        return;
    }

    index = sort (index,
                    [   {   property: "name",
                            ascend: current.sort.name == "ascending" ? false : true
                        },
                        {   property: "color",
                            ascend: current.sort.name == "ascending" ? false : true,
                            casesensitive: true,
                            transform: value =>
                                {
                                    const colors = ["GREEN", "ORANGE", "BLUE", "PURPLE", "RED", "BLACK"];
                                    return colors.indexOf (value.toUpperCase ()).toString ();
                                }
                        }
                    ])
    current.sort.name = current.sort.name == "ascending" ? "descending" : "ascending"
    status.animals = false;
    icon.setAttribute ("title",
        current.sort.name == "ascending" ? "sort list by name (reverse order)" : "sort list by name");
    showAnimals ();
}

function sortByColor (event)
{   event.preventDefault ();
    const icon = event.target;

    index = sort (index,
                    [   {   property: "color",
                            ascend: current.sort.color == "ascending" ? false : true,
                            casesensitive: true,
                            transform: value =>
                                {
                                    const colors = ["GREEN", "ORANGE", "BLUE", "PURPLE", "RED", "BLACK"];
                                    return colors.indexOf (value.toUpperCase ().toString ());
                                }
                        },
                        {   property: "name",
                            ascend: current.sort.color == "ascending" ? false : true
                        }
                    ])
    current.sort.color = current.sort.color == "ascending" ? "descending" : "ascending"
    status.animals = false;
    icon.setAttribute ("title",
        current.sort.color == "ascending" ? "sort list by color (reverse order)" : "sort list by color");
    showAnimals ();
}

function sortByName (event)
{   event.preventDefault ();
    const icon = event.target;

    index = sort (index,
                    [   {   property: "name",
                            ascend: current.sort.name == "ascending" ? false : true
                        },
                        {   property: "color",
                            ascend: current.sort.name == "ascending" ? false : true,
                            casesensitive: true,
                            transform: value =>
                                {
                                    const colors = ["GREEN", "ORANGE", "BLUE", "PURPLE", "RED", "BLACK"];
                                    return colors.indexOf (value.toUpperCase ().toString ());
                                }
                        }
                    ])
    current.sort.name = current.sort.name == "ascending" ? "descending" : "ascending"
    status.animals = false;
    showAnimals ();
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function cagePage (event)
{   //  This is the event handler for the animal names displayed on screen.

    //  I tried to do this in a restful manner and simply tack animalId to the URL.
    //
    //          href="/cage-page/01"
    //
    //  But the browser treats that as a folder (that's what the URL actually represents on a
    //  traditional web server) and all further requests for resources (css, scripts, images, etc) are
    //  relative to what the browser thinks is a folder, but isn't actually.
    //
    //          cage-page/css/cage-page.css
    //          cage-page/scripts/cage-page.js
    //
    //  And of course those files don't exist when the Node/Express server tries to serve them.  None
    //  of the links could be coded with relative paths.  All of the links on the page would have to be
    //  fully qualified.  And I don't want that.
    //
    //  IS THIS WHAT EXPRESS STATIC DOES???
    //
    //  The only alternative seems to be to set a cookie to identify the desired animal.  And
    //  since there could be dozens of animals on the page, I need to set the cookie when the
    //  link is clicked, and that means an event handler.
    //
    //  I'm learning that more and more of what Trilogy supposedly taught us just doesn't work.
    
    event.preventDefault ();

    const link = event.target;
    
    const animalId = link.getAttribute ("animalId");
    document.cookie = "animalId=" + animalId;

    window.location.assign ("/cage-page");

    //  A note about window.location.assign().
    //
    //  window.location.href is a read/write string property whose value is the URL of the current
    //  page.  Changing location.href will cause the browser to load the page at the newly selected
    //  URL.
    //
    //  window.location.assign() and window.location.redirect() are methods used to replace the URL
    //  and, again, cause the browser to load the page at the new URL.
    //
    //  The difference is that assigning a value to location.href or using the method .redirect() are
    //  not supposed to modify the history object.  But .assign() does.  Supposedly that means the
    //  browser's back button will work as expected when using .assign().
    //
    //  Imagine a user follows a link from page1 to page2 and then page2 redirects to page3.
    //  If page3 is loaded with .redirect() or loaction.href using the browser's back function will
    //  return to page1, because page2 is not in the history.  But if .assign() is used to redirect
    //  the page, using the browser's back function will return to page2.
    //
    //  Except it doesn't work that way.  Both Chrome and Firefox treat all three methodologies
    //  the same, with Chrome ignoring page2 in all three cases and Firefox returning to page2 in
    //  all three cases.
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener ("load", (event) =>
{   //  Before data is loaded onto the page, there aren't a lot of DOM elements on it, so the page
    //  will almost certainly be rendered before data is retrieved from the server.  Nevertheless,
    //  let's use an event listener to verify we aren't trying to access or update any DOM elements
    //  before they exist...

    status.page = true;

    showAnimals ();
    addMenu ();
});

function getAnimalData (group)
{
//  01      const xml = new XMLHttpRequest();
//  01      xml.onreadystatechange = () =>
//  01          {
//  01              if (xml.readyState == 4 && xml.status == 200)
//  01                  switch (xml.status)
//  01                  {   case 200:
//  01                      {   status.data = true;
//  01                          index = JSON.parse(xml.responseText)
//  01                          buildAnimals ();
//  01                          showAnimals ();
//  01                          break;
//  01                      }
//  01                      default:
//  01                      {   alert (xml.responseText);
//  01                          break;
//  01                      }
//  01                  }
//  01          }
//  01  
//  01      xml.open ("GET", "/api/animals/allactive/" + group, true);
//  01      xml.send();
//  01  refectors API requests
//  01  begins
    AJAX ("GET", "/api/animals/allactive/" + group, xml =>
        {
            switch (xml.status)
            {   case 200:
                {   status.data = true;
console.log(xml.responseText);
                    index = JSON.parse(xml.responseText)
                    buildAnimals ();
                    showAnimals ();
                    break;
                }
                default:
                {   alert (xml.responseText);
                    break;
                }
            }
        })
//  01  ends
}

//  There's no need to wait for the DOM in order to request data from the server, especially since
//  it's far more likely that retrieving data from the server will take longer than rendering the DOM.

getAnimalData ("dog");