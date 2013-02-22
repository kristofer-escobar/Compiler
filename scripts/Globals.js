/*
 * globals.js contains global variable and constants.
 */

// An array useed to hold token objects.
var token_stream = [];

var tokens = "";

var tokenIndex = 0;

var currentToken = "";

var errorCount = 0;

// Test program one.
 var testProgramOne = 'char b char c b = "hello" c = "world" P(b) {P(c) }';

 // End of file symbol.
 var EOF = "$";

 var REGEX_SPACE = /\s/;