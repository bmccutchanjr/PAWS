//  PAWS is an electronic implementation of the paperwork used by volunteer's at the Humane Society of
//  Summit County to track volunteer time spent with their animals.  This is a vital task to help monitor
//  and maintain the mental health and well-being of the animals.
//
//  This module is the entry point to the application and is used to configure the web server with ExpressJS.
//
//  This application is built using NodeJS and several well-known node modules, notably ExpressJS and Passport.
//  WebSockets are used to push data to connected browsers providing real-time updates.

//  Require and configure NPM modules that are required to configure Express with Socket.IO

const chalk = require("chalk");
const cookies = require ("cookie-parser");
const dotenv = require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require ("express-session");
const websocket = require("./end-points/sockets.js");

//  Next we'll configure ExpressJS

const app = express();
app.use(cookies());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use (session (
    {
        secret: "keyboard cat",
        resave: true,
        saveUninitialized: true
    }));

app.use (passport.initialize());
app.use (passport.session ());

//  require modules to handles routes and end-points

app.use ("/api", require("./end-points/api.js"));
app.use ("/", require("./end-points/html.js"));

const PORT = process.env.PORT ? process.env.PORT : 80;

const server = app.listen (PORT, () =>
{   //  If this application is hosted on the cloud, we'll listen on whatever port is assigned to it,
    //  otherwise we'll listen to port 80 and any address configured on the host machine

    if (server.listening)
    {
        console.log (chalk.green("The PAWS server is up and running"));
        console.log (chalk.green("Listening on port " + PORT));
    }
});

websocket.createServer (server);
