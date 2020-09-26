//  This module is the middleware used to serve static routes and their auxillary files.  It's
//  pretty much just a standard, no-frills module that uses Express.JS to serve the application's
//  static end points and Passport.js for authorization.
//  

//  The required npm modules
const chalk = require("chalk");
const express = require("express");
//  02  const passport = require("./authenticate.js");
//  01  Where is this crap coming from?
const path = require("path");
//  01  const { send } = require("process");

//  02  begins
const people = require ("./database/people.js");
//  02  ends

// Configure express
const server = express();
const router = express.Router ();
server.use ("/", router);

router
.use ((request, response, next) =>
    {   // This always happens -- whenever any route is served in this module.  At the moment, all 
        // I use it for is to debug routes, but it could be something more useful.

        // console.log(chalk.blue("html.js"));
        console.log(chalk.blue("html.js says client is requesting ", request.url));
        
        next();
    })

    .get("/", (request, response) =>
    {	// The default page (or 'landing page') is log.html.

        // response.sendFile(path.join(__dirname, "../public/log.html"));
        response.redirect ("/log");
    })

    .get("/about", (request, response) =>
    {	response.sendFile(path.join(__dirname, "../public/about.html"));
    })

    .get("/admin", (request, response) =>
    {	//  Handles requests for the /admin route.  There are at least three valid responses depending on whether the
        //  user logged in and has admin privledges.

        // First of all, if the user is not logged in they can't have the /admin route        

        if (!request.user)
            return response.sendFile(path.join(__dirname, "../public/login.html"));

        //  If they are logged in, make sure they have admin privledges

        people.isAdmin (request.user.peopleId)
        .then (result =>
        {
            if (result)
                response.sendFile(path.join(__dirname, "../public/admin.html"));
            else
                response.sendFile(path.join(__dirname, "../public/404.html"));
        })
        .catch (error =>
        {
            // response.status(500)
            //         .send("Oops!  An error occured that is preventing the server from processing this request.  Contact "
            //             + "your IT support group for assistance.");
            response.sendFile(path.join(__dirname, "../public/404.html"));
        })
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

    .get("/logout", (request, response) =>
    {
console.log (chalk.blueBright("serving /logout"));
        request.logout();
console.log (chalk.blueBright(request.user ? "still logged in" : "buh-bye"));
        response.sendFile(path.join(__dirname, "../public/log.html"));
    })

    .get("/profile",  (request, response, next) =>
    {
        if (!request.user)
        {   //  This browser has not been authenticated if there is no user property in request
            response.status(401).sendFile(path.join(__dirname, "../public/login.html"));
            return;
        }
        
        response.status(200).sendFile(path.join(__dirname, "../public/profile.html"));
    })

    .use(express.static(path.join(__dirname, "../public")))

    .use((request, response) =>
    {	//  A request was made for an unknown route.  That corresponds to an HTML 404 status
        //  code, so send them a 404 page!

        response.sendFile(path.join(__dirname, "../public/404.html"));
    });

module.exports = router;