//  This middleware is used to connect to (and maybe in the future) manage the connection to the MySQL
//  database.

// Require the dependencies

const chalk = require("chalk");
const mysql = require("mysql");

const connection = mysql.createConnection(
{   server:     process.env.MySQL_SERVER,
    port:       process.env.MySQL_PORT,
    user:       process.env.MySQL_USER,
    password:   process.env.MySQL_PASSWORD,
    database:   "PAWS"    
});

connection.connect (error =>
{   // And finally, establish the connection to the MySQL database

    if (error) throw error;

    console.log (chalk.green("Connected to PAWS as", connection.threadId));
});

module.exports = connection;