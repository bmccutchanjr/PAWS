//  This module is used to serve the API end-points.

//  Require npm modules

const chalk = require("chalk");
const express = require("express");
const passport = require("./authenticate.js");

//  Require custom middleware

const animals = require("./database/animals.js");
const people = require("./database/people.js");

//  Configure express

const server = express();

const router = express.Router ();
server.use ("/api", router);

router
.use ((request, response, next) =>
    {   // This always happens -- whenever any route is served in this module.  At the moment, all 
        // I use it for is to debug routes, but it could be something more useful.

        console.log(chalk.yellow("api.js says client is requesting: ", request.url));
        // console.log(chalk.yellow(JSON.stringify(request.body, null, 2)));

        next();
	})

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    //  The following end-points relate to the animals in the shelter

	.get("/animals/allactive/:group", (request, response) =>
	{	// Get all of the animals currently in the shelter for the specified animal type.  This is
        // displayed on the browser as the Enrichment Log.

		animals.getAllActive (request.params.group, (status, data) =>
        {   // serve data returned from animals.getAll()

            if (status != 200)
                response.status(status).send(data);
            else
                response.status(200).json(data);
        })
    })

	.get("/animals/get/:animalId", (request, response) =>
	{	// Get all of the animals currently in the shelter for the specified animal type.  This is
        // displayed on the browser as the Enrichment Log.

		animals.getAnimal (request.params.animalId, (status, data) =>
        {   // serve data returned from animals.getAll()

            if (status != 200)
                response.status(status).send(data);
            else
                response.status(200).json(data);
        })
    })

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    //  The following end-points relate to the people using the application

    .get("/people/isAdmin", (request, response, next) =>
    {   //  Return a boolean value indicating whether the authenticated user has admin privledges.

        if (!request.user)
            return response.status(200).send(false);
        else
        {
            people.isAdmin (request.user.peopleId)
            .then (result =>
            {
                response.status(200).send(result);
            })
            .catch (error =>
            {
                response.status(500)
                        .send("Oops!  An error occured that is preventing the server from processing this request.  Contact "
                            + "your IT support group for assistance.");
            })
        }
    })

    .get("/people/isAuthenticated", (request, response, next) =>
    {
        if (!request.user)
            return response.status(200).send(false);
        else
            return response.status(200).send(true);
    })

    .post("/people/login", (request, response, next) =>
    {
        const responseText = "Oops!  There is error on this page that prevents the server from processing your attempt to "
                           + "authenticate with PAWS.  Contact your IT support for assistance.";

        //  So first things first...verify the client actually sent us data

        if (Object.entries(request.body).length != 2)
        {   console.log (chalk.redBright("PAWS AUTHORIZATION ERROR 101: The server has received invalid authorization credentials"));
            response.status(400).send(responseText);
            return;
        }

        //  And verify the data sent are valid login credentials

        if (!request.body.email)
        {   console.log (chalk.redBright("PAWS AUTHORIZATION ERROR 102: The server has received invalid authorization credentials"));
            response.status(400).send(responseText);
            return;
        }

        if (!request.body.password)
        {   console.log (chalk.redBright("PAWS AUTHORIZATION ERROR 104: The server has received invalid authorization credentials"));
            response.status(400).send(responseText);
            return;
        }

        //  So far so good...let's verify authentication

        passport.authenticate ("local", (error, user, info) =>
        {
            if (error)
            {
                console.log (chalk.redBright("PAWS AUTHORIZATION ERROR 105")); 
                console.log (chalk.redBright(error));
                response.status(500)
                        .send("Oh No!!  An unspecified error occured on the server preventing you from logging into PAWS "
                            + "at this time.  Please contact your IT support for assistance.");
                return;
            }

            if (!user)
            {
                return response.status(401)
                               .send("Unable to authenticate with PAWS server.  "
                                   + "Please verify your email address and password are correct.");
            }

            request.login (user, (error) =>
            {
                if (error)
                {   
                    console.log (chalk.redBright("PAWS AUTHORIZATION ERROR 111")); 
                    console.log (chalk.redBright(error));
                    return response.status(500)
                            .send("Oh No!!  An unspecified error occured on the server preventing you from logging into PAWS "
                                + "at this time.  Please contact your IT support for assistance.");
                }

                return response.status(205).send("supercalifragilistic");
            });
        })(request, response, next);
    })

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    //  Miscellaneous end-points

    .use((request, response) =>
    {   //  Default API end-point to handle bad requests...all this does is send a 404 status with custom
        //  message.

        console.log (chalk.redBright("PAWS ERROR 404"));
        console.log (chalk.redBright("Some client made an attempt to access an invalid end-point."));
        response.status(404).send("Error 404.  You have requested an unknown or invalid service.");
    });

module.exports = router;