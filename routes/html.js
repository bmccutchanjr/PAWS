//  html.js is the middleware used to serve static routes and their auxillary files.  It's pretty
//  much just a standard, no-frills module.  It uses Express.JS and Path.js to serve end points,
//  and Passport.js to verify authorization.
//  

//  01  There is no security in the page right now.  Need to require and configure Passport.js...

// Require the dependencies
const chalk = require("chalk");
const express = require("express");
const path = require("path");

// Configure express
const app = express();
const router = express.Router ();

app.use ("/", router);

router
.use ((request, response, next) =>
    {   // This always happens -- whenever any route is served in this module.  At the moment, all 
        // I use it for is to debug routes, but it could be something more useful.

        console.log(chalk.blue("html.js"));
        console.log(chalk.blue("requesting: ", request.url));

        next();
    })
.get("/", (request, response) =>
    {	// The default page (or 'landing page') is log.html.

        response.sendFile(path.join(__dirname, "../public/log.html"));
    })
.get("/about", (request, response) =>
    {	response.sendFile(path.join(__dirname, "../public/about.html"));
    })
.get("/cage-page", (request, response) =>
    {	response.sendFile(path.join(__dirname, "../public/cage-page.html"));
    })
.get("/log", (request, response) =>
    {	response.sendFile(path.join(__dirname, "../public/log.html"));
    })
.get("/login", (request, response) =>
    {	response.sendFile(path.join(__dirname, "../public/login.html"));
    })
.get("/profile", (request, response) =>
    {	response.sendFile(path.join(__dirname, "../public/profile.html"));
    })
.use(express.static(path.join(__dirname, "../public")))
.use((request, response) =>
    {	//  A request was made for an unknown end-point.  That's corresponds to an HTML 404 status
        //  code, so send them a 404 page!

        response.sendFile(path.join(__dirname, "../public/404.html"));
    });

module.exports = router;