let pageloaded = false;

window.addEventListener ("load", (event) =>
{   //  Before data is loaded onto the page, there aren't a lot of DOM elements on it, so the page
    //  will almost certainly be rendered before data is retrieved from the server.  Nevertheless,
    //  let's use an event listener to verify we aren't trying to access or update any DOM elements
    //  before they exist...

    pageloaded = true;
    getEnrichmentData ();

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

    let main = document.getElementById ("main");
    let animal = configureElement ("div",
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

}

//  getEnrichmentData ("dogs");