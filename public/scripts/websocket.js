//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  Create a WebSocket and connect with the PAWS server

const ws = new WebSocket ("ws://localhost");

ws.onopen = function (event)
{
    ws.send ("Hello!");
};

ws.onmessage = function (event)
{   //  A message was received from the server

    switch (event.data)
    {
        case "ping":
        {   //  This is a message sent from the server at regular intervals to verify that all of the connections it has opened
            //  are still active.  If a user closed the web page or navigated away from this page the connection established here
            //  would no longer be active and if the server didn't clean up the garbage occasionally it would eventiually crash
            //  and burn.

            ws.send ("pong");
            break;
        }
        case "Welcome aboard!":
        {   //  This is the server's response to this browser's successful connection.  There really isn't much to do with
            //  it.  But its not an error either, so accomodate it.
            break;
        }
        default:
        {
            const data = JSON.parse(event.data);

            switch (data.message)
            {
                case "Availability Change":
                {
                    changeAvailability (data)
                    break;
                }
                default:
                {
                    modal ("WEBSOCKET ERROR:\n\nAn unsupported message was received from the server", buzz);
                }
            }
        }
    }
};
