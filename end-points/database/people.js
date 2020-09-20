//  This module is responsible for interacting with the MySQL database server.

const bcrypt = require("bcryptjs");
const chalk = require("chalk");
const connection = require("./connect.js");

function select (query, parameters)
{   //  This application executes several 'select' statements to retrieve data from the server, and
    //  for the most part, they all look alike.  A connection must be made to the MySQL server, a
    //  query must be submitted and the resulting data set must be processed.  The only difference
    //  is the actual query being submitted.  And although individual queries may be significantly
    //  different, the way they are handled by this module is not...

    return new Promise ((resolve, reject) =>
    {
        connection.query (query, parameters, (error, result) =>
        {   
            // connection.end ();
            
            if (error) reject (error);

            resolve (result);
        });
    })
}

const db =
{
    authenticateByEmail: (email, password) =>
    {   //  Compare the user credentials submitted to those in the database.  This function is invoked if the user entered
        //  an email address (as opposed to their Volgistics Id).

        const query = "select peopleId, lock_code, surname, given, middle, password from People where active=true and email=?";
        return new Promise ((resolve, reject) =>
        {
            select (query, email)
            .then (result =>
            {            
                if ((result.length == 0) || (result.length > 1)) reject ("email address is not unique");

                bcrypt.compare (password, result[0].password, (error, match) =>
                {
                    if (error)
                    {   
                        console.log (chalk.redBright ("PAWS AUTHENTICATION ERROR 106"));
                        console.log (chalk.redBright (error));
                        reject ("PAWS AUTHENTICATION ERROR 106");
                        return;
                    }

                    if (match)
                        resolve (result[0]);
                    else
                    {            
                        console.log (chalk.redBright ("PAWS AUTHENTICATION ERROR 107"));
                        console.log (chalk.redBright (error));
                        reject ("PAWS AUTHENTICATION ERROR 107");
                    }
                })
            })
            .catch (error =>
            {            
                console.log (chalk.redBright ("PAWS AUTHENTICATION ERROR 108"));
                console.log (chalk.redBright (error));
                reject ("PAWS AUTHENTICATION ERROR 108");
            })
        })
    },

//  01  I haven't been able to figure out how to configure Passport to use either an emaill address or a Volgistics Id.
//  01  I suppose I could fudge it by sending an object where the key is either "email" or "volgistics", or I could test
//  01  the value Passport sends to passport.authenticate() to decide which it is.  But I'm having enough other problems
//  01  withPassport right now to care about this one.
//  01  
//  01  So right now I'm only going to support the email adddress.
//  01  
//  01      authenticateByVolgistics: (peopleId) =>
//  01      {   //  Retrieve the stored password for the indicated person.  This function is invoked if the user entered
//  01          //  a Volgistics Id (as opposed to their email address).
//  01  
//  01          const query = "select peopleId, password from People where volgistics=?";
//  01          select (query, email)
//  01          .then (result =>
//  01          {            
//  01              if ((result.length == 0) || (result.length > 1)) return false;
//  01  
//  01              bcrypt.compare (password, result.password, (error, match) =>
//  01              {
//  01                  if (error)
//  01                  {   console.log (chalk.redBright (error));
//  01                      return { status: 500, message: "something bad happened"};
//  01                  }
//  01  
//  01                  if (match)
//  01                      return result.peopleId;
//  01                  else
//  01                      return false;
//  01              })
//  01          })
//  01          .catch (error =>
//  01          {            
//  01              console.log (chalk.redBright (error));
//  01              return { status: 500, message: "something bad happened"};
//  01          })
//  01      },

    isAdmin (peopleId)
    {   //  Retrieve list af admin privledges for the selected user

    }
}

module.exports = db;