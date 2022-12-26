//	This module collects a number of functions that are used on more than one page throughout the site.  The 
//	functions collected here are somewhat generic and do not relate to any specific functionality like
//	navigation.

window.addEventListener ("load", event =>
{
	//	remove the noscript class from <footer> and #sticky-wrapper

	document.getElementsByTagName ("footer")[0].classList.remove ("noscript");
	document.getElementById ("sticky-wrapper").classList.remove ("noscript");

	//	<main> amd <nav> are hidden so they don't display with the <noscript> tag.  Remove that class

	document.getElementsByTagName ("main")[0].classList.remove ("hidden");
	const nav = document.getElementsByTagName ("nav");
	nav[0].classList.remove ("hidden");
	nav[1].classList.remove ("hidden");

	//	Add some event handlers for the <nav> elements

// 	document.getElementById ("nav-buttons").addEventListener ("click", event =>
// 	{	profileButtonHandler (event)
// 	});
// 
// 	document.getElementById ("nav-menu").addEventListener ("click", event =>
// 	{	navMenuHandler (event)
// 	});
nav[0].addEventListener ("click", event =>
{	profileButtonHandler (event)
});

nav[1].addEventListener ("click", event =>
{	navMenuHandler (event)
});
})