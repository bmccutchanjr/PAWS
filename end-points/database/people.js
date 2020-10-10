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

function hasAdminPrivledge (user, privledge)
{
    return new Promise ((resolve, reject) =>
    {
        const query = "select ap.adminId, ap.privledge, a.peopleId from AdminPrivledges ap "
                    + "left join Administrators a on ap.adminId=a.adminId "
                    + "where a.peopleId=? and ap.privledge=?;"
        select (query, [user, privledge])
        .then(results =>
        {
            if (results.length != 1) return resolve (false);
            if (results[0].privledge != privledge) return resolve (false);

            resolve (true);
        })
        .catch (error =>
        {
            console.log (chalk.redBright("PAWS ERROR 102"));
            console.log (chalk.redBright("function: hasAdminPrivledge()"));
            console.log (chalk.redBright(error));
            reject ("Oops!  An error occured that is preventing the server from processing this request.  Contact "
                    + "your IT support group for assistance.");
        })
    })
}

function hashPassword (password)
{   //  Hash the password...

    return new Promise ((resolve, reject) =>
    {   bcrypt.hash (password, 10, (error, hash) =>
        {   if (error) reject (error);

            resolve (hash);
        })
    })
};

//  02  begins
function updateEachColor (user, species, data, iteration=0)
{   //  There are a variable number of updates to be performed and I can't hard-code a variable number of .then()
    //  clauses.  Either I string the individual SQL statements together to execute in a single function call, or
    //  I have to find a way to execute a variable number of discrete SQL operations and yet wait for them all to
    //  complete before responding to the client.
    //
    //  That can't be done in a simple loop, because each call needs a .then() and .catch().  But it can be done
    //  with a recursive function.

    return new Promise ((resolve, reject) =>
    {
        const array = Object.entries (data);

        if (iteration == array.length) return resolve ("All updates have been completed.");

        let query = "";
        [ color, allow ] = array[iteration];

        //  Only permissions that have been changed are submitted to be updated.  So if the new status of this
        //  permission is to be 'false' that means it is now 'true', and the permission should be deleted from
        //  ColorPermissions.

        if (allow == "false")
            query = "delete from ColorPermissions where peopleId=? and species=? and color=?;";
        else
            query = "insert into ColorPermissions (peopleId, species, color) values (?, ?, ?);";

        select (query, [user, species, color])
        .then (result =>
        {   //  There is no data to return and the result is unimportant.  What is important is that no error occured
            //  and we can simply assume the operation had the desired effect and we can now submit the next SQL
            //  update.

            return updateEachColor (user, species, data, ++iteration);
        })
        .then (result =>
        {
            resolve (result);
        })
        .catch (error =>
        {
            console.log (chalk.redBright ("PAWS ERROR 102"));
            console.log (chalk.redBright ("people.js; updateEachColor()"));
            console.log (chalk.redBright (error));
            reject (error);
        })
    })
}
//  02  ends

function updateEachPrivledge (user, data, iteration=0)
{   //  There are a variable number of updates to be performed and I can't hard-code a variable number of .then()
    //  clauses.  Either I string the individual SQL statements together to execute in a single function call, or
    //  I have to find a way to execute a variable number of discrete SQL operations and yet wait for them all to
    //  complete before responding to the client.
    //
    //  That can't be done in a simple loop, because each call needs a .then() and .catch().  But it can be done
    //  with a recursive function.

    return new Promise ((resolve, reject) =>
    {
        const array = Object.entries (data);

        if (iteration == array.length) return resolve ("All updates have been completed.");

        let query = "";

        //  Only privledges that have been changed are submitted to be updated.  So if the new status of this
        //  privledge is to be 'false' that means it is now 'true', and the privledge should be deleted from
        //  Administrators.

        if (array[iteration][1] == "false")
            query = "delete from Administrators where peopleId=? and adminId=?;";
        else
            query = "insert into Administrators values (?, ?);";
        select (query, [user, array[iteration][0]])
        .then (result =>
        {   //  There is no data to return and the result is unimportant.  What is important is that no error occured
            //  and we can simply assume the operation had the desired effect and we can now submit the next SQL
            //  update.

            return updateEachPrivledge (user, data, ++iteration);
        })
        .then (result =>
        {
            resolve (result);
        })
        .catch (error =>
        {
            reject (error);
        })
    })
}

