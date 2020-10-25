//  This page uses the NPM module "ws" to create WebSockets to allow two-way background communication between this server and
//  a subset of clients.  At the time I write this, only the log.html enables WebSockets on the client browsers, so only those
//  browsers displaying the landing page can send or receive messages from the server.
//
//  WebSockets are used to push messages to the client browsers when animals are updates in the database.

const chalk = require("chalk");
const ws = require("ws");

//  Maintain a list of connected clients

let clientList = [];

function checkConnections ()
{   //  Because of the nature of this application I need a method to remove inactive connections.  Individual browsers may load
    //  the log.html, follow a link to another page and then reload log.html.  And that would result in a large number of dead
    //  connections taking up memory on the server and eventually causing a crash.

    //  Interate through clientList[]:
    //
    //  -   Build a new array with those connections with status "true"
    //  -   Set the status for each connection to "false"
    //  -   Send a keep-alive message to each connection still in clientList[]
    //
    //  Replace clientList with the new array

    const newList = [];

    clientList.forEach (client =>
    {
        if (client.status == true)
            newList.push (
                {   
                    "id": client.id,
                    "status": false,
                    "client": client.client
                });

        client.client.send ("ping");
    });

    clientList = newList;
};

function createUniqueId ()
{   //  Generate a random 10-digit id for each client that connects.  I guess it's not guaranteed to be unique, but with 100 billion
    //  possible combinations it is all but guaranteed.
    
    let id = "";

    for (let x=0; x<10; x++)
    {   id += Math.floor(Math.random() * 10);
    };

    return id;
}

const socket = 
{
    createServer: server =>
    {   //  Create the WebSocket server and event handlers to manage connections

        const socket = new ws.Server ( { server } );

        socket.on ("connection", client =>
        {
            client.send ("Welcome aboard!");

            const uniqueId = createUniqueId();

            clientList.push (
                {   
                    "id": uniqueId,
                    "status": true,
                    "client": client
                });
            console.log (chalk.greenBright("A WebSocket client has connected"));
            console.log (chalk.greenBright("current # connections: " + clientList.length));


            client.on ("message", message =>
            {   //  Listen for messages from this CLIENT

                switch (message)
                {
                    case "Hello!":
                    {   //  A client is trying to connect...and we've already handled that.  Ignore this message.

                        break;
                    }
                    case "pong":
                    {
                        clientList.forEach (client =>
                        {
                            if (client.id == uniqueId) client.status = true;
                        })
                        break;
                    }
                    default:
                    {
                        console.log (chalk.redBright ("WEBSOCKET ERROR"));
                        console.log (chalk.redBright ("Unknown message received"));
                        console.log (chalk.redBright (message));
                        break;
                    }
                }
            });
        });

        socket.on ("error", error =>
        {
            console.log (chalk.redBright ("WEBSOCKET ERROR"));
            console.log (chalk.redBright (error));
        });

        socket.on ("listening", () =>
        {
            console.log (chalk.greenBright ("WebSocket server is listening for new connections"));

            const interval = setInterval (() =>
            {   //  Do some clean-up.  Every 15 minutes, send a "ping" message to all connections in clientList[].  If the
                //  client doesn't respond remove the client from clientList[] on the next iteration.

                checkConnections ();
            }, 900000);
        })

    },

    sendToAll: message =>
    {   //  Push the indicated message to all connected clients.
        //  
        //  This is invoked as a response to some event outside of the scope of the WebSocket server, and not as a response to
        //  a message received from a client.  This is how the server pushes notification to the clients to changes made to the
        //  database, perhaps a new animal added or someone has taken an animal out of its cage.
        //
        //  There is no need, at this time, to be selective.  All messages will be pushed to all connected clients.

        clientList.forEach (cl =>
        {   cl.client.send(message);
        })
    }
}

module.exports = socket;