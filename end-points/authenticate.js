	const passport = require ("passport");
	const LocalStrategy = require ("passport-local").Strategy;

	const people = require ("./database/people.js");

	passport.use (new LocalStrategy (
	{   // Passport by default uses fields 'username' and 'password'.  You will note that this function
	    // (and later calls to passport.authenticate() do not reference these fields.  Passport appears
	    // to strip these values directly out of request body without your interaction.  More f---ing
	    // magic.
	    //
	    // But what if your code doesn't use these names?  Or perhaps you want to use an email address
	    // instead of a user name?  You can configure passport-local to use properties and names other
	    // than the default in the constructor.  Here we are telling Passport to use an email address
	    // rather than a user name (User names have to be unique to this application, and email addresses
	    // are already unique throughout the world.  Just makes sence.)

	    usernameField:  "email"
	},
	function (email, password, done)
	{   people.validateLogin (email, password)
	    .then (function (results)
	    {
	        return done (null, results);
	    })
	    .catch (function (error)
	    {   return done (null, false, { message: "Invalid login credentials"});
	    })
	}))

	// This code is required, but you will never refer to it or call it.  It just happens, f---ing magic.
	// It is "boiler plate" to handle session credentials.

	passport.serializeUser(function(user, callback)
	{   callback (null, user);
	});

	passport.deserializeUser(function(obj, callback)
	{   callback (null, obj);
	});

	module.exports = passport;
