//  This module is the middleware used to serve static routes and their auxillary files.  It's
//  pretty much just a standard, no-frills module that uses Express.JS to serve the application's
//  static end points and Passport.js for authorization.
//  

//  The required npm modules
const chalk = require("chalk");
const express = require("express");
const passport = require("./authenticate.js");
const path = require("path");
const { send } = require("process");

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
    {	
        if (request.user)
        {
            response.sendFile(path.join(__dirname, "../public/admin.html"));
            next ();
        }

        response.sendFile(path.join(__dirname, "../public/login.html"));
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
.get("/profile",  (request, response, next) =>
    {
        passport.authenticate ("local", (error, user, info) =>
        {
            if (error)
            {   console.log (error);
                response.status(500).send(error);
            }
            else
                if (!user)
                    response.sendFile(path.join(__dirname, "../public/login.html"));
                else
                    response.sendFile(path.join(__dirname, "../public/profile.html"));
        })(request, response, next)
    })
.use(express.static(path.join(__dirname, "../public")))
.use((request, response) =>
    {	//  A request was made for an unknown end-point.  That's corresponds to an HTML 404 status
        //  code, so send them a 404 page!

        response.sendFile(path.join(__dirname, "../public/404.html"));
    });

module.exports = router;