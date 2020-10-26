//  This module is the middleware used to serve static routes and their auxillary files.  It's
//  pretty much just a standard, no-frills module that uses Express.JS to serve the application's
//  static end points and Passport.js for authorization.
//  

//  The required npm modules
const chalk = require("chalk");
const express = require("express");
const path = require("path");

const people = require ("./database/people.js");

// Configure express
const server = express();
const router = express.Router ();
//  server.use (express.static(path.join(__dirname, "../public")));
server.use ("/", router);

router
.use ((request, response, next) =>
    {   // This always happens -- whenever any route is served in this module.  At the moment, all 
        // I use it for is to debug routes, but it could be something more useful.

        // console.log(chalk.blue("html.js"));
//  if (request.user);
//      console.log ("peopleId: " + request.user.peopleId);

        console.log(chalk.blue("html.js says client is requesting ", request.url));
        
        next();
    })

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    //  The following routes are for the various Admin functions.  There are several routes that are implemented
    //  as individual pages displayed in an <iframe> element in admin.html

    .get("/admin.html", (request, response) =>
    {	//  To fully secure the route and still allow me to use /admin (as opposed to /admin.html) in my web page,
        //  I need a route to both.  They are two names for the same route so I don't need two handlers, just redirect...

        response.redirect ("/admin");
    })

    .get("/admin", (request, response) =>
    {	//  The handler serves the route /admin, which is a parent page implementing the sidebar menu used by all
        //  of it's child routes.  These child pages provide the actual admin functionality and are deployed in an
        //  <iframe> element on admin.html

        //  There are at least three valid responses depending on whether the user logged in and has admin privledges.

        // First of all, if the user is not logged in they can't have the /admin route        

        if (!request.user)
            return response.sendFile(path.join(__dirname, "../public/login.html"));

        //  If they're logged in, make sure they have admin privledges

        people.isAdmin (request.user.peopleId)
        .then (result =>
        {
            if (result)
                response.sendFile(path.join(__dirname, "../public/admin.html"));
            else
                response.sendFile(path.join(__dirname, "../public/404.html"));
        })
        .catch (error =>
        {   response.sendFile(path.join(__dirname, "../public/404.html"));
        })
    })

    .get("/admin/people-picker", (request, response) =>
    {
        // First of all, if the user isn't logged in they can't have this route        

        if (!request.user)
            return response.status(401).send("This function requires that you are logged into an account with administration privledges.");

        //  If they're logged in, make sure they have privledges to administrate people

        people.hasPeoplePrivledges (request.user.peopleId)
        .then (result =>
        {   if (result)
                response.status(200).sendFile(path.join(__dirname, "../public/admin/peoplepicker.html"));
            else
                response.status(404).sendFile(path.join(__dirname, "../public/404.html"));
        })
        .catch (error =>
        {   response.status(500).send("Oops!  An error occured that is preventing the server from processing this request.  Contact "
                                    + "your IT support group for assistance.");
        })
    })

    .get("/admin/person/:peopleId", (request, response) =>
    {
        // First of all, if the user isn't logged in they can't have this route        

        if (!request.user)
            return response.status(401).sendFile(path.join(__dirname, "../public/login.html"));

        //  If they're logged in, make sure they have privledges to administrate people

        const admin = request.user.peopleId;
        const user = request.params.peopleId;

        people.hasPeoplePrivledges (admin)
        .then (result =>
        {   if (result)
                response.status(200).sendFile(path.join(__dirname, "../public/admin/person.html"));
            else
                response.status(404).sendFile(path.join(__dirname, "../public/404.html"));
        })
        .catch (error =>
        {   console.log (error);
            response.status(500).send("Oops!  An error occured that is preventing the server from processing this request.  Contact "
                                    + "your IT support group for assistance.");
        })
    })

    .get("/admin/person/script/:script", (request, response) =>
    {   //  Honest to God, I thought the Express framework was supposed to MAKE THINGS EASIER!.

                response.status(200).sendFile(path.join(__dirname, "../public/admin/script/" + request.params.script));
    })

    .get("/admin/:folder/:route", (request, response) =>
    {   //  The various /admin "sub routes" still need the same CSS, script and image files used by the rest of
        //  the application.  express.static () won't find them because it's looking for a folder /admin in the
        //  file system.

//  More and more I find that ExpressJS simply will not let me do what I want...These routes are for specific files
//  that are directled to the wrong location because of the way ExpressJS interacts with the browser.  Actually, not
//  an ExpressJS issue.  I told the browser it's getting files from the /admin folder so it thinks that everything
//  is in that folder...I don't want to have to hard code the path for every link!

        if (request.params.route == "buzz.mp3")
            return response.status(200).sendFile(path.join(__dirname, "../public/audio/buzz.mp3"));

        if (request.params.route == "ting.mp3")
            return response.status(200).sendFile(path.join(__dirname, "../public/audio/ting.mp3"));

        response.redirect ("/" + request.params.folder + "/" + request.params.route);
    })

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    //  The following methods serve routes other than the Admin functions

    .get("/", (request, response) =>
    {	// The default page (or 'landing page') is log.html.

        // response.sendFile(path.join(__dirname, "../public/log.html"));
        response.redirect ("/log");
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

    .get("/logout", (request, response) =>
    {
        request.logout();
//  01          response.sendFile(path.join(__dirname, "../public/log.html"));
        response.redirect("/");
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