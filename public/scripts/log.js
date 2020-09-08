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

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  Collects the functions and variable that are used to manipulate the <div> elements that
//  represent individual animals

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

        configureElement ("div",
            {
                "class": "animal-name",
                "innerText": name
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
                "innerText": index[x].cage ? dataset[x].cage : ""
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
                            transform: value =>
                                {
                                    const colors = ["GREEN", "ORANGE", "BLUE", "PURPLE", "RED", "BLACK"];
                                    return colors.indexOf (value.toUpperCase ());
                                }
                        }
                    ])
    current.sort.name = current.sort.name == "ascending" ? "descending" : "ascending"
    status.animals = false;
    icon.setAttribute ("title",
        current.sort.name == "ascending" ? "sort list by name (reverse order)" : "sort list by name");
    showAnimals ();
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
    createMenu ();
});

function getAnimalData (group)
{
    const xml = new XMLHttpRequest();
    xml.onreadystatechange = () =>
        {
            if (xml.readyState == 4 && xml.status == 200)
                switch (xml.status)
                {   case 200:
                    {   status.data = true;
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
        }

    xml.open ("GET", "/api/animals/allactive/" + group, true);
    xml.send();
}

//  There's no need to wait for the DOM in order to request data from the server, especially since
//  it's far more likely that retrieving data from the server will take longer than rendering the DOM.

getAnimalData ("dog");