const db =
{
    allActivePeople: (() =>
    {
        const query = "select peopleId, surname, given, middle from People where active=true order by surname, given;";

        return new Promise ((resolve, reject) =>
        {
            select (query)
            .then (results =>
            {
                resolve (results);
            })
            .catch (error =>
            {
                console.log (chalk.redBright("PAWS ERROR 102"));
                console.log (chalk.redBright(error));
                reject ("Oops!  An error occured that is preventing the server from processing this request.  Contact "
                      + "your IT support group for assistance.");
            })
        })

    }),

    authenticateByEmail: (email, password) =>
    {   //  Compare the user credentials submitted to those in the database.  This function is invoked if the user entered
        //  an email address (as opposed to their Volgistics Id).
console.log ("email:    " + email);
console.log ("password: " + password);

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
//  03  console.log ("error: " + error);
//  03  console.log ("match: " + match);
//  03                      if (match)
                        resolve (result[0]);
//  03                      else
//  03                      {            
//  03                          console.log (chalk.redBright ("PAWS AUTHENTICATION ERROR 107"));
//  03                          console.log (chalk.redBright (error));
//  03                          reject ("PAWS AUTHENTICATION ERROR 107");
//  03                      }
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

    changePassword (admin, user, password)
    {
        return new Promise ((resolve, reject) =>
        {
            hasAdminPrivledge (admin, "Change passwords")
            .then (result =>
            {   //  Okay, so the currently authenticated user has the appropriate privledge to do this...

                return hashPassword (password);
            })
            .then (result =>
            {
                const query = "update People set password=? where peopleId=?";

                return select (query, [result.toString(), user]);
            })
            .then (result =>
            {
                resolve ("The password was successfully changed.");
            })
            .catch (error =>
            {
                console.log (chalk.redBright("PAWS ERROR 102"));
                console.log (chalk.redBright("people.updatePassword()"));
                console.log (chalk.redBright(error));
                reject ("Oops!  An error occured that is preventing the server from processing this request.  Contact "
                      + "your IT support group for assistance.");
            })
        })
    },

    createPerson (admin, data)
    {
        return new Promise ((resolve, reject) =>
        {
            hasAdminPrivledge (admin, "Add/remove people")
            .then (result =>
            {   //  Okay, so the currently authenticated user has the appropriate privledge to do this...

                let { given, middle, surname, email } = data;

                const query = "insert into People "
                            + "(surname, given, middle, email, password, change_by, change_date) "
                            + "values (?, ?, ?, ?, 'unassigned', ?, now());";
                return select (query, [ surname, given, middle, email, admin ]);
            })
            .then (result =>
            {
                resolve (result);
            })
            .catch (error =>
            {
                console.log (chalk.redBright("PAWS ERROR 102"));
                console.log (chalk.redBright("people.createPerson()"));
                console.log (chalk.redBright(error));
                reject (process.env.PAWS_MESSAGE_500);
            })
        })
    },

    deactivatePerson (admin, user)
    {
        return new Promise ((resolve, reject) =>
        {
            hasAdminPrivledge (admin, "Add/remove people")
            .then (result =>
            {   //  Okay, so the currently authenticated user has the appropriate privledge to do this...

                const query = "update People set active=false where peopleId=?;";
                return select (query, user);
            })
            .then (result =>
            {
                resolve (result);
            })
            .catch (error =>
            {
                console.log (chalk.redBright("PAWS ERROR 102"));
                console.log (chalk.redBright("people.createPerson()"));
                console.log (chalk.redBright(error));
                reject (process.env.PAWS_MESSAGE_500);
            })
        })
    },

    getAdminPrivledges (admin, user)
    {   //  Returns the list of Admin privledges (which may well be zero) that have been granted to this user
        //
        //  This can't be done in one query because the data I want to select on is in Administrators but the list
        //  of privledges is in AdminPrivledges.  Administrators do not have to have all privledges and after joining
        //  the tables and selecting on user Id, MySQL only returns those privledges the user has (which I want) and not
        //  the list of all possible privledges (which I also want).
        //
        //  It's the selection that's the problem and not the join.  But I don't want all privledges for all users, just
        //  for the indicated user.  The selection is also necessary.
        //
        //  So...two queries

        return new Promise ((resolve, reject) =>
        {
            let returnData =
            {   allow: false,
                privledges: []
            };

            hasAdminPrivledge (admin, "Grant admin privledges")
            .then (result =>
            {
                returnData.allow = result;

                const query = "select adminId, privledge from AdminPrivledges;";

                return select (query)
            })
            .then (results =>
            {
                returnData.privledges = results;

                const query = "select a.peopleId, ap.adminId, ap.privledge from AdminPrivledges ap "
                            + "left join Administrators a on ap.adminId=a.adminId "
                            + "where peopleId=?;";

                return select (query, user)
            })
            .then (results =>
            {
                const privledges = returnData.privledges;
                results.forEach (r =>
                {
                    privledges[r.adminId - 1].allow = true;
                });

                returnData.privledges = privledges;
                resolve (returnData);
            })
            .catch (error =>
            {
                console.log (chalk.redBright("PAWS ERROR 102"));
                console.log (chalk.redBright(error));
                reject ("Oops!  An error occured that is preventing the server from processing this request.  Contact "
                      + "your IT support group for assistance.");
            })
        })
    },

    getAnimalPermissions (admin, user)
    {   //  Returns the list of Animal permissions (which may well be zero) that have been granted to this user
        //

        return new Promise ((resolve, reject) =>
        {
            let returnData =
            {   allow: false,
                permissions: [],
                additional: [],
                animals: []
            };

            hasAdminPrivledge (admin, "Grant animal permissions")
            .then (result =>
            {   //  Get a list of all known colors known to the system
                returnData.allow = result;

                const query = "select color from Colors order by sort;";

                return select (query)
            })
            .then (results =>
            {   //  Get a list of the color permissions assigned to this user

                let length = results.length;
                for (let x=0; x<length; x++)
                {
                    returnData.permissions.push ( { color: results[x].color });
                }

                const query = "select * from ColorPermissions cp "
                            + "left join Colors c on cp.color=c.color "
                            + "where peopleId=? "
                            + "order by cp.species, c.sort;"

                return select (query, user)
            })
            .then (results =>
            {   //  Combine the results of the queries...

                const permissions = returnData.permissions;

                let length = results.length;
                for (let x=0; x<length; x++)
                {
                    const species = results[x].species;
                    const color = results[x].color;
                    const sort = results[x].sort;

                    if (results[x].species == "cat") permissions[sort].cat = true;
                    if (results[x].species == "dog") permissions[sort].dog = true;
                }
                returnData.permissions = permissions;

//  There are actually a few more data sets to retrieve and return, but there are as yet no data or even tables
//      additional permissions
//      individual animal permissions/restrictions

                resolve (returnData);
            })
            .catch (error =>
            {
                console.log (chalk.redBright("PAWS ERROR 102"));
                console.log (chalk.redBright(error));
                reject (process.env.PAWS_MESSGAE_500);
            })
        })
    },

    getPerson: ((admin, user) =>
    {   //  Retrieves data from People for the specified user id (user) and the applicable admin privledges
        //  for the administrator (admin).  These are not related information and can't be retrieved by joining
        //  the tables in a single SQL query.

        const returnData =
        {
            add: false,
            change: false
        };

        return new Promise ((resolve, reject)  =>
        {
            hasAdminPrivledge (admin, "Add/Remove people")
            .then (hasPrivledge =>
            {
                if (hasPrivledge) returnData.add = true;

                return hasAdminPrivledge (admin, "Change people");
            })
            .then (hasPrivledge =>
            {
                if (hasPrivledge) returnData.change = true;

                const query = "select peopleId, surname, given, middle, email, lock_code from People where peopleId=?;";
                return select (query, user);
            })
            .then (results =>
            {
                returnData.results = results;

                resolve (returnData);
            })
            .catch (error =>
            {
                console.log (chalk.redBright("PAWS ERROR 102"));
                console.log (chalk.redBright(error));
                reject ("Oops!  An error occured that is preventing the server from processing this request.  Contact "
                        + "your IT support group for assistance.");
            })
        })
    }),

    hasPasswordPrivledge: (user =>
    {
        return hasAdminPrivledge (user, "Change passwords");
    }),

    hasPeoplePrivledges (peopleId)
    {   //  Does the user in question have any Admin privledges associated with people?

        const query = "select peopleId, a.adminId, ap.privledge from Administrators a "
                    + "left join AdminPrivledges ap on a.adminId=ap.adminId "
                    + "where peopleId=? and a.adminId>0 and a.adminId<=5;";

        return new Promise ((resolve, reject) =>
        {
            select (query, peopleId)
            .then (results =>
            {
                if (results.length < 1)
                {
                    console.log (chalk.redBright("PAWS AUTHORIZATION ERROR 112"));
                    console.log (chalk.redBright("User# " + peopleId + " is attempting to access an admin end-point without "
                                               + "sufficient privledges"));
                    resolve (false);
                }
                else
                    resolve (true);
            })
            .catch (error =>
            {
                console.log (chalk.redBright("PAWS ERROR 102"));
                console.log (chalk.redBright(error));
                reject ("Oops!  An error occured that is preventing the server from processing this request.  Contact "
                      + "your IT support group for assistance.");
            })
        })
    },

    isAdmin (peopleId)
    {   //  Retrieve list af admin privledges for the selected user

        const query = "select peopleId, a.adminId, ap.privledge from Administrators a "
                    + "left join AdminPrivledges ap on a.adminId=ap.adminId "
                    + "where peopleId=?";
        return new Promise ((resolve, reject) =>
        {
            select (query, peopleId)
            .then (results =>
            {
                if (results.length < 1)
                    resolve (false);
                else
                    resolve (true);
            })
            .catch (error =>
            {
                console.log (chalk.redBright("PAWS PROCESS ERROR 102"));
                console.log (chalk.redBright("people.js function isAdmin()"));
                console.log (chalk.redBright(error));
                reject (error);
            })
        })
    },

    lockPerson: ((admin, user, lock) =>
    {   //  Retrieves data from People for the specified user id (user) and the applicable admin privledges
        //  for the administrator (admin).  These are not related information and can't be retrieved by joining
        //  the tables in a single SQL query.

        return new Promise ((resolve, reject)  =>
        {
            hasAdminPrivledge (admin, "Change people")
            .then (hasPrivledge =>
            {
                if (!hasPrivledge) return ("Don't have the necessary privledges");

                const query = "update People set lock_code=? where peopleId=?;";
                const code = lock == "true" ? 100 : 0;
                return select (query, [code, user]);
            })
            .then (results =>
            {
                resolve (results);
            })
            .catch (error =>
            {
                console.log (chalk.redBright("PAWS ERROR 102"));
                console.log (chalk.redBright("people.lockUser()"));
                console.log (chalk.redBright(error));
                reject ("Oops!  An error occured that is preventing the server from processing this request.  Contact "
                        + "your IT support group for assistance.");
            })
        })
    }),

    updateAdminPrivledges (admin, user, data)
    {
        return new Promise ((resolve, reject) =>
        {
            hasAdminPrivledge (admin, "Grant admin privledges")
            .then (result =>
            {   //  Okay, so the currently authenticated user has the appropriate privledge to do this...

                return select ("begin;")
            })
            .then (result =>
            {   //  Started a transaction...there's no result that I care to bother with

                return updateEachPrivledge (user, data);
            })
            .then (result =>
            {
                return select ("commit;");
            })
            .then (result =>
            {
                resolve (result);
            })
            .catch (error =>
            {
                select ("rollback;");
                console.log (chalk.redBright("PAWS ERROR 102"));
                console.log (chalk.redBright("people.updateAdminPrivledges()"));
                console.log (chalk.redBright(error));
                reject ("Oops!  An error occured that is preventing the server from processing this request.  Contact "
                      + "your IT support group for assistance.");
            })
        })
    },

//  02  begins
    updateColorPermissions (admin, user, species, data)
    {
        return new Promise ((resolve, reject) =>
        {
            hasAdminPrivledge (admin, "Grant animal permissions")
            .then (result =>
            {   //  Okay, so the currently authenticated user has the appropriate privledge to do this...

                //  There is likely more than one update represented in the data set and I don't want any to go
                //  through if any of them fails...so start a transaction

                return select ("begin;")
            })
            .then (() =>
            {   //  Started a transaction...there's no meaningful result that I care to bother with

                return updateEachColor (user, species, data);
            })
            .then (result =>
            {   //  And commit the updates

                return select ("commit;");
            })
            .then (result =>
            {
                resolve (result);
            })
            .catch (error =>
            {
                select ("rollback;");
                console.log (chalk.redBright("PAWS ERROR 102"));
                console.log (chalk.redBright("people.updateAdminPrivledges()"));
                console.log (chalk.redBright(error));
                reject (process.env.PAWS_MESSAGE_500);
            })
        })
    },
//  02  ends

    updatePerson (admin, data)
    {
        return new Promise ((resolve, reject) =>
        {
            hasAdminPrivledge (admin, "Change people")
            .then (result =>
            {   //  Okay, so the currently authenticated user has the appropriate privledge to do this...

                let { user, given, middle, surname, email } = data;

                const query = "update People set surname=?, middle=?, given=?, email=? where peopleId=?;";
                return select (query, [surname, middle, given, email, user]);
            })
            .then (result =>
            {
                resolve (result);
            })
            .catch (error =>
            {
                console.log (chalk.redBright("PAWS ERROR 102"));
                console.log (chalk.redBright("people.updatePerson()"));
                console.log (chalk.redBright(error));
                reject (process.env.PAWS_MESSAGE_500);
            })
        })
    }
}

module.exports = db;