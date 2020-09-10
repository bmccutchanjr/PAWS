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
    getAllActive: (group, callback) =>
    {   //  The interaction log does not mix species.  It's either dogs or cats, but never both on the
        //  same page.  This function retrieves all active animals at the shelter of the indicated
        //  species.

        select ("select * from Animals where species=? and active=true order by name, color;", group)
        .then(data =>
        {   callback (200, data);
        })
        .catch(error =>
        {   
            console.log (chalk.red(error));
            callback (500, error);
        })
    },

    getAnimal: (animalId, callback) =>
    {   //  Get all of the data on the animal indicated.

        select ("select * from Animals a "
              + "left join AnimalRestrictions ar on a.animalId=ar.animalId "
              + "left join Restrictions r on ar.restrictId=r.restrictId "
              + "where a.animalId=?;", animalId + " "
              + "group by r.text;")
        .then(data =>
        {   callback (200, data);
        })
        .catch(error =>
        {   
            console.log (chalk.red(error));
            callback (500, error);
        })
    }
}

module.exports = db;