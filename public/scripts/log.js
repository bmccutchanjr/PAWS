//  A few global variables used to coordinate and store data required by multiple functions
//  throughout this page...

let dataset = ["1"];
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

    const length = dataset.length;
    for (let x=0; x<length; x++)
    {   let name = undefined;

        if (dataset[x].name == prevName)
        {   dataset[x-1].div.firstChild.innerText = dataset[x-1].name + " (" + sameName + ")";
            ++sameName;
            name = dataset[x].name + " (" + sameName + ")";
        }
        else
        {   sameName = 1;
            name = dataset[x].name;
        }

        prevName = dataset[x].name;

        let animal = configureElement ("div",
            {
                "class": "animal " + dataset[x].color,
                "animalId": dataset[x].animalId
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
                "innerText": dataset[x].color.toUpperCase ()
            },
            animal);

        configureElement ("div",
            {
                "class": "animal-cage",
                "innerText": dataset[x].cage ? dataset[x].cage : ""
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

        dataset[x].div = animal;
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

    const length = dataset.length;
    for (let x=0; x<length; x++)
    {   main.append (dataset[x].div);
    }
}

window.addEventListener ("load", (event) =>
{   //  Before data is loaded onto the page, there aren't a lot of DOM elements on it, so the page
    //  will almost certainly be rendered before data is retrieved from the server.  Nevertheless,
    //  let's use an event listener to verify we aren't trying to access or update any DOM elements
    //  before they exist...

    status.page = true;

    showAnimals ();
    createMenu ();
});

function getAnimalData (species)
{
    const xml = new XMLHttpRequest();
    xml.onreadystatechange = () =>
        {
            if (xml.readyState == 4 && xml.status == 200)
                switch (xml.status)
                {   case 200:
                    {   status.data = true;
                        dataset = JSON.parse(xml.responseText)
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

    xml.open ("GET", "/api/animals/allactive/" + species, true);
    xml.send();
}

//  There's no need to wait for the DOM in order to request data from the server, especially since
//  it's far more likely that retrieving data from the server will take longer than rendering the DOM.

getAnimalData ("dogs");