/*
 * globals.js contains global variables and constants.
 */

/*********************
 * GLOBAL VARIABLES
 *********************
 */
var token_stream = [];

var lexemeStartPosition = 0;

var tokens = "";

var tokenIndex = 0;

var currentToken = "";

var currentLexeme = "";

var errorCount = 0;

var warningCount = 0;

var EOF = "$";

var REGEX_SPACE = /\s/;

var lexemeIndex = 0;

var sourceLines = [];

var charList = "";

var isCharList = false;

var errorsFound = false;

/***********************
 * TEST PROGRAMS
 ***********************
 */
var smallTest = '{ a = "hello"\n{ P ( 5 + 6 )\n{ int b\n{ }\n}\n}\n}';

var smallTest2 = '{ int c\n{ c = "int"\n{ char a\n{ a = " b "\n{ { }\n}\n}\n}\n}\n}';

/***********************
 * SYMBOL TABLE - store the values of all the identifiers.
 ***********************
 */
var symbolTable = {};

/***********************
 * TOKEN KIND CONSTANTS
 ***********************
*/
var TOKEN_PRINT = "print";

var TOKEN_IDENTIFIER = "identifier";

var TOKEN_CHARLIST = "charList";

var TOKEN_DIGIT = "digit";

var TOKEN_OPERATOR = "operator";

var TOKEN_TYPE = "type";

var TOKEN_QUOTE = "quote";

var TOKEN_OPEN_CURLY_BRACE = "open curly brace";

var TOKEN_CLOSE_CURLY_BRACE = "close curly brace";

var TOKEN_OPEN_PARENTHESIS = "open parenthesis";

var TOKEN_CLOSE_PARENTHESIS = "close parenthesis";

var TOKEN_EQUAL_SIGN = "equal sign";

var TOKEN_EOF = "eof";

var TOKEN_OP = "operator";

/*********************
 * LEXICON - stores the reserved keywords for the grammer.
 *********************
*/
var lexicon = {"INT":TOKEN_TYPE, "CHAR":TOKEN_TYPE, "P":TOKEN_PRINT, "(":TOKEN_OPEN_PARENTHESIS, ")":TOKEN_CLOSE_PARENTHESIS, "=":TOKEN_EQUAL_SIGN, "{":TOKEN_OPEN_CURLY_BRACE, "}":TOKEN_CLOSE_CURLY_BRACE, "+":TOKEN_OP, "-":TOKEN_OP };


