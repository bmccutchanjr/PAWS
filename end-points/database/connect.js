//  This middleware is used to connect to (and maybe in the future) manage the connection to the MySQL
//  database.
//
//  There is a problem with this module as I understand it.  It requires the application to log into
//  the MySQL server each and every time a query is made.  If the MySQL server doesn't drop unused
//  connections, eventually the resources will be used and no one else will be able to login.  There
//  does not appear to be a way to open a persistant connection and resue it (which is how I've 
//  always worked with MySQL and PHP).  Perhaps there could be a way to create a "framework" that can
//  persist by using event listeners (event listeners belong to the Node 'process' object, and are
//  global).  Express and Passport do something very much like this by creating event listeners).

// Require the dependencies
const chalk = require("chalk");
const dotenv = require("dotenv");
const mysql = require("mysql");

var connection;

//  01  This code is used to allow the module to establish a connection to a JawsDB (Heroku) database
//  01  or a local MySQL server depending on the environment.  It would allow the application to be
//  01  deployed to Heroku without changing this module.
//  01  
//  01  It is an unnecessary complication at this point...
//  01  
//  01  if (process.env.JAWSDB_URL)
//  01  {   // If this application is running in a Heroku ????, the information required to connect to the
//  01      // database is in an environment variable called JAWSDB_URL.  Use that information to connect
//  01      // to the database.
//  01  
//  01      connection = mysql.createConnection(process.env.JAWSDB_URL);
//  01  }
//  01  else
//  01  {   // If the environment variable JAWSDB_URL does not exist, the application is running locally.
//  01      // Need to provide information to connect to the database.
//  01  
//  01      connection = mysql.createConnection(
//  01      {   server:     "localhost",
//  01          port:       3306,
//  01          user:       "root",
//  01          password:   "root",
//  01          database:   "PAWS"    
//  01      });
//  01  }
//  01  begins
connection = mysql.createConnection(
{   server:     MySQL_SERVER,
    port:       MySQL_PORT,
    user:       MySQL_USER,
    password:   MySQL_PASSWORD,
    database:   "PAWS"    
});
//  01  ends

connection.connect (error =>
{   // And finally, establish the connection to the MySQL database

    if (error) throw error;

    console.log (chalk.green("Connected to KennelLog as", connection.threadId));
});

module.exports = connection;