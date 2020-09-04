// PAWS is an electronic implementation of the paperwork used by volunteer's at the Humane Society of
// Summit County to track volunteer time spent with their animals.  This is a vital task to help monitor
// and maintain the mental health and well-being of the animals.
//
// This application is built using NodeJS and several well-known node modules, notably Express, Passport
// and Socket.IO.  This module is the entry point to the application and is used to configure the server
// with Express and Socket.IO.

// First, require the Node modules the server.js needs.  Note that because I'm using socket.io to push
// data to the client, this is not a typical Express configuration.

const chalk = require("chalk");
const HTTP = require("http");
const express = require("express")(HTTP);
const io = require("socket.io");
const passport = require("passport");

// Next we'll require the custom modules used by server.js

const api = require("routes/api.js");
const routes = require("routes/routes.js");

// Next we'll configure Express.

express.use(express.urlencoded({ extended: true }));
express.use (api);
express.use (routes);
express.use (passport);

// And finally let's get the server started...

const PORT = process.env ? process.env.PORT : 80;

HTTP.listen (PORT, 0, function ()
{   // If this application is hosted on the cloud, we'll listen on whatever port is assigned to it,
    // otherwise we'll listen to port 80 and any address configured on the host machine

    console.log (chalk.green("The PAWS server is up and running"));
    console.log (chalk.green("Listening on port " + PORT));
})