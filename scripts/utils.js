/* --------
   Utils.js

   Utility functions.
   -------- */

function init()
{
        // Clear the message box.
        document.getElementById("taOutput").value = "";
        // Set the initial values for our globals.
        tokens = "";
        tokenIndex = 0;
        currentToken = ' ';
        errorCount = 0;
}

function trim(str)      // Use a regular expression to remove leading and trailing spaces.
{
	return str.replace(/^\s+ | \s+$/g, "");
	/*
	Huh?  Take a breath.  Here we go:
	- The "|" separates this into two expressions, as in A or B.
	- "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
    - "\s+$" is the same thing, but at the end of the string.
    - "g" makes is global, so we get all the whitespace.
    - "" is nothing, which is what we replace the whitespace with.
	*/
	
}

function putMessage(msg, line, position)
{
    document.getElementById("taOutput").value += msg + "\n";
}
    
function putErrorMessage(msg, line, position)
{
    document.getElementById("taOutput").value += "ERROR: Line " + line + " Position " + position + " :" + msg + "\n";

    errorCount = errorCount + 1;
}

function putWarning(warning)
{
    document.getElementById("taOutput").value += "Warning: Line " + line + " Position " + position + " :" + msg + "\n";

    warningCount = warningCount + 1;
}


function checkLexicon(key)
{
    key = key.toUpperCase();

    for(var i in lexicon)
    {
        if(i == key)
        {
            // If found return the value for the corresponding key.
            //alert(lexicon[key]);
            return lexicon[key];
        }
    }

    return null;
}

function isChar(chr)
{
    return (/^[a-z]$/).test(chr);
}

function isDigit(chr)
{
    return (/^\d$/).test(chr);
}

function checkForEOF(array)
{
    for(var i = 0; i < array.length; i++)
    {
        if(array[i].indexOf(EOF) != -1)
        {
            return i + 1;
        }
    }

    return -1;
}

function getTokenValues(tokens)
{
//debugger;
    var tokenString ="";

    for(var i = 0; i< tokens.length; i++)
    {
        tokenString = tokenString + tokens[i].value + " ";
    }

    return tokenString;
}

function getTokenKinds(tokens)
{
//debugger;
    var tokenString ="";

    for(var i = 0; i< tokens.length; i++)
    {
        tokenString = tokenString + tokens[i].kind + " ";
    }

    return tokenString;
}

function getNextCharacter(line, startPosition)
{
    var i = 1;

    while(line.slice(startPosition, startPosition + i) == " ")
    {
        i = i + 1;
    }

    return line.slice(startPosition, startPosition + i);

}

function getNextToken()
    {
        var thisToken = EOF;    // Let's assume that we're at the EOF.
        if (tokenIndex < tokens.length)
        {
            // If we're not at EOF, then return the next token in the stream and advance the index.
            thisToken = tokens[tokenIndex];
            putMessage("Current token:" + thisToken.value);
            tokenIndex++;
        }
        return thisToken;
    }
