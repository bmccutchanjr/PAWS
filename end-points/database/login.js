//  This module is the user authentication middleware for the application.  It uses Bcrypt, MySQL
//  and Passport.

//  This application does not use a true ORM archetecture.  In a true ORM setup, there would be an
//  additional layer (another middleware module) between the API end-point module and the Passport
//  and database modules.  I don't see the point, actually.  One or the other of those modules
//  wouldn't do much more than pass data back and forth between the other two.

//  I originally tried to use the NPM module bcrypt, but nothing happened.  My script simply terminated
//  upon requiring bcrypt.  Nothing else in the script was being executed, but I wasn't getting errors
//  either.  That's when I found out about bcryptjs -- a zero dependency, all JavaScript version of bcrypt.
//  And bcryptjs works.
//
//  When I uninstalled bcrypt, NPM gave me a couple warnings about missing dependencies.  I didn't see these
//  when I installed bcrypt, but bcrypt was just one of several modules I installed.  Missing dependencies
//  might explain why bcrypt failed, but it still didn't throw errors.
//
//  So a zero-dependency version it is...

const bcrypt = require("bcryptjs");
const connection = require("./connect.js");

// function compare (hashedpassword, cleartext)
// {   //  Compare the password...

//     return new Promise ((resolve, reject) =>
//     {
//         bcrypt.compare (cleartext, hashedpassword, (error, match) =>
//         {
//             if (error) reject (error);

//             if (match)
//                 resolve (match);
//             else
//                 reject (match);
//         })
//     })
// };

function hash (password)
{   //  Hash the password...

    return new Promise ((resolve, reject) =>
    {
        bcrypt.hash (password, 10, (error, hash) =>
        {
            if (error) reject (error);

            resolve (hash);
        })
    })
};

const data = 
[   [ "staff", "Admin", "Susie", "admin", "admin" ],
    [ "volunteer", "Walker", "Johnny", "walker", "walker"],
    [ "volunteer", "McCutchan", "Bill", "bill", "me" ]
];

function person (data)
{   // Create people in the database...

    data.forEach (d =>
        {
            hash (d[4])
            .then (password =>
            {
console.log(typeof password);
console.log(password);
console.log(password.toString());

                d[4] = password;

                const query = 
                "insert into People values "
                + "(null, true, false, ?, ?, ?, null, null, ?, null, ?, null, null, 'Bill', '2020-09-09');";
                connection.query (query, d, (error, result) =>
                {
                    if (error) throw error;
                    console.log (result);
                })

                // compare (password, d[4])
                // .then (responce =>
                // {   
                //     console.log (responce);
                // })
                // .catch (error =>
                // {
                //     console.log (error);
                // })
            })
            .catch (error =>
            {   console.log (error);
            })
        })
}

person (data)