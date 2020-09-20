const chalk = require("chalk");
const passport = require ("passport");
const LocalStrategy = require ("passport-local").Strategy;

const people = require ("./database/people.js");
//	01	I don't know how this code got here.  I don't remember it and don't know what it thinks it does.  I do remember
//	01	deleting it before though...
//	01	const { request } = require("http");

passport.use (new LocalStrategy ( { usernameField:  "email" }, (email, password, done) =>
{
	people.authenticateByEmail (email, password)
	.then (results =>
	{
		if (results.lock_code != 0)
		{
			console.log (chalk.redBright ("PAWS AUTHENTICATION ERROR 109"));
			console.log (chalk.redBright ("Attempt to authenticate locked user account.  Lock code: " + results[0].lock_code));
			return done (null, false, { message: "PAWS AUTHENTICATION ERROR 109" });
		}
		
		return done (null, results);
	})
	.catch (error =>
	{
		console.log (chalk.redBright ("PAWS AUTHENTICATION ERROR 110"));
		console.log (chalk.redBright (error));
		return done (null, false, { message: "PAWS AUTHENTICATION ERROR 110" });
	})
}))

// This code is required, but you will never refer to it or call it.  It just happens, f---ing magic.
// It's "boiler plate" to handle session credentials.  You have to provide this code as is.

passport.serializeUser(function(user, callback)
{   
	callback (null, user);
});

passport.deserializeUser(function(obj, callback)
{
	callback (null, obj);
});

module.exports = passport;
