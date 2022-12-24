function profileButtonHandler (event)
{	event.preventDefault();
	//	The event handler for the profile buttons...

	switch (event.target.getAttribute ("id"))
	{
		case "show-menu":
			{
				// document.getElementById ("show-menu").classList.add ("hidden");
				// document.getElementById ("hide-menu").classList.remove ("hidden");
				document.getElementById ("nav-menu").classList.remove ("nav-fade-out");
				document.getElementById ("nav-menu").classList.add ("nav-fade-in");
				break;
			}

		default:
			{
				alert ("That button is not yet enabled...");
			}
	}

}

function navMenuHandler (event)
{	event.preventDefault();
	//	The event handler for the profile buttons...

	switch (event.target.getAttribute ("id"))
	{
		case "hide-menu":
			{
				// document.getElementById ("show-menu").classList.add ("hidden");
				// document.getElementById ("hide-menu").classList.remove ("hidden");
				document.getElementById ("nav-menu").classList.remove ("nav-fade-in");
				document.getElementById ("nav-menu").classList.add ("nav-fade-out");
				break;
			}

		default:
			{
				alert ("That button is not yet enabled...");
			}
	}

}
