//  This module is the middleware responsible for interacting with the MySQL database server.

const chalk = require("chalk");
const connection = require("./connect.js");

function select (query, parameters)
{   //  This application execute several 'select' statements to retrieve data from the server, and
    //  for the most part, they all look alike.  A connection must be made to the MySQL server, a
    //  query must be submitted and the resulting data set must be processed.  The only difference
    //  is the actual query being submitted.  And although individual queries may be significantly
    //  different, the way they are handled by this module is not...

    return new Promise ((resolve, reject) =>
    {
        connection.query (query, parameters, (error, result) =>
        {   if (error) reject (error);

            resolve (result);
        });
    })
}

const db =
{
    getPassword: (peopleId) =>
    {   //  Retrieve the stored password for the indicated person.

    },
}

module.exports = db;