//  This module implements the routes for the applications api's.

const express = require("express");
const http = require ("http").Server (express); 
const io = require("socket.io")(http);

const app = express();
const router = express.Router ();

app.use ("/api", router);

router
.use ((request, response, next) =>
    {   // This always happens -- whenever any route is served in this module.  At the moment, all 
        // I use it for is to debug routes, but it could be something more useful.

        console.log(chalk.yellow("api.js says client is requesting: ", request.url));

        next();
    });

module.exports = router;