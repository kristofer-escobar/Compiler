/*
 * globals.js contains global variable and constants.
 */

// An array useed to hold token objects.
var token_stream = [];

var tokens = "";

var tokenIndex = 0;

var currentToken = "";

var errorCount = 0;

var warningCount = 0;

// Test program one.
 var testProgramOne = 'char b char c b = "hello" c = "world" P(b) {P(c) }';

 // End of file symbol.
 var EOF = "$";

 var REGEX_SPACE = /\s/;

 var lexemeIndex = 0;

var lexicon = ["int", "char"];

var sourceLines = [];

var isCharList = false;

var charList = "";

var errorsFound = false;

// Token kinds
var TOKEN_PRINT = t_print;

var TOKEN_CHAR = t_char;

var TOKEN_CHARLIST = t_charList;

var TOKEN_DIGIT = t_digit;

var TOKEN_OPERATOR = t_operator;

var TOKEN_IDENTIFER = t_identifier;

var TOKEN_INT_TYPE = t_int_type;

var TOKEN_CHAR_TYPE = t_char_type;

var TOKEN_QUOTE = t_quote;

var TOKEN_OPEN_CURLY_BRACE = t_open_curly_brace;

var TOKEN_CLOSE_CURLY_BRACE = t_close_curly_brace;

var TOKEN_OPEN_PARENTHESIS = t_open_parenthesis;

var TOKEN_CLOSE_PARENTHESIS = t_clos_parenthesis;

