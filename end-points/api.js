//  This module is used to serve the API end-points.

//  Require npm modules

const chalk = require("chalk");
const express = require("express");
const passport = require("./authenticate.js");

//  Require custom middleware

const animals = require("./database/animals.js");
const people = require("./database/people.js");

//  Configure express

const server = express();

const router = express.Router ();
server.use ("/api", router);

router
.use ((request, response, next) =>
    {   // This always happens -- whenever any route is served in this module.  At the moment, all 
        // I use it for is to debug routes, but it could be something more useful.

        console.log(chalk.yellow("api.js says client is requesting: ", request.url));
if (request.user)
    console.log ("peopleId: " + request.user.peopleId);
        // console.log(chalk.yellow(JSON.stringify(request.body, null, 2)));

        next();
	})

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    //  The following end-points relate to the animals in the shelter

	.get("/animals/allactive/:group", (request, response) =>
	{	// Get all of the animals currently in the shelter for the specified animal type.  This is
        // displayed on the browser as the Enrichment Log.

		animals.getAllActive (request.params.group, (status, data) =>
        {   // serve data returned from animals.getAll()

            if (status != 200)
                response.status(status).send(data);
            else
                response.status(200).json(data);
        })
    })

	.get("/animals/get/:animalId", (request, response) =>
	{	// Get all of the animals currently in the shelter for the specified animal type.  This is
        // displayed on the browser as the Enrichment Log.

		animals.getAnimal (request.params.animalId, (status, data) =>
        {   // serve data returned from animals.getAll()

            if (status != 200)
                response.status(status).send(data);
            else
                response.status(200).json(data);
        })
    })

	.get("/animals/getInteraction/:animalId/:year/:month/:day", (request, response) =>
	{	// Get interaction details fro the requested animal and day

		animals.getInteraction (request.params, (status, data) =>
        {   // serve data returned from animals.getAll()

            if (status != 200)
                response.status(status).send(data);
            else
                response.status(200).json(data);
        })
    })

    .get("/animals/getWalkingNotes/:animalId", (request, response) =>
    {   //  get all walking notes for the indicated animal...

//          let isAuthenticated = true;
//          if (!request.user) isAuthenticated = false;
        const isAuthenticated = (!request.user) ? false : true;

        animals.getWalkingNotes (request.params.animalId, isAuthenticated)
        .then(result =>
        {
            return response.status(200).send(result);
        })
        .catch(error =>
        {
            console.log (chalk.redBright("PAWS ERROR 102"));
            console.log (chalk.redBright("module: api.js"));
            console.log (chalk.redBright("route:  /animals/postWalkingNotes/animalId"));
            console.log (chalk.redBright(error));
            return response.status(500).send(error);
        })
    })
