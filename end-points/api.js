//  This module implements the routes for the applications api's.

const chalk = require("chalk");
const express = require("express");
const http = require ("http").Server (express); 
const io = require("socket.io")(http);

const app = express();
const router = express.Router ();

const animals = require("./database/animals.js");

app.use ("/api", router);

router
.use ((request, response, next) =>
    {   // This always happens -- whenever any route is served in this module.  At the moment, all 
        // I use it for is to debug routes, but it could be something more useful.

        console.log(chalk.yellow("api.js says client is requesting: ", request.url));

        next();
	})
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
    });

module.exports = router;