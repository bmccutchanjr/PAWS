//  PAWS is an electronic implementation of the paperwork used by volunteer's at the Humane Society of
//  Summit County to track volunteer time spent with their animals.  This is a vital task to help monitor
//  and maintain the mental health and well-being of the animals.
//
//  This application is built using NodeJS and several well-known node modules, notably Express, Passport
//  and Socket.IO.  This module is the entry point to the application and is used to configure the server
//  with Express and Socket.IO.

//  First, require the Node modules that server.js needs.
//  Note that because I'm using socket.io to push data to the client, this is not a typical Express
//  configuration.

//  01  const chalk = require("chalk");
//  01  const cookies = require ("cookie-parser");
//  01  const dotenv = require("dotenv").config();
//  01  const express = require("express");
//  01  const session = require ("express-session");
//  01  const app = express();
//  01  const http = require ("http");
//  01  const server = http.createServer (app);
//  01  const io = require("socket.io");
//  01  const socket = io.listen(server);
//  01  const passport = require("passport");
//  Require and configure NPM modules that are required to configure Express with Socket.IO

const express = require("express");
const app = express();
const http = require ("http");
const server = http.createServer (app);
const io = require("socket.io");
const socket = io.listen(server);

//  Require the remainder of NPM modules used in this application

const chalk = require("chalk");
const cookies = require ("cookie-parser");
const dotenv = require("dotenv").config();
const passport = require("passport");
const session = require ("express-session");

//  Next we'll configure Express.

app.use(cookies());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use (session (
    {   secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
    }));

app.use (passport.initialize());
app.use (passport.session ());

//  require modules to handles routes and end-points

app.use ("/api", require("./end-points/api.js"));
app.use ("/", require("./end-points/html.js"));

const PORT = process.env.PORT ? process.env.PORT : 80;

server.listen (PORT, () =>
{   //  If this application is hosted on the cloud, we'll listen on whatever port is assigned to it,
    //  otherwise we'll listen to port 80 and any address configured on the host machine

    if (server.listening)
    {
        console.log (chalk.green("The PAWS server is up and running"));
        console.log (chalk.green("Listening on port " + PORT));
        // console.log (chalk.green (JSON.stringify(server.address(), null, 2)));
    }
});

socket.on ("connection", () =>
{   //  Connection event is triggered when a new client connects
});
