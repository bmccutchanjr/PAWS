////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  Various functions that add elements to the page.

function addMenu ()
{   //  Create the side-bar menu

    //  Menu options vary from page to page, but the empty side-bar and associated functions are
    //  the same.  So call a function to create the menu and return a reference to the DOM element
    //  so we can put the appropriate menu option in it.

    configureSidebar ( { MyProfile: true, AdminFunctions: true }, () =>
        {
            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "innerText": "Start Walking"
                },
                menu);

            configureElement ("hr",
                {   "class": "menu-separator",
                },
                menu);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "innerText": "View Comments",
                },
                menu);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "innerText": "Add Comments",
                },
                menu);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "innerText": "Add Public Comments",
                },
                menu);

            configureElement ("a",
                {   "class": "menu-option",
                    "href": "#",
                    "innerText": "Color-Test Notes"
                },
                menu);
            });
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  01  function closeModal (event)
//  01  {
//  01      event.preventDefault ();
//  01  
//  01      const modal = document.getElementById ("modal");
//  01      modal.remove (modal);
//  01  }

//  02  function createModal (message)
//  02  {   //  Create a modal message and add it to the DOM
//  02  
//  02      const modal = configureElement ("div",
//  02          {   "class": "modal",
//  02              "id": "modal"
//  02          },
//  02          document.body);
//  02  
//  02      const msg = configureElement ("div",
//  02          {   "class": "modal-message",
//  02          },
//  02          modal);
//  02  
//  02      configureElement ("div",
//  02          {
//  02              "class": "modal-text",
//  02              "innerText": message
//  02          },
//  02          msg);
//  02  
//  02      const div = configureElement ("div",
//  02          {   "class": "modal-options",
//  02          },
//  02          msg);
//  02  
//  02      configureElement ("a",
//  02          {   "class": "modal-option",
//  02              "href": "#",
//  02              "innerText": "CLOSE",
//  02              "onclick": "closeModal(event)"
//  02          },
//  02          div)
//  02  }

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

let dataset = [];

function animalImage (source)
{   //  Sets the background image of the page to a picture of the animal as indicated by the data set returned by
    //  the server.

    const body = document.body;
    body.style.backgroundImage = "url(" + source + ")";

    //  These properties of the background image are constant and wouldn't need to be set here, except that setting
    //  the source URL overrides all other background image properties set in CSS.  As this is the behavior I want, I
    //  have to set these properties here.

    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundPosition = "center";
    body.style.backgroundSize = "contain"
}

function buildPage ()
{
    document.body.style.background = dataset[0].color;
    animalImage (dataset[0].image)

    if (dataset[0].restriction != null)
    { 
        const modal = configureElement ("div",
            {   "class": "restriction-wrapper"
            },
            document.body);
        
        const div = configureElement ("div",
            {   "class": "restriction-text"
            },
            modal);

        dataset.forEach (d =>
        {
            if (d.restriction != null)
                configureElement ("div",
                    {   "class": "restriction",
                        "innerText": d.restriction
                    },
                    div)
        })
    }

    document.getElementById ("footer-name").innerText = dataset[0].name;    
    document.getElementById ("footer-color").innerText = "(" + dataset[0].color + ")";    
}

function getAnimalData (animalId)
{   //  Retrieve data from server for the selected animal

    AJAX ("GET", "/api/animals/get/" + animalId, xml =>
    {
        if (xml.status == 200)
        {
            dataset = JSON.parse(xml.responseText);
console.log (JSON.stringify (dataset, null, 2))
            buildPage();
        }
        else
        {
//  02              createModal ("PAWS was unable to complete this action.  An unspecified "
//  02                          + "internal error occured on the server.  Please contact your "
//  02                          + "IT support for assistance.");
//  02  begins
            modal ("PAWS was unable to complete this action.  An unspecified "
                 + "internal error occured on the server.  Please contact your "
                 + "IT support for assistance.");
//  02  ends
        }
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener ("DOMContentLoaded", event =>
{   //  When the page is fully rendered in the DOM...

    addMenu ();
})

getAnimalData (getCookie ("animalId"));
