//  This module is the middleware responsible for interacting with the MySQL database server.

const chalk = require("chalk");
const connection = require("./connect.js");

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

        select ("select a.animalId, name, a.color, cage_num, year(start), month(start), day(start), sum((time_to_sec(end) - time_to_sec(start)) / 60) as duration "
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

        select ("select * from Animals a "
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

        select ("select a.name, year(start), month(start), day(start), hour(start), minute(start), (time_to_sec(i.end) - time_to_sec(i.start)) / 60 as duration, p.surname, p.given "
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
            let where = "where w.animalId=?";

            if (!allNotes) where += " and w.public=true";
            where += ";";

            const query = "select a.name, p.surname, p.given, w.date_added, w.note from WalkingNotes w "
                        + "left join Animals a "
	                    + "on w.animalId=a.animalId "
                        + "left join People p "
	                    + "on w.peopleId=p.peopleId "
                        + where;

            select (query, animal)
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

        return new Promise ((resolve, reject) =>
        {
            const color = data.color;
            const public = data.public;
            const note = data.note;

            const query = "insert into WalkingNotes (peopleId, animalId, color, public, date_added, note) values (?, ?, ?, ?, now(), ?);"
            select (query, [ user, animal, color, public, note ])
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
    }
}

module.exports = db;