//  01  ends

    .post("/animals/postWalkingNotes/:animalId", (request, response) =>
    {   //  The user has submitted walking notes...put them in the database...

        if (!request.user)
            return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

        animals.insertWalkingNotes (request.user.peopleId, request.params.animalId, request.body)
        .then(result =>
        {
            return response.status(200).send(result);
        })
        .catch(error =>
        {
            console.log (chalk.redBright("PAWS ERROR 102"));
            console.log (chalk.redBright("module: api.js"));
            console.log (chalk.redBright("route:  /animals/postWalkingNotes/animalId"));
            console.log (chalk.redBright(error));
            return response.status(500).send(error);
        })
    })

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    //  The following end-points relate to the people using the application

    .get("/people/allActivePeople", (request, response, next) =>
    {   //  Return a boolean value indicating whether the authenticated user has admin privledges.

        if (!request.user)
            return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

        people.hasPeoplePrivledges (request.user.peopleId)
        .then (results =>
        {
            if (!results) return false;

            return people.allActivePeople ()
        })
        .then (data =>
        {
            if (!data)
                return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

            response.status(200).send(data);
        })
        .catch (error =>
        {
            return response.status(500).send(process.env.PAWS_500_STATUS_MESSAGE);
        })
    })

    .post("/people/changeAdminPrivledges/:user", (request, response) =>
    {
        if (!request.user)
            return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

        const admin = request.user.peopleId;
        const user = request.params.user;

        people.hasPeoplePrivledges (admin)
        .then (result =>
        {
            if (!result)
                return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);
            else
                return people.updateAdminPrivledges (admin, user, request.body)
        })
        .then (data =>
        {
            response.status(200).send(data);
        })
        .catch (error =>
        {
            return response.status(500).send(process.env.PAWS_500_STATUS_MESSAGE);
        })
    })

    .post("/people/changePassword/:user", (request, response) =>
    {
        if (!request.user)
            return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

        const admin = request.user.peopleId;
        const user = request.params.user;

        if (!request.body.password)
        {   console.log (chalk.redBright("PAWS ERROR 103"));
            console.log (chalk.redBright("api.js: /api/people/changePassword"));
            console.log (chalk.redBright("PAWS server received invalid data: no property 'password' in request.body"));
            return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);
        }

        if (!request.body.password)
        {   console.log (chalk.redBright("PAWS ERROR 104"));
            console.log (chalk.redBright("api.js: /api/people/changePassword"));
            console.log (chalk.redBright("PAWS server received invalid data: password does meet minimum requirements"));
            return response.status(500).send(process.env.PAWS_500_STATUS_MESSAGE);
        }

        people.hasPeoplePrivledges (admin)
        .then (result =>
        {
            if (!result)
                return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);
            else
                return people.changePassword (admin, user, request.body.password)
        })
        .then (data =>
        {
            response.status(200).send(data);
        })
        .catch (error =>
        {
            console.log (chalk.redBright("PAWS ERROR 102"));
            console.log (chalk.redBright("api.js: /api/people/changePassword"));
            console.log (chalk.redBright(error));
            return response.status(500).send(process.env.PAWS_500_STATUS_MESSAGE);
        })
    })

    .post("/people/createPerson", (request, response, next) =>
    {   //  Create a new record in People with the personal data (name and email address) provided.

        if (!request.user)
            return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

        const admin = request.user.peopleId;

        people.hasPeoplePrivledges (admin)
        .then (result =>
        {
            if (!result)
                return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

            return people.createPerson (admin, request.body);
        })
        .then(result =>
        {
            response.status(200).send(result);
        })
        .catch (error =>
        {
            console.log (chalk.redBright("PAWS ERROR"));
            console.log (chalk.redBright("/api/people/updatePerson"));
            console.log (chalk.redBright(error))
            return response.status(500).send(process.env.PAWS_500_STATUS_MESSAGE);
        })
    })

    .get("/people/deactivatePerson/:user", (request, response, next) =>
    {   //  Deactivate a person record in People for the specified user.  This application does not actually delete
        //  rows from People chielfy to preserve the name for interactin reports.  Rows are deactivated by setting
        //  the field active to 'false'.  All queries that operate on People select rows where active=true.

        if (!request.user)
            return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

        const admin = request.user.peopleId;
        const user = request.params.user;

        people.hasPeoplePrivledges (admin)
        .then (result =>
        {
            if (!result)
                return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

            return people.deactivatePerson (admin, user);
        })
        .then(result =>
        {
            //  send a 205 status: completed successfully, no data is returned and requesting client reload
            response.status(205).send();
        })
        .catch (error =>
        {
            console.log (chalk.redBright("PAWS ERROR"));
            console.log (chalk.redBright("/api/people/updatePerson"));
            console.log (chalk.redBright(error))
            return response.status(500).send(process.env.PAWS_500_STATUS_MESSAGE);
        })
    })

    .get("/people/isAdmin", (request, response, next) =>
    {   //  Return a boolean value indicating whether the authenticated user has admin privledges.

        if (!request.user)
            return response.status(200).send(false);

        people.isAdmin (request.user.peopleId)
        .then (result =>
        {   response.status(200).send(result);
        })
        .catch (error =>
        {   
            console.log (chalk.red(error));
            return response.status(500).send(process.env.PAWS_500_STATUS_MESSAGE);
        })
    })

    .get("/people/isAuthenticated", (request, response, next) =>
    {   if (!request.user)
            return response.status(200).send(false);
        else
            return response.status(200).send(true);
    })

    .get("/people/getAdminPrivledges/:user", (request, response, next) =>
    {   //  Retrieve and return all data for one person.

        if (!request.user)
            return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

        const admin = request.user.peopleId;
        const user = request.params.user;

        people.hasPeoplePrivledges (admin)
        .then (result =>
        {
            if (!result)
                return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);
            else                
                return people.getAdminPrivledges (admin, user)
        })
        .then (data =>
        {
            response.status(200).send(data);
        })
        .catch (error =>
        {
            return response.status(500).send(process.env.PAWS_500_STATUS_MESSAGE);
        })
    })

    .get("/people/getAnimalPermissions/:user", (request, response, next) =>
    {   //  Retrieve and return all data for one person.

        if (!request.user)
            return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

        const admin = request.user.peopleId;
        const user = request.params.user;

        people.hasPeoplePrivledges (admin)
        .then (result =>
        {
            if (!result)
                return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);
            else                
                return people.getAnimalPermissions (admin, user)
        })
        .then (data =>
        {
            response.status(200).send(data);
        })
        .catch (error =>
        {
            return response.status(500).send(process.env.PAWS_500_STATUS_MESSAGE);
        })
    })

    .get("/people/getPerson/:peopleId", (request, response, next) =>
    {   //  Retrieve and return all data for one person.

        if (!request.user)
            return response.status(400).send(process.env.PAWS_400_STATUS_MESSAGE);

        const admin = request.user.peopleId;
        const user = request.params.peopleId;

        people.hasPeoplePrivledges (admin)
        .then (result =>
        {
            if (!result)
                return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);
            else                
                return people.getPerson (admin, user)
        })
        .then (data =>
        {
            response.status(200).send(data);
        })
        .catch (error =>
        {
            console.log (chalk.redBright("PAWS ERROR"));
            console.log (chalk.redBright("/api/people/getPerson"));
            console.log (chalk.redBright(error))
            return response.status(500).send(process.env.PAWS_500_STATUS_MESSAGE);
        })
    })


    .get("/people/lockPerson/:user/:lock", (request, response, next) =>
    {   //  Retrieve and return all data for one person.

        if (!request.user)
            return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

        const admin = request.user.peopleId;
        const lock = request.params.lock;
        const user = request.params.user;

        people.hasPeoplePrivledges (admin)
        .then (result =>
        {
            if (!result)
                return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

            return people.lockPerson (admin, user, lock);
        })
        .then(result =>
        {
            response.status(200).send(result);
        })
        .catch (error =>
        {
            console.log (chalk.redBright("PAWS ERROR"));
            console.log (chalk.redBright("/api/people/getPerson"));
            console.log (chalk.redBright(error))
            return response.status(500).send(process.env.PAWS_500_STATUS_MESSAGE);
        })
    })

    .get("/people/hasPasswordPrivledge/:peopleId", (request, response, next) =>
    {   //  Does the current user have privledges to change passwords.

        if (!request.user)
            return response.status(200).send(false);

        const admin = request.user.peopleId;

        people.hasPasswordPrivledge (admin)
        .then (result =>
        {
            if (!result)
                return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);
            else                
                return response.status(200).send(result);
        })
        .catch (error =>
        {
            return response.status(500).send(process.env.PAWS_500_STATUS_MESSAGE);
        })
    })

    .post("/people/login", (request, response, next) =>
    {
        //  So first things first...verify the client actually sent us data

        if (Object.entries(request.body).length != 2)
        {   console.log (chalk.redBright("PAWS AUTHORIZATION ERROR 101: The server has received invalid authorization credentials"));
            return response.status(400).send(process.env.PAWS_400_STATUS_MESSAGE);
        }

        //  And verify the data sent are valid login credentials

        if (!request.body.email)
        {   console.log (chalk.redBright("PAWS AUTHORIZATION ERROR 102: The server has received invalid authorization credentials"));
            return response.status(400).send(process.env.PAWS_400_STATUS_MESSAGE);
        }

        if (!request.body.password)
        {   console.log (chalk.redBright("PAWS AUTHORIZATION ERROR 104: The server has received invalid authorization credentials"));
            return response.status(400).send(process.env.PAWS_400_STATUS_MESSAGE);
        }

        //  So far so good...let's verify authentication

        passport.authenticate ("local", (error, user, info) =>
        {
            if (error)
            {
                console.log (chalk.redBright("PAWS AUTHORIZATION ERROR 105")); 
                console.log (chalk.redBright(error));
                response.status(500)
                        .send("Oh No!!  An unspecified error occured on the server preventing you from logging into PAWS "
                            + "at this time.  Please contact your IT support for assistance.");
                return;
            }

            if (!user)
            {
                return response.status(401)
                               .send("Unable to authenticate with PAWS server.  "
                                   + "Please verify your email address and password are correct.");
            }

            request.login (user, (error) =>
            {
                if (error)
                {   
                    console.log (chalk.redBright("PAWS AUTHORIZATION ERROR 111")); 
                    console.log (chalk.redBright(error));
                    return response.status(500)
                            .send("Oh No!!  An unspecified error occured on the server preventing you from logging into PAWS "
                                + "at this time.  Please contact your IT support for assistance.");
                }

                return response.status(205).send("supercalifragilistic");
            });
        })(request, response, next);
    })

    .post("/people/updateAdditionalPermissions/:user/:species", (request, response) =>
    {
        if (!request.user)
            return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

        const admin = request.user.peopleId;
        const species = request.params.species;
        const user = request.params.user;

        people.updateAdditionalPermissions (admin, user, species, request.body)
        .then (data =>
        {
            response.status(200).send(data);
        })
        .catch (error =>
        {
            return response.status(500).send(process.env.PAWS_500_STATUS_MESSAGE);
        })
    })

    .post("/people/updateColorPermissions/:user/:species", (request, response) =>
    {
        if (!request.user)
            return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

        const admin = request.user.peopleId;
        const species = request.params.species;
        const user = request.params.user;

        people.updateColorPermissions (admin, user, species, request.body)
        .then (data =>
        {
            response.status(200).send(data);
        })
        .catch (error =>
        {
            return response.status(500).send(process.env.PAWS_500_STATUS_MESSAGE);
        })
    })

    .post("/people/updatePerson/:user", (request, response, next) =>
    {   //  Updates personal data (name and email address) for one person.

        if (!request.user)
            return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

        const admin = request.user.peopleId;

        people.hasPeoplePrivledges (admin)
        .then (result =>
        {
            if (!result)
                return response.status(401).send(process.env.PAWS_401_STATUS_MESSAGE);

            return people.updatePerson (admin, request.body);
        })
        .then(result =>
        {
            response.status(200).send(result);
        })
        .catch (error =>
        {
            console.log (chalk.redBright("PAWS ERROR"));
            console.log (chalk.redBright("/api/people/updatePerson"));
            console.log (chalk.redBright(error))
            return response.status(500).send(process.env.PAWS_500_STATUS_MESSAGE);
        })
    })

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    //  Miscellaneous end-points

    .use((request, response) =>
    {   //  Default API end-point to handle bad requests...all this does is send a 404 status with custom
        //  message.

        console.log (chalk.redBright("PAWS ERROR 404"));
        console.log (chalk.redBright("Some client made an attempt to access an invalid end-point."));
        response.status(404).send(process.env.PAWS_404_STATUS_MESSAGE);
    });

module.exports = router;