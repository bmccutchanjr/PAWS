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

	setTimeout (_ =>
	{	//	Set up a timeout to automatically hide the menu after 30 seconds.
	
		//	The menu will also be hidden if the user clicks any button in the menu before the timeout.  That would
		//	cause the menu to reappear briefly  and roll off-screen again.  That's not good.
		//
		//	So make sure the menu is actually on the screen.

		if (document.getElementById ("nav-menu").classList.contains ("nav-fade-in"))
			document.getElementById ("hide-menu").click();
	}, 30000);
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
