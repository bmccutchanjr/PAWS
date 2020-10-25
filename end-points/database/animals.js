//  This module is the middleware responsible for interacting with the MySQL database server.

const chalk = require("chalk");
const connection = require("./connect.js");

//  02  begins
const socket = require("../sockets.js");
//  02  ends

//  Following are several functions used by the db object.  They are not exported by this module and as such are "private".
//  They perform important functions for the module (some are invoked in multiple places) but should not be accessed directly
//  by other modules.

function daysDiff (today, year, month, day)
{   //  MySQL can do a lot, but it seems one of the things it can't do is math on dates.  There is no built-in function to
    //  calculate the number of days between dates.  MySQL requires similar math as JavaScript, plus you have to embed it in
    //  a select.  It's pretty messy.
    //
    //  So we're doing that math here, rather than a select statement.

    //  But hey, JavaScript chose to make the month of their Date object zero-indexed (January is 0 and December is 11) just
    //  like a JavaScript array (which it's not), and unlike any calendar in the history of mankind.  Curiously, they did not
    //  chose to treat the day or year in the same manner.  The first of the month is 1.
    //
    //  MySQL, on the other hand, assigns 1 to January and 12 to December.  Thus a little math (very little) is required to
    //  instantiate a JavaScript Date object with a date from MySQL.
    
    let diff = today.getTime() - new Date(year, (month - 1), day).getTime();
    return diff / 24 / 60 / 60 / 1000;
}

function query (queryString, parameters)
{   //  This application execute several 'select' statements to retrieve data from the server, and
    //  for the most part, they all look alike.  A connection must be made to the MySQL server, a
    //  query must be submitted and the resulting data set must be processed.  The only difference
    //  is the actual query being submitted.  And although individual queries may be significantly
    //  different, the way they are handled by this module is not...

    return new Promise ((resolve, reject) =>
    {
        connection.query (queryString, parameters, (error, result) =>
        {   if (error) reject (error);

            resolve (result);
        });
    })
}

