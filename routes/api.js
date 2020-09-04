//  This module implements the routes for the applications api's.

const express = require("express");
const http = require ("http").Server (express); 
const io = require("socket.io")(http);

const app = express();

app.use (req, res, () =>
{

})