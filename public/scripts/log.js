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
            "innerText": "PAWS Interaction Log"
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

    configureSidebar ( { HomePage: false, MyProfile: true, AdminFunctions: true }, () =>
        {
            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "id": "cat-option",
                    "innerText": "Switch to the Cats",
                    "onclick": "switchToGroup('cat');"
                },
                menu);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "id": "dog-option",
                    "innerText": "Switch to the Dogs",
                    "onclick": "switchToGroup('dog');"
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
                    "innerText": "Sort by Total Time",
                    "onclick": "sortByTime(event)"
                },
                menu);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "innerText": "Sort by Most Recent Date",
                    "onclick": "sortByMostRecent(event)"
                },
                menu);
        });
}

function addIconDiv (header)
{
    const outer = configureElement ("div",
        {
            "class": "sort-icon-outer"
        },
        header);

    return configureElement ("div",
        {
            "class": "sort-icon-inner"
        },
        outer);
}

function addSortBar ()
{
    const header = document.getElementsByTagName ("header")[0];
    const bar = configureElement ("div",
        {
            "class": "sort-bar",
        },
        header);

    configureElement ("img",
        {
            "group": "cat",
            "id": "cat-button",
            "name": "cat-button",
            "onclick": "animalHandler(event);",
            "src": "images/kitty.svg",
            "title": "Switch to cat data"
        },
        addIconDiv (bar));

    bar.firstChild.style.width = "200px";

    configureElement ("img",
        {
            "group": "dog",
            "id": "dog-button",
            "name": "dog-button",
            "onclick": "animalHandler(event);",
            "src": "images/puppy.svg",
            "title": "Sort list by name (reverse order)"
        },
        addIconDiv (bar));

    configureElement ("img",
        {
            // "id": "color-button",
            // "name": "color-button",
            "onclick": "sortByColor(event);",
            "src": "images/color.svg",
            "title": "Sort list by color"
        },
        addIconDiv (bar));

    configureElement ("img",
        {
            // "id": "clock-button",
            // "name": "cat-button",
            "onclick": "sortByTime(event);",
            "src": "images/clock.svg",
            "title": "Sort list by accumulated length of walks"
        },
        addIconDiv (bar));

    configureElement ("img",
        {
            // "id": "calendar-button",
            // "name": "calendar-button",
            "onclick": "sortByMostRecent(event);",
            "src": "images/calendar.svg",
            "title": "Sort list by most recent date"
        },
        addIconDiv (bar));
};

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

        let foundMostRecent = false;

        for (let y=0; y<4; y++)
        {
            for (let z=0; z<7; z++)
            {
                let day = configureElement ("div",
                    {
                        "class": "interaction-day week" + y
                    },
                    animal);

                if (index[x].day[(y * 7) + z].duration != undefined) 
                {   
                    if (y == 0)
                    {   //  Accumulate total duration of interactions during the first seven days of the data set
                        index[x].totalMinutes += index[x].day[(y * 7) + z].duration;
                    }

                    if (!foundMostRecent)
                    {   //  If this is the most recent date of any interaction with this animal, set the index[] property
                        //  mostRecent to the calculated index of the day.

                        index[x].mostRecent = (y * 7) + z;

                        //  and don't assign a value to it again for this animal

                        foundMostRecent = true;
                    }

                    configureElement ("div",
                        {
                            "animalId": index[x].animalId,
                            "class": "interaction-mark",
                            "day": index[x].day[(y * 7) + z].day,
                            "month": index[x].day[(y * 7) + z].month,
                            "onclick": "getInteractionData (event)",
                            "title": index[x].day[(y * 7) + z].year + "-"
                                   + index[x].day[(y * 7) + z].month + "-" +
                                   + index[x].day[(y * 7) + z].day,
                            "year": index[x].day[(y * 7) + z].year

                        },
                        day);
                }
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

function switchToGroup (group)
{   //  Request data for the specified goup of animals
    //  Format and display the data retrieved
    //  Change titles on screen icons to indicate the group of animals now displayed
    //  hide / display sidebar menu options as appropriate

    //  Request data from the server

    getAnimalData (group);

    //  That's an asynchronous operation and is almost certainly going to take longer than the next two statements,
    //  so this is probably good here.

    //  Clear the dataset and set flag value to allow buildAnimals() to function

    dataset = [];
    status.animals = false;
    current.group = group;

    if (group == "cat")
    {
        document.getElementById ("cat-button").setAttribute("title", "Sort list by name");
        document.getElementById ("cat-option").style.display = "none";

        document.getElementById ("dog-button").setAttribute("title", "Switch to dog data");
        document.getElementById ("dog-option").style.display = "inline-block";
    }
    else
    {
        document.getElementById ("cat-button").setAttribute("title", "Switch to cat data");
        document.getElementById ("cat-option").style.display = "inline-block";

        document.getElementById ("dog-button").setAttribute("title", "Sort list by name");
        document.getElementById ("dog-option").style.display = "none";
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
        switchToGroup (group);
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

function formatInteraction (data)
{   //  Format the interaction data for display on the screen.  Return HTML code to be be rendered in a message
    //  modal.

    let html = "<h1>" + data[0]["name"]+ "</h1>";
    html += "<h2>Daily Interaction Details: " + data[0]["year(start)"] + "-" + data[0]["month(start)"] + "-" + data[0]["day(start)"] + "</h2>";

    data.forEach (d =>
    {
        let time = d["hour(start)"].toString().padStart(2, "0") + ":" + d["minute(start)"].toString().padStart (2, "0");
        html += time;
        html += "&nbsp;&nbsp;";
        html += d["duration"].toString().padStart(2, "0") + " minutes";
        html += "&nbsp;&nbsp;";
        html += d["given"] + " " + d["surname"];
        html += "<br>";
    });

    return html;
}

function getInteractionData (event)
{   event.preventDefault();

    const target = event.target;
    const animal = target.getAttribute ("animalId");
    const day = target.getAttribute ("day");
    const month = target.getAttribute ("month");
    const year = target.getAttribute ("year");

    AJAX ("GET", "/api/animals/getInteraction/" + animal + "/" + year + "/" +  month + "/" + day, xml =>
        {
            switch (xml.status)
            {
                case 200:
                {
                    let div = configureElement ("div",
                        {
                            "class": "modal"
                        },
                        document.body);

                    const modal = configureElement ("div",
                        {
                            "class": "modal-message"
                        },
                        div);

                    configureElement ("div",
                        {
                            "class": "modal-text",
                            "innerHTML": formatInteraction (JSON.parse(xml.responseText))
                        },
                        modal);

                    div = configureElement ("div",
                        {
                            "class": "modal-options"
                        },
                        modal);

                    configureElement ("a",
                        {
                            "class": "modal-option",
                            "href": "#",
                            "innerText": "CLOSE",
                            "onclick": "removeModal (event)"
                        },
                        div);
                    break;
                }
                default:
                {
                    alert (xml.responseText);
                    break;
                }
            }
        });
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
        current.sort.color == "ascending" ? "Sort list by color (reverse order)" : "Sort list by color");
    showAnimals ();
}

function sortByMostRecent (event)
{   event.preventDefault ();
    const icon = event.target;

    index = sort (index,
                    [   {   property: "mostRecent",
                            ascend: current.sort.date == "ascending" ? false : true,
                            casesensitive: true
                        },
                        {   property: "name",
                            ascend: current.sort.date == "ascending" ? false : true
                        },
                        {   property: "color",
                            ascend: current.sort.date == "ascending" ? false : true,
                            casesensitive: true,
                            transform: value =>
                                {
                                    const colors = ["GREEN", "ORANGE", "BLUE", "PURPLE", "RED", "BLACK"];
                                    return colors.indexOf (value.toUpperCase ().toString ());
                                }
                        }
                    ])
    current.sort.date = current.sort.date == "ascending" ? "descending" : "ascending"
    status.animals = false;
    icon.setAttribute ("title",
        current.sort.date == "ascending" ? "Sort list by most recent date (reverse order)" : "Sort list by most recent date");
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
    icon.setAttribute ("title",
        current.sort.name == "ascending" ? "Sort list by name (reverse order)" : "Sort list by name");
    showAnimals ();
}

function sortByTime (event)
{   event.preventDefault ();
    const icon = event.target;

    index = sort (index,
                    [   {   property: "totalMinutes",
                            ascend: current.sort.time == "ascending" ? false : true,
                            casesensitive: true
                        },
                        {   property: "name",
                            ascend: current.sort.time == "ascending" ? false : true
                        },
                        {   property: "color",
                            ascend: current.sort.time == "ascending" ? false : true,
                            casesensitive: true,
                            transform: value =>
                                {
                                    const colors = ["GREEN", "ORANGE", "BLUE", "PURPLE", "RED", "BLACK"];
                                    return colors.indexOf (value.toUpperCase ().toString ());
                                }
                        }
                    ])
    current.sort.time = current.sort.time == "ascending" ? "descending" : "ascending"
    status.animals = false;
    icon.setAttribute ("title",
        current.sort.time == "ascending" ? "Sort list by accumulated length of walks (reverse order)" : "Sort list by accumulated length of walks");
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
    addFooter ();
    addMenu ();
    addSortBar ();
});

function getAnimalData (group)
{
    AJAX ("GET", "/api/animals/allactive/" + group, xml =>
        {
            switch (xml.status)
            {   case 200:
                {
                    status.data = true;
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
}

//  There's no need to wait for the DOM in order to request data from the server, especially since
//  it's far more likely that retrieving data from the server will take longer than rendering the DOM.

getAnimalData ("dog");