/*
* parser.js
*/

function Parser(tokenStream){
	var tokens = tokenStream;
	var tokenIndex = 0;
	var currentToken = null;
	var tree = new Tree();
	this.tree = tree;

	this.parse = function(){
		// Display tokens to be parsed.
		putMessage("Parsing [" + getTokenValues(tokens) + "]");

		// Grab the next token.
		currentToken = getNextToken();

		// A valid parse derives the Statement production, so begin there.
		parseStatement();

		var endIndex = tokenIndex - 1;

		if(endIndex !== (tokens.length )){
			putErrorMessage("Unexpected token",currentToken.line, currentToken.position);
		}

		if(verboseMode){
			putMessage("Creating symbol table.");
		}

		createSymbolTable();

		// Report the results.
		putMessage("Parsing found " + errorCount + " error(s).");

	}; // End parse.

	function parseStatement(){
		tree.addBranchNode("Statement");

		if(currentToken.kind == TOKEN_PRINT){
			if(verboseMode){
				putMessage("Parsing Print.");
			}// End if

			parsePrint();

		} else if(currentToken.kind == TOKEN_IDENTIFIER){
			var idStart = currentToken.position;

			if(verboseMode){
				putMessage("Parsing Identifier.");
			} // End if

			parseId();

			tokenValueStart = tokenIndex;

			match(TOKEN_EQUAL_SIGN);

			if(verboseMode){
				putMessage("Parsing expression.");
			} // End if

			parseExpr();

			tokenValueEnd = tokenIndex;

			var tokenContent = getTokenContent(tokens, tokenValueStart, tokenValueEnd);

			varValues[idName] = tokenContent;

			if(verboseMode){
				putMessage("Checking for undeclared variables.");
			} // End if
			//if(!checkVars())
			//{
			//	putErrorMessage("Variable '" + idName + "' was never declared.", tokens[tokenValueStart-1].line, tokens[idStart-1].position);
			//  }

			//addToSymbolTable(idName, idAddr++, tokenContent, idType, idIsUsed, idScope, idLifetime, idCategory, idVisibility);
		} else if(currentToken.kind == TOKEN_TYPE){
			if(verboseMode){
				putMessage("Parsing Variable declaration.");
			} // End if

			parseVarDecl();

		} else if(currentToken.kind == TOKEN_OPEN_CURLY_BRACE){
			match(TOKEN_OPEN_CURLY_BRACE);
			if(verboseMode){
				putMessage("Parsing statement list.");
			} // End if

			parseStatementList();

			match(TOKEN_CLOSE_CURLY_BRACE);
		} else{
			// Found unknown statement.
			putErrorMessage("Unknown statement", tokens[tokenIndex-1].line, tokens[tokenIndex-1].position);
		} // End else

		tree.endChildren();
	} // End parseStatement.

function parseStatementList(){
	tree.addBranchNode("StatementList");

	if(currentToken.kind !== EOF && currentToken.kind !== TOKEN_CLOSE_CURLY_BRACE){
		if(verboseMode){
			putMessage("Parsing statement.");
		} //  End if

		parseStatement();

		if(verboseMode){
			putMessage("Parsing statement list.");
		} // End if

		parseStatementList();
	} // End if

	tree.endChildren();
} // End parseStatementList

function parsePrint(){
	tree.addBranchNode("Print");

	match(TOKEN_PRINT);
	match(TOKEN_OPEN_PARENTHESIS);
	if(verboseMode){
			putMessage("Parsing expression.");
	} // End if

	parseExpr();
	match(TOKEN_CLOSE_PARENTHESIS);

	tree.endChildren();
} // End parsePrint

function parseExpr(){
	tree.addBranchNode("Expression");

	if(currentToken.kind == TOKEN_DIGIT){
		if(verboseMode){
			putMessage("Parsing Int expression.");
		} // End if
		parseIntExpr();
	} else if(currentToken.kind == TOKEN_QUOTE){
		if(verboseMode){
			putMessage("Parsing Char expression.");
		} // End if

		parseCharExpr();
	} else if(currentToken.kind == TOKEN_IDENTIFIER){
		if(verboseMode){
			putMessage("Parsing Identifier.");
		} // End else if
		parseId();
	} else{
		putErrorMessage("Unknown expression.", tokens[tokenIndex-1].line, tokens[tokenIndex-1].position);
	} // End if

	tree.endChildren();
} // End parseExpr

function parseIntExpr(){
//debugger;
	tree.addBranchNode("IntExpr");

	if(tokenIndex < tokens.length){
		if(tokens[tokenIndex].kind == TOKEN_OP){
			match(TOKEN_DIGIT);
			match(TOKEN_OP);
			if(verboseMode){
				putMessage("Parsing expression.");
			} // End if
			parseExpr();
		} // End if
		else{
			match(TOKEN_DIGIT);
		} // End else
	}// End token check.
	else{
		match(TOKEN_DIGIT);
	} // End else

	tree.endChildren();

} // End parseIntExpr

function parseCharExpr(){
	tree.addBranchNode("CharExpr");

	match(TOKEN_QUOTE);
	match(TOKEN_CHARLIST);
	match(TOKEN_QUOTE);

	tree.endChildren();
} // End parseCharExpr

function parseId(){
	tree.addBranchNode("Id");

	idName = currentToken.value;
	match(TOKEN_IDENTIFIER);

	tree.endChildren();
} // End parseId

function parseVarDecl(){
	tree.addBranchNode("VarDecl");

	idType = currentToken.value;
	match(TOKEN_TYPE);
	if(verboseMode){
		putMessage("Parsing Identifier.");
	} // End if
	parseId();
	varTypes[idName] = idType;

	tree.endChildren();
} //  End parseVarDecl

function match(expectedKind){
	putMessage("Expecting: " + expectedKind);

	if(currentToken.kind == expectedKind){
		tree.addLeafNode(currentToken.value);
		putMessage("Received: " + currentToken.kind);

		currentToken = getNextToken();
	} else{
		putErrorMessage("Expected a token of kind: " + expectedKind + " but got token of kind " + currentToken.kind + ".",currentToken.line, currentToken.position);
	} // End else
} // End match

function getNextToken(){
        var thisToken = EOF;    // Let's assume that we're at the EOF.
        if (tokenIndex < tokens.length){
            putMessage("Getting next token.");
            // If we're not at EOF, then return the next token in the stream and advance the index.
            thisToken = tokens[tokenIndex];
            putMessage("Current token:" + thisToken.value);
        } // End if

        tokenIndex++;

        return thisToken;
    } // End getNextToken

} // End Parser.