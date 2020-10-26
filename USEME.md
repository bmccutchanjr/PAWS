## AJAX()

    AJAX (string, string, object)

The first parameter is a string identifying the HTTP method to use in the request, only "GET" and "POST" are supported.  HTTP request method is required.

The second parameter is a string with the end-point for the request.  End-poiint is required.

The last parameter is an object defining one or more named functions to perform.  Function names are object keys and coorespond to the HTTP status codes that might be returned from the server.  They take no parameters.

    Currently only supports 200, 204, 205 and default.

## modal()

    modal (string, audio, object)

The first parameter is a string containing the message to display.  It is required.

The second parameter is a predefined audio object to play.  It is optional.

    Currently only buzz and ting are defined in the application

The last parameter is an object defining one or more named functions to perform.  It is optional.

    config: A function that modal will invoke after building the modal window.  Intended to allow invoking procedures to add control buttons to the modal window.  If specified, the event listener on the modal-div is removed.  config should include some code to invoke the function removeModal(event) to clear the modal from the screen.

    final:  A function that will be passed to removeModal() and invoked after the modal has been removed from the DOM.
