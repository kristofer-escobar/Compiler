/*
* parser.js
*/  
    function parse()
    {
        putMessage("Parsing [" + getTokenValues(tokens) + "]");

        // Grab the next token.
        currentToken = getNextToken();

        // A valid parse derives the G(oal) production, so begin there.
        parseStatement();

        // Report the results.
        putMessage("Parsing found " + errorCount + " error(s).");        
    }
    
    function parseStatement()
    {
		if(currentToken.kind == TOKEN_PRINT)
		{
			parsePrint();
		}
		else if(currentToken.kind == TOKEN_IDENTIFIER)
		{
			parseId();

			tokenValueStart = tokenIndex;

			match(TOKEN_EQUAL_SIGN);

			parseExpr();

			tokenValueEnd = tokenIndex;
//debugger;
			var tokenContent = getTokenContent(tokenValueStart, tokenValueEnd);

			addToSymbolTable(idName, idAddr++, tokenContent, idType, idIsUsed, idScope, idLifetime, idCategory, idVisibility);
		}
		else if(currentToken.kind == TOKEN_TYPE)
		{
			parseVarDecl();
		}
		else if(currentToken.kind == TOKEN_OPEN_CURLY_BRACE)
		{
			match(TOKEN_OPEN_CURLY_BRACE);
			parseStatementList();
//debugger;
			match(TOKEN_CLOSE_CURLY_BRACE);
		}
		else
		{
			// Found unknown statement.
			putErrorMessage("Unknown statement.", tokens[tokenIndex-1].line, tokens[tokenIndex-1].position);
		}
    }

    function parseStatementList()
    {
//debugger;
		if(currentToken.kind !== EOF && currentToken.kind !== TOKEN_CLOSE_CURLY_BRACE)
		{
			parseStatement();
			parseStatementList();
		}
    }

    function parsePrint()
    {
		match(TOKEN_PRINT);
		match(TOKEN_OPEN_PARENTHESIS);
		parseExpr();
		match(TOKEN_CLOSE_PARENTHESIS);
    }

    function parseExpr()
    {
//debugger;
		if(currentToken.kind == TOKEN_DIGIT)
		{
			parseIntExpr();
		}
		else if(currentToken.kind == TOKEN_QUOTE)
		{
			parseCharExpr();
		}
		else if(currentToken.kind == TOKEN_IDENTIFIER)
		{
			parseId();
		}
		else
		{
			putErrorMessage("Unknown expression.", tokens[tokenIndex-1].line, tokens[tokenIndex-1].position);
		}
    }

    function parseIntExpr()
    {
//debugger;
		if (tokens[tokenIndex].kind == TOKEN_OP) 
		{
			match(TOKEN_DIGIT);
			match(TOKEN_OP);
			parseExpr();
		} 
		else 
		{
			match(TOKEN_DIGIT);
		}
    }

    function parseCharExpr()
    {
		match(TOKEN_QUOTE);
		match(TOKEN_CHARLIST);
		match(TOKEN_QUOTE);
    }

    function parseId()
    {
		idName = currentToken.value;
		match(TOKEN_IDENTIFIER);
    }

    function parseVarDecl()
    {
		match(TOKEN_TYPE);
		parseId();
    }

    function match(expectedKind)
    {
		putMessage("Expecting: " + expectedKind);

		if(currentToken.kind == expectedKind)
		{
			putMessage("Received: " + currentToken.kind);

			currentToken = getNextToken();
		}
		else
		{
			putErrorMessage("Expected a token of kind: " + expectedKind + " but got token of kind " + currentToken.kind + ".",currentToken.line, currentToken.position);
		}
    }