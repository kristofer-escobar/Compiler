/* --------
   Utils.js

   Utility functions.
   -------- */

function init()
{
        // Clear the message box.
        document.getElementById("taOutput").value = "";
        document.getElementById("taSymbolTable").value = "";
        // Set the initial values for our globals.
        tokens = "";
        tokenIndex = 0;
        currentToken = ' ';
        errorCount = 0;
        warningCount = 0;
        idAddr = 0;
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
    errorsFound = true;

    document.getElementById("taOutput").value += "Error on line " + (line + 1) + " position " + position + ": " + msg + ".\n";

    errorCount = errorCount + 1;
}

function putWarningMessage(msg, line, position)
{
    document.getElementById("taOutput").value += "Warning on line " + (line + 1) + " position " + position + ": " + msg + ".\n";

    warningCount = warningCount + 1;
}

function setErrorMode(mode)
{
    if(mode == 'verbose')
    {
        verboseMode = true;
    }
    else
    {
        verboseMode = false;
    }
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

function isCharList(chrLst)
{
    return (/[a-z]/).test(chrLst);
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
        if (tokenIndex < (tokens.length))
        {
            putMessage("Getting next token.");
            // If we're not at EOF, then return the next token in the stream and advance the index.
            thisToken = tokens[tokenIndex];
            putMessage("Current token:" + thisToken.value);
        }
            tokenIndex++;

        return thisToken;
    }

function getSymbolTable()
{
    var symbolTableContents = "";

    for(var i in symbolTable)
    {
        symbolTableContents = symbolTableContents + "Name: " + i + "  Value: " + symbolTable[i].value + "  Type: " + symbolTable[i].type + "  Address: "+ symbolTable[i].address + "  isUsed: " + symbolTable[i].isUsed + "\n";
    }

    return symbolTableContents;
}

function getTokenContent(start, end)
{
    var contents = "";

    for(var i = start; i < (end-1); i++)
    {
        contents = contents + tokens[i].value;
    }
    return contents;
}

function createSymbolTable()
{
    //debugger;
    for(var i in varTypes)
    {
        if(varValues[i] !== undefined)
        {
            idIsUsed = true;
        }
        else
        {
            idIsUsed = false;
            //putWarningMessage()
        }

        addToSymbolTable(i,idAddr++, varValues[i], varTypes[i], idIsUsed, idScope, idLifetime, idCategory, idVisibility);
    }

}

function checkVars()
{
    for(var i in varValues)
    {
        if(varTypes[i] === undefined)
        {
            return false;
        }
    }

    return true;
}

function isTerminal(key){
    for(var i in terminals)
    {
        if(i == key)
        {
            return true;
        }
    }

    return false;
}

function getTerminal(key){
    for(var i in terminals)
    {
        if(i == key)
        {
            // If found return the value for the corresponding key.
            return terminals[key];
        }
    }

    return null;
}