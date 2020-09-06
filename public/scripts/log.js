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

function showAnimals ()
{   
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

    //  Create an HTML <DIV> element to display the each animal in the data[] array.  In addition
    //  to adding this <DIV> to the DOM, set a property in the respective element of the data[] array
    //  because I'm going to want it again if the user opts to sort the data.
     
    const length = dataset.length;
    for (let x=0; x<length; x++)
    {   let animal = configureElement ("div",
            {
                "class": "animal"
            },
            main);

        configureElement ("div",
            {
                "class": "animal-name",
                "innerText": "Geronimo"
            },
            animal);

        configureElement ("div",
            {
                "class": "animal-color",
                "innerText": "PURPLE"
            },
            animal);

        configureElement ("div",
            {
                "class": "animal-cage",
                "innerText": "100"
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

window.addEventListener ("load", (event) =>
{   //  Before data is loaded onto the page, there aren't a lot of DOM elements on it, so the page
    //  will almost certainly be rendered before data is retrieved from the server.  Nevertheless,
    //  let's use an event listener to verify we aren't trying to access or update any DOM elements
    //  before they exist...

    status.page = true;

    showAnimals ();
    createMenu ();
});

//  On the other hand, there's no need to wait for the DOM in order to request the data from the server
//  as long as we make sure not to use the results before the page is loaded and ready.

function getEnrichmentData (species)
{
//
//  And of course, there is no API call here at all...this is just a mock-up of the page so I can
//  see how much room I have to play with.
//
    status.data = true;
    showAnimals ();
}

getEnrichmentData ("dogs");