function verifyWalkPermission (peopleId, animalId)
{   //  Verify this person is allowed to have this animal out of its cage...
    //
    //  There are several conditions to check and none of them can be conbined into a single query and so I have a very
    //  long Promise chain.  But it is not always necessary to check every condition, or execute every .then() block in
    //  the chain.  Unfortunately a Promise chain has no way to short cut when a condition results in a definitive answer.
    //
    //  It doen't seem possible to write a bunch of discrete functions, because I still need to use a Promise or callback
    //  to wait for the results of one condition before checking the next.  I don't want the thrid condition to permit a
    //  session if the first or second would deny it.
    //
    //  The only solution to that seems to be to throw an error!
    //
    //  Maybe instead of one long chain, I need to nest Promises?  But that's a problem for another time.  It works now
    //  and that's good enough for now.  But nested Promises might be a better way to go and I want to understand how these
    //  things work better...so it is something I will look into.  But in this case I would be nesting Promises four or maybe
    //  five deep (some of those nested Promises would be chains) -- not much better than just using callbacks.
    //
    //  The "break chain" error is NOT AN ERROR.  Despite what Dustin and Trilogy told us, .then() DOES NOT HAVE TO RETURN A
    //  VALUE to continue the chain.  .then() IMPLICITLY returns a value and any value returned in .then() is implicitly a
    //  Promise object.  That means the Promise chain will just continue to the end, as long as there isn't an error, which may
    //  actually be an error itself.  There is no other way to break out of a Promise chain before all .then() blocks execute,
    //  short of an error.
    //
    //  So...I throw an error!
    //
    //  Very clunky way to handle it, but this is JavaScript after all.

    const ERROR_401_MESSAGE = "Opps!  It appears you don't have permisssion to walk this animal.  Contact "
                            + "the behavior group if you believe this to be a mistake.";

    //  First, check if there are any sessions still active for this animal

    return new Promise ((resolve, reject) =>
    {
        const queryString = "select * from Interactions where animalId=? and end is null;";
        query (queryString, animalId)
        .then(result =>
        {
            if (result.length != 0)
            {   reject (
                    {   status: 400,
                        message: "Are you sure?  Our records indicate this animal is out with another volunteer at the moment."
                    });
                throw ("break chain");
            }

            //  The animal appears to be available, check if there are any sessions still active for the user

            const queryString = "select * from Interactions where peopleId=? and end is null;";
            return query (queryString, peopleId);
        })
        .then(result =>
        {
            if (result.length != 0)
            {   reject (
                    {   status: 400,
                        message: "Opps!  You can't have two animals out at once time.  Please make sure you ended any "
                                + "sessions you have started."
                    });
                throw ("break chain");
            }

            //  The user is also available...now let's start checking permissions

            const queryString = "select permit from AnimalPrivledges where peopleId=? and animalId=?;";
            return query (queryString, [ peopleId, animalId ]);
        })
        .then(result =>
        {
            if (result.length != 0)
            {   
                if (!result[0].permit)
                {   reject ( { status: 401, message: ERROR_401_MESSAGE } );
                    throw ("break chain");
                }

                if (result[0].permit)
                {   resolve ("all good!");
                    throw ("break chain");
                }
            }

            //  The user has no specific permissions or restrictions with this animal.
            //  Do they have the necessary permission for animals of this color?

            const queryString = "select c.color from Animals a "
                        + "left join ColorPermissions c on a.color=c.color "
                        + "where a.animalId=? and c.peopleId=?;";
            return query (queryString, [ animalId, peopleId ]);
        })
        .then(result =>
        {
            if ((result.length == 0) || (!result[0].color))
            {   reject ( { status: 401, message: ERROR_401_MESSAGE } );
                throw ("break chain");
            }

            //  The user is allowed to walk with animals of this color.

            //  But, does this animal have any testable AdditionalRestrictions?
            //
            //  Seems this can't be done with one query regardless of what the docs say...the second join IS ALWAYS TREATED
            //  LIKE AN INNER JOIN, data must exist in all three tables or nothing is retrieved.  But a left join works when
            //  there are just two tables, so it seems like I have to do this in steps...

//  select ar.animalId, r.restriction, ap.peopleId from AnimalRestrictions ar 
//  left outer join Restrictions r on ar.restrictId=r.restrictId 
//  left outer join AdditionalPermissions ap on r.restrictId=ap.restrictId 
//  where ar.animalId=23 and r.testable=true and ap.peopleId=2;

            const queryString = "select ar.restrictId, r.restriction from AnimalRestrictions ar "
                        + "left join Restrictions r on ar.restrictId=r.restrictId "
                        + "where ar.animalId=? and r.testable=true;";
            return query (queryString, animalId);
        })
        .then(result =>
        {
            //  No restrictions?  This user is permitted to walk this animal
            if (result.length == 0)
            {
                resolve ("all good!");
                throw ("break chain");
            }

            //  That's not enough.  The animal has restrictions, does the user have the cooresponding permission?

            const queryString = "select restrictId from AdditionalPermissions "
                        + "where peopleId=? and restrictId=?;";
            return query (queryString, [ peopleId, result[0].restrictId ]);
        })
        .then(result =>
        {
            //  No restriction means no permission
            if (result.length == 0)
            {   reject ( { status: 401, message: ERROR_401_MESSAGE } );
                throw ("break chain");
            }

            //  That's it...if we got this far the user is indeed permitted to walk with this animal.  Next we need to
            //  insert a row in Interactions, but that seems easiest to do that from api.js as there is more than one
            //  place in this function where we determined the user has the necessary permission

            resolve ("good to go!  have fun!");
        })
        .catch(error =>
        {
            if (error != "break chain")
            {   //  The "break chain" error is NOT AN ERROR.  Despite what Dustin and Trilogy told us, .then() DOES NOT HAVE
                //  TO RETURN A VALUE to continue the chain.  .then() IMPLICITLY returns a value nad any value returned in
                //  .then() is implicitly a Promise object.  That means the Promise chain will just continue to the end, as
                //  long as there isn't' error.  There is no way to break of a Promise chain before all .then() block, short
                //  of an error.  So I throw an error!

                console.log(chalk.redBright("PAWS ERROR 102"));
                console.log(chalk.redBright("module:   animals.js"));
                console.log(chalk.redBright("function: verifyWalkPermission()"));
                console.log(chalk.redBright(error));
                reject(error);
            }
        })
    })
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//  Following is the db object that is exported by this module.  It is a collection of "public" functions
//  that are available to other modules.

const db =
{
    getAllActive: (group, callback) =>
    {   //  The interaction log does not mix species.  It's either dogs or cats, but never both on the
        //  same page.  This function retrieves all active animals at the shelter of the indicated
        //  species.

        query ("select a.animalId, name, available, a.color, cage_num, year(start), month(start), day(start), sum((time_to_sec(end) - time_to_sec(start)) / 60) as duration "
                + "from Animals a " 
                + "left join Colors c on a.color=c.color "
                + "left join Interactions i on a.animalId=i.animalId "
                + "where species=? and active=true "
                + "group by name, sort, a.animalId, date(start) desc;", group)
        .then(data =>
        {   //  Although MySQL can do a lot, it cannot convert several records into a JavaScript array

            if (data.length == 0)
            {   //  The query returned no data.  But that isn't an error -- necessarilly...
                console.log (chalk.red("no data"));
                return;
            }
            else
            {
                let animalId = undefined;
                let converted = [];
//  The "current date" is fixed to the data of initial data load for the development cycle
                let today = new Date(2020, 8, 26);

                let length = data.length;
                let x = 0;
                while (x<length)
                {
                    animalId = data[x]["animalId"];
                    
                    const c1 =
                    {   "animalId": data[x]["animalId"],
                        "name": data[x]["name"],
                        "available": data[x]["available"],
                        "color": data[x]["color"],
                        "cage_num": data[x]["cage_num"],
                        "totalMinutes": 0,
                        "mostRecent": 0,
                    }

                    const a = [];
                    for (let y=0; y<28; y++)
                    {
                        a.push ({});
                    }

                    while ((x<length) && (animalId == data[x]["animalId"]))
                    {
                        a [daysDiff (today, data[x]["year(start)"], data[x]["month(start)"], data[x]["day(start)"])] =
                        {   "year": data[x]["year(start)"],
                            "month": data[x]["month(start)"],
                            "day": data[x]["day(start)"],
                            "duration": data[x]["duration"]
                        }

                        animalId = data[x]["animalId"];
                        x++;
                    }

                    c1.day = a;
                    converted.push (c1);
                }

                callback (200, converted);
            }
        })
        .catch(error =>
        {   
            console.log (chalk.redBright("PAWS ERROR 102"));
            console.log (chalk.redBright(error));
            callback (500, error);
        })
    },

    getAnimal: (animalId, callback) =>
    {   //  Get all of the data on the animal indicated.

        query ("select * from Animals a "
              + "left join AnimalRestrictions ar on a.animalId=ar.animalId "
              + "left join Restrictions r on ar.restrictId=r.restrictId "
              + "where a.animalId=?;", animalId)
        .then(data =>
        {   callback (200, data);
        })
        .catch(error =>
        {   
            console.log (chalk.red(error));
            callback (500, error);
        })
    },

    getInteraction: (params, callback) =>
    {   //  Get all of the data on the animal indicated.

        query ("select a.name, year(start), month(start), day(start), hour(start), minute(start), (time_to_sec(i.end) - time_to_sec(i.start)) / 60 as duration, p.surname, p.given "
              + "from Interactions i "
              + "left join Animals a on i.animalId=a.animalId "
              + "left join People p on i.peopleId=p.peopleId "
              + "where a.animalId=? and year(start)=? and month(start)=? and day(start)=? "
              + "order by start;", [params.animalId, params.year, params.month, params.day])
        .then(data =>
        {   callback (200, data);
        })
        .catch(error =>
        {   
            console.log (chalk.red(error));
            callback (500, error);
        })
    },

    getWalkingNotes (animal, allNotes)
    {   //  get all walking notes for the indicated animal...

        return new Promise ((resolve, reject) =>
        {
            let where = "where w.animalId=? ";
            if (!allNotes) where += "and w.public=true ";

            const queryString = "select a.name, p.surname, p.given, w.created, w.note from WalkingNotes w "
                        + "left join Animals a "
	                    + "on w.animalId=a.animalId "
                        + "left join People p "
	                    + "on w.peopleId=p.peopleId "
                        + where
                        + "order by w.created desc;";

            query (queryString, animal)
            .then(results =>
            {   //  ...and return the results of the query

                resolve (results);
            })
            .catch(error =>
            {
                console.log(chalk.redBright("PAWS ERROR 102"));
                console.log(chalk.redBright("module:   animals.js"));
                console.log(chalk.redBright("function: insertWalkingNotes()"));
                console.log(chalk.redBright(error));
                reject(error);
            })
        })
    },

    insertWalkingNotes (user, animal, data)
    {   //  execute an SQL query to insert the notes into the database...

        data.public = data.public == "true";

        return new Promise ((resolve, reject) =>
        {
            const color = data.color;
            const public = data.public;
            const note = data.note;

            const queryString = "insert into WalkingNotes (peopleId, animalId, color, public, created, note) values (?, ?, ?, ?, now(), ?);"
            query (queryString, [ user, animal, color, public, note ])
            .then(results =>
            {   //  MySQL doesn't really return anything important if this operation was successful, but pass the result 
                //  object back to the end-point handler any way.

                resolve (results);
            })
            .catch(error =>
            {
                console.log(chalk.redBright("PAWS ERROR 102"));
                console.log(chalk.redBright("module:   animals.js"));
                console.log(chalk.redBright("function: insertWalkingNotes()"));
                console.log(chalk.redBright(error));
                reject(error);
            })
        })
    },

    startSession (peopleId, animalId)
    {   //  Verify that the individual has authority to walk with this animal, and start a walking session is they do

        return new Promise ((resolve, reject) =>
        {
            let returnData = {};

            verifyWalkPermission (peopleId, animalId)
            .then(_ =>
            {   //  The result returned by the Promise is not actually important.  verifyWalkPermission() will invoke
                //  a reject() if the user doesn't have permission, and only invoke a resolve() if they do.  If this
                //  then-block is invoked, it simply means the user has permission.
                //  
                //  This function requires updating more than one table...and that means transaction tracking...

                return query ("begin", [ peopleId, animalId ]);
            })
            .then(_ =>
            {   //  Again, the result of the last transaction is unimportant.  It is enough to know no errors occured
                //  and it is okay to perform this insert.

                const queryString = "insert into Interactions (peopleId, animalId, start) values (?, ?, now());";
                return query (queryString, [ peopleId, animalId ]);
            })
            .then(result =>
            {   //  This result is the only result in this chain that actually has any meaning to the application, and it
                //  is vital.  There's no user data in it but rather the status of the insert statement with the primary
                //  key of the row just added.  It would be much simpler to resolve the value of the key but that might be
                //  a 3-digit number, which ExpressJS interprets as a status code rather than data.  Which is bad enough.
                //  ExpressJS logs messages about a deprecated process (which I would be happy ignoring) but if the value
                //  is not a status code ExpressJS recognizes, ExpressJS will blow up.
                //
                //  It's a brain-dead assumption on the part of the ExpressJS developers to assume my data is somehow integral
                //  to their code and then run away with it.  But I guess that's what you get when you use a framework.

                returnData = result;

                const queryString = "update Animals set available=false where animalId=?;";
                return query (queryString, animalId);
            })
            .then(result =>
            {   //  And once again, the results of the last query are not all that important.

                return query ("commit;");
            })
            .then(result =>
            {   //  And yet again.  It is ebough that the 'commit' didn't fail.  So now I can resolve the results
                //  from the above insert operation.

                socket.sendToAll (
                    JSON.stringify(
                        {
                            "message": "Availability Change",
                            "animalId": animalId,
                            "available": false
                        })
                )

                resolve (returnData);
            })
            .catch(error =>
            {
                if (!error.status)
                {
                    query ("rollback;");

                    console.log(chalk.redBright("PAWS ERROR 102"));
                    console.log(chalk.redBright("module:   animals.js"));
                    console.log(chalk.redBright("function: startWalking()"));
                    console.log(chalk.redBright(error));
                }

                reject(error);
            })
        })
    },

    stopSession (sessionId)
    {   //  Update Interactions with the time this session ended

        return new Promise ((resolve, reject) =>
        {
            let animalId = undefined;

            query ("select animalId from Interactions where id=?;", sessionId)
            .then(result =>
            {   //  I need the animalId from Interactions to update any connected WebSocket clirnts

                animalId = result[0].animalId;

                return query ("begin;");
            })
            .then(_ =>
            {   //  The last query started a transaction.  There's no data returned from that.  It's enough to know
                //  it didn't fail, which is why this block is executing.

                const queryString = "update Interactions set end=now() "
                                  + "where id=? and end is null;";
                return query (queryString, sessionId);
            })
            .then(_ =>
            {   //  The result returned by the Promise is not actually important.  If this then-block is invoked it
                //  simply means there were no errors.

                const queryString = "update Animals set available=true where animalId=?;";
                return query (queryString, animalId);
            })
            .then(result =>
            {   //  And once again, the results of the last query are not all that important.

                return query ("commit;");
            })
            .then(result =>
            {   //  And once again, the results of the last query are not all that important.

                socket.sendToAll (
                    JSON.stringify(
                        {
                            "message": "Availability Change",
                            "animalId": animalId,
                            "available": true
                        })
                )

                resolve ("true");
            })
            .catch(error =>
            {
                query ("rollback;");

                console.log(chalk.redBright("PAWS ERROR 102"));
                console.log(chalk.redBright("module:   animals.js"));
                console.log(chalk.redBright("function: stopWalking()"));
                console.log(chalk.redBright(error));
                reject(error);
            })
        })
    }
}

module.exports = db;