/* --------
   Utils.js

   Utility functions.
   -------- */

function init(){
    // Clear the message box.
    document.getElementById("taOutput").value = "";
    document.getElementById("taSymbolTable").value = "";
    // Set the initial values for our globals.
    //tokens = "";
    //tokenIndex = 0;
    currentToken = ' ';
    errorCount = 0;
    warningCount = 0;
    idAddr = 0;
} // End init

function trim(str){      // Use a regular expression to remove leading and trailing spaces.
	return str.replace(/^\s+ | \s+$/g, "");
	/*
	Huh?  Take a breath.  Here we go:
	- The "|" separates this into two expressions, as in A or B.
	- "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
    - "\s+$" is the same thing, but at the end of the string.
    - "g" makes is global, so we get all the whitespace.
    - "" is nothing, which is what we replace the whitespace with.
	*/

} // End trim

function putMessage(msg, line, position){
    document.getElementById("taOutput").value += msg + "\n";
} // End putMessage

function putErrorMessage(msg, line, position){
    errorsFound = true;

    document.getElementById("taOutput").value += "Error on line " + (line + 1) + " position " + position + ": " + msg + ".\n";

    errorCount = errorCount + 1;
} // End putErrorMessage

function putWarningMessage(msg, line, position){
    document.getElementById("taOutput").value += "Warning on line " + (line + 1) + " position " + position + ": " + msg + ".\n";

    warningCount = warningCount + 1;
} // End putwarningMessage

function setErrorMode(mode){
    if(mode == 'verbose'){
        verboseMode = true;
    } else{
        verboseMode = false;
    } // End else
} // End setErrorMode

function checkLexicon(key){
    key = key.toUpperCase();

    for(var i in lexicon){
        if(i == key){
            // If found return the value for the corresponding key.
            //alert(lexicon[key]);
            return lexicon[key];
        } // End if
    } // End for

    return null;
} // End checkLexicon

function isCharList(chrLst){
    return (/[a-z]/).test(chrLst);
} // End isCharList

function isChar(chr){
    return (/^[a-z]$/).test(chr);
} // End isChar

function isDigit(chr){
    return (/^\d$/).test(chr);
} // End isDigit

function checkForEOF(array){
    for(var i = 0; i < array.length; i++){
        if(array[i].indexOf(EOF) != -1){
            return i + 1;
        } // End if
    } // End for

    return -1;
} // End checkForEOF

function getTokenValues(tokens){
//debugger;
    var tokenString ="";

    for(var i = 0; i< tokens.length; i++){
        tokenString = tokenString + tokens[i].value + " ";
    } // End for

    return tokenString;
} // End getTokenValues

function getTokenKinds(tokens){
//debugger;
    var tokenString ="";

    for(var i = 0; i< tokens.length; i++){
        tokenString = tokenString + tokens[i].kind + " ";
    } // End for

    return tokenString;
} // End getTokenKinds

function getNextCharacter(line, startPosition){
    var i = 1;

    while(line.slice(startPosition, startPosition + i) == " "){
        i = i + 1;
    } // End while

    return line.slice(startPosition, startPosition + i);

} // End getNextCharacter

// function getSymbolTable(){
//     var symbolTableContents = "";

//     for(var i in symbolTable){
//         symbolTableContents = symbolTableContents + "Name: " + i + "  Value: " + symbolTable[i].value + "  Type: " + symbolTable[i].type + "  Address: "+ symbolTable[i].address + "  isUsed: " + symbolTable[i].isUsed + "\n";
//     } // End for

//     return symbolTableContents;
// } // End getSymbolTable

function getTokenContent(tokens, start, end){
    var contents = "";

    for(var i = start; i < (end-1); i++){
        contents = contents + tokens[i].value;
    } // End for
    return contents;
} // End getTokenContent

// function createSymbolTable(){
//     //debugger;
//     for(var i in varTypes){
//         if(varValues[i] !== undefined){
//             idIsUsed = true;
//         } else{
//             idIsUsed = false;
//             //putWarningMessage()
//         } // End else

//         addToSymbolTable(i,idAddr++, varValues[i], varTypes[i], idIsUsed, idScope, idLifetime, idCategory, idVisibility);
//     } //  End for

// } // End createSymbolTable

function checkVars(){
    for(var i in varValues){
        if(varTypes[i] === undefined){
            return false;
        } // End else
    } // End for

    return true;
} // End checkVars

function isTerminal(key){
    for(var i in terminals){
        if(i == key){
            return true;
        } // End if
    } // End for

    return false;
} // End isTerminal

function getTerminal(key){
    for(var i in terminals){
        if(i == key){
            // If found return the value for the corresponding key.
            return terminals[key];
        } // End if
    } // End for

    return null;
} // End getTerminal