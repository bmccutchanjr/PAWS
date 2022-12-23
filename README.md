# PAWS

PAWS is inspired by the paperwork required of volunteer dog-walkers at the Humane Society of Summit County (HSSC).  Volunteers are requested to note the time they interact with animals so the shelter can track the interaction and ensure that none of the animals are being neglected.  It's consistes of a simple log and a grid of daily activity allowing volunteers to see at a glance which animals are most in need of some quality time.

PAWS brings tha log to the web, but adds some additional features the simple paper system can't do.

This is a NodeJS application utilizing a number of well-known modules: BCrypt, Chalk, Express, Express-Session, MySQL, Passport, WS and others.

Please be aware that this is a demonstration application and is not intended to be used in the real world.  It lacks many features that a live application should include, feature like password management, password recovery and administration.

---
## Using PAWS

<strike>You don't have to install PAWS to see it in action.  A demo of PAWS is online at:

	(PAWS)[https://bmccutchanjr.heroku.com/PAWS]
</strike>

But if you want to install PAWS on your system, that's okay as well.  You'll need to follow (these instructions)[install] to create and confirure a PAWS server on your system.

I've tried to make PAWS as intuitive as possible, but there a few things you need to know in order to understand how it works.

PAWS was written to replace the paperwork requested by the HSSC when volunteers interact with one of their animals.  That's two simple forms, one simply indicating that some volunteer has had some quality time with one of the animals on a given day (a simple grid of animals and days).  The other is a log of interaction time.  Volunteers indicate when they got an animal out of its cage and when they returned.

The shelter uses this information to track interaction with the animals and make sure all are getting face time with people.  It's important for the mental well-being of the animals.

But the log has to be compiled manually to serve that purpose.

The PAWS landing page is the daily grid.  It lists all of the animals and a rolling grid of the last 28 days (fewer on mobile devices).  Volunteers can see at a glance which animals are most in need of some quality time.

It defaults to the dogs, but can be changed to the cats by selecting the icon at the top of the grid.

Animals are displayed with a color code corresponding to the animal's designated color.  This is simply a designation indicating how much experience a volunteer should have before interacting with the animal.

To help the volunteers, the grid can be sorted by name, color, last date and total interaction time (for the last seven days).  Those are the large icons at top of the grid.

Clicking on any of the grid days will display more detail about the interaction time; date and time, the volunteer's name and how long the animal was out of its cage.

Clicking on an animal's name will link to another page with additional information about that animal.  A volunteer can log interaction time from this page with a few mouse clicks.

But you'll need a User ID and password to do that.  Use 'volunteer' as both User ID and password.

As you might expect, volunteers don't have access to the administration pages.  Log in as 'admin' if you want to look at that.  The User ID and password are both 'admin'.

'admin' can make changes to the animals, but not the people.  A page exists to manage people but it's just for demonstration purposes and there are no cooresponding APIs on the server.

---
[#install]
## Installing PAWS
### Step 1

PAWS is a NodeJS application that uses a MySQL database.  Before you can install PAWS, you need to have both Node and MySQL installed on your system.  You can find those here:

	(Mysql)[https://www.mysql.com]

	(Node)[https://node.com]

If you changed the User ID and password for your MySQL server, make a note of it now.  You'll need these in a few minutes.


### Step 2
The next step is to get a copy of PAWS itself.  You can get that from its repository on GitHub.  Probably easiest, since you have NodeJS installed now, is to start Node and clone PAWS from the repository.


### Step 3
At the Node command prompt, type:

	<strike>git clone --------------------</strike>

Git will create a folder for PAWS and clone a copy into it.

An finally, you need to get PAWS configured.  That includes creating the database and configuring Node.


### Step 4
Navigate to the PAWS folder that was created by Git and type:

	node init

Node will fetch a rather large number of additional program modules that are needed to run PAWS.  It may takes several minutes, so this would be a good time to grab a cup of coffee.


### Step 5
Next find the file called .env-template and make a copy of it.  Call the new file .env.


### Step 6
If you changed the root Used ID and password for your MySQL server, you need to edit .env now.  Open it with any text editor and change the entries for PAWS_USER and PAWS_PASSWORD.  Make sure you save the file.

Almost there.  You just need to create the MySQL database and get some initial data into it.


### Step 7
Navigate to the database folder.  Make sure your MySQL server is running and type:

	mysql scheme.sql

	mysql init.sql


### Step 8
And that should do it.  Navigate back to the PAWS directory and type:

	node sever.js

In about a minute your PAWS web server should be up and running.  You can access it using the web browser of your choice.  The URL is 'localhost'.
