/*
 * globals.js contains global variable and constants.
 */

// An array useed to hold token objects.
var token_stream = [];

var tokenStartPosition = 0;

var tokens = "";

var tokenIndex = 0;

var currentToken = "";

var currentLexeme = "";

var errorCount = 0;

var warningCount = 0;

// Test program one.
 var testProgramOne = 'char b char c b = "hello" c = "world" P(b) {P(c) }';
 var smallTest = 'int a\nchar b\nb = "hello"\nc = "world"\nP(b) {P(c) }';

 // End of file symbol.
 var EOF = "$";

 var REGEX_SPACE = /\s/;

 var lexemeIndex = 0;

var sourceLines = [];

var isCharList = false;

var charList = "";

var errorsFound = false;

// Token kinds
var TOKEN_PRINT = "t_print";

var TOKEN_CHAR = "t_char";

var TOKEN_CHARLIST = "t_charList";

var TOKEN_DIGIT = "t_digit";

var TOKEN_OPERATOR = "t_operator";

var TOKEN_IDENTIFER = "t_identifier";

var TOKEN_INT_TYPE = "t_int_type";

var TOKEN_CHAR_TYPE = "t_char_type";

var TOKEN_QUOTE = "t_quote";

var TOKEN_OPEN_CURLY_BRACE = "t_open_curly_brace";

var TOKEN_CLOSE_CURLY_BRACE = "t_close_curly_brace";

var TOKEN_OPEN_PARENTHESIS = "t_open_parenthesis";

var TOKEN_CLOSE_PARENTHESIS = "t_close_parenthesis";

var TOKEN_EQUAL_SIGN = "t_equal_sign";

var TOKEN_EOF = "t_eof";

var TOKEN_PLUS_SIGN = "t_plus_sign";

var TOKEN_MINUS_SIGN = "t_minus_sign";

var lexicon = {"INT":TOKEN_INT_TYPE, "CHAR":TOKEN_CHAR_TYPE, "P":TOKEN_PRINT, "(":TOKEN_OPEN_PARENTHESIS, ")":TOKEN_CLOSE_PARENTHESIS, "=":TOKEN_EQUAL_SIGN, "{":TOKEN_OPEN_CURLY_BRACE, "}":TOKEN_CLOSE_CURLY_BRACE, "\"":TOKEN_QUOTE, "+":TOKEN_PLUS_SIGN, "-":TOKEN_MINUS_SIGN };
