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

var charListValue = "";

var startQuotePosition = 0;

var endQuotePosition = 0;

var inCharList = false;

var errorsFound = false;

var verboseMode = false;

var idName = "";

var idAddr = 0;

var idValue = "";

var idType = "";

var idIsUsed = "";

var idScope = "";

var idLifetime = "";

var idCategory = "";

var idVisibility = "";

var tokenValueStart = 0;

var tokenValueEnd = 0;

var varTypes = [];

var varValues = [];
/***********************
 * TEST PROGRAMS
 ***********************
 */
 // Test different types of expressions, variable 'a' never declared.
var smallTest1 = '{ a = "hello"\n{ P ( 5 + 6 )\n{ int b\n{ }\n}\n}\n}';

// Introduces a reserved word inside a charList.
var smallTest2 = '{ int c\n{ c = "int"\n{ char a\n{ a = " b "\n{ { }\n}\n}\n}\n}\n}';

// Test use undeclared variable.
var smallTest3 = 'a = " hello "';

// Test no source code
var smallTest4 ='';

//Test only passing lexer.
var smallTest5 ='} { 5 6 b = ( int';

//Test a lex error.
var smallTest6 = '{ a5 = "h"\n}';

//Test a parse error.
var smallTest7 = '{ int int a\n{ a 5\n}\n}';

// Test only curly braces.
var smallTest8 = '{ { } }';

var smallTest9 = 'P(2)$';

var smallTest10 = '{}';

var smallTest11 = '{{{{{{}}}}}}$';

var smallTest12 = 'P(a)$';

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

var TOKEN_OPEN_CURLY_BRACE = "open_curly_brace";

var TOKEN_CLOSE_CURLY_BRACE = "close_curly_brace";

var TOKEN_OPEN_PARENTHESIS = "open_parenthesis";

var TOKEN_CLOSE_PARENTHESIS = "close_parenthesis";

var TOKEN_EQUAL_SIGN = "equal_sign";

var TOKEN_EOF = "eof";

var TOKEN_OP = "operator";

/*********************
 * LEXICON - stores the reserved keywords for the grammer.
 *********************
*/
var lexicon = {"INT":TOKEN_TYPE, "CHAR":TOKEN_TYPE, "P":TOKEN_PRINT, "(":TOKEN_OPEN_PARENTHESIS, ")":TOKEN_CLOSE_PARENTHESIS, "=":TOKEN_EQUAL_SIGN, "{":TOKEN_OPEN_CURLY_BRACE, "}":TOKEN_CLOSE_CURLY_BRACE, "+":TOKEN_OP, "-":TOKEN_OP };

var terminals = {"P":TOKEN_PRINT, "(":TOKEN_OPEN_PARENTHESIS, ")":TOKEN_CLOSE_PARENTHESIS, "{":TOKEN_OPEN_CURLY_BRACE, "}":TOKEN_CLOSE_CURLY_BRACE, "+":TOKEN_OP, "-":TOKEN_OP};

