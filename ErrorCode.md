# PAWS Error Codes

## Authentication errors

101:    The server did not receive the wrong number of authorization credentials.

102:    The server did not receive a property identified as "email".

104:    The server did not receive a property identified as "password".

105:    An unspecified error occured on the server preventing you from logging into PAWS.

106:    Unspecified BCRYPT error.  BCRYPT threw an error.

107:    BCRYPT reporting user supplied password doesn't match the password stored in the database.

108:    MySQL threw an error.  Most likely due to a syntax error in the query.

109:    Attempt to authenticate to a locked user account.
		
110:    Passort threw an error

111:    Unspecified Passport error.  Passport was unable to initialize the session id.

## Process errors

101     Some client attempted to access a non-existant end-point.

102     MySQL threw an error.  Most likely due to a syntax error in the query.

103     Required data was not passed to the server in POST data

104     Password does not meet minimum requirements
