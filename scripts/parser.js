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

        if(verboseMode)
		{
			putMessage("Creating symbol table.");
		}
        createSymbolTable();

        // Report the results.
        putMessage("Parsing found " + errorCount + " error(s).");        
    }
    
    function parseStatement()
    {
		if(currentToken.kind == TOKEN_PRINT)
		{
			if(verboseMode)
			{
				putMessage("Parsing Print.");
			}
			parsePrint();
		}
		else if(currentToken.kind == TOKEN_IDENTIFIER)
		{
			var idStart = currentToken.position;

			if(verboseMode)
			{
				putMessage("Parsing Identifier.");
			}
			parseId();

			tokenValueStart = tokenIndex;

			match(TOKEN_EQUAL_SIGN);

			if(verboseMode)
			{
				putMessage("Parsing expression.");
			}
			parseExpr();

			tokenValueEnd = tokenIndex;
//debugger;
			var tokenContent = getTokenContent(tokenValueStart, tokenValueEnd);

			varValues[idName] = tokenContent;

			if(verboseMode)
			{
				putMessage("Checking for undeclared variables.");
			}
			if(!checkVars())
			{
				putErrorMessage("Variable '" + idName + "' was never declared.", tokens[tokenValueStart-1].line, tokens[idStart-1].position);
			}

			//addToSymbolTable(idName, idAddr++, tokenContent, idType, idIsUsed, idScope, idLifetime, idCategory, idVisibility);
		}
		else if(currentToken.kind == TOKEN_TYPE)
		{
			if(verboseMode)
			{
				putMessage("Parsing Variable declaration.");
			}
			parseVarDecl();
		}
		else if(currentToken.kind == TOKEN_OPEN_CURLY_BRACE)
		{
			match(TOKEN_OPEN_CURLY_BRACE);
			if(verboseMode)
			{
				putMessage("Parsing statement list.");
			}
			parseStatementList();
//debugger;
			match(TOKEN_CLOSE_CURLY_BRACE);
		}
		else
		{
			// Found unknown statement.
			putErrorMessage("Unknown statement", tokens[tokenIndex-1].line, tokens[tokenIndex-1].position);
		}
    }

    function parseStatementList()
    {
//debugger;
		if(currentToken.kind !== EOF && currentToken.kind !== TOKEN_CLOSE_CURLY_BRACE)
		{
			if(verboseMode)
			{
				putMessage("Parsing statement.");
			}
			parseStatement();

			if(verboseMode)
			{
				putMessage("Parsing statement list.");
			}
			parseStatementList();
		}
    }

    function parsePrint()
    {
		match(TOKEN_PRINT);
		match(TOKEN_OPEN_PARENTHESIS);
		if(verboseMode)
		{
				putMessage("Parsing expression.");
		}
		parseExpr();
		match(TOKEN_CLOSE_PARENTHESIS);
    }

    function parseExpr()
    {
//debugger;
		if(currentToken.kind == TOKEN_DIGIT)
		{
			if(verboseMode)
			{
				putMessage("Parsing Int expression.");
			}
			parseIntExpr();
		}
		else if(currentToken.kind == TOKEN_QUOTE)
		{
			if(verboseMode)
			{
				putMessage("Parsing Char expression.");
			}
			parseCharExpr();
		}
		else if(currentToken.kind == TOKEN_IDENTIFIER)
		{
			if(verboseMode)
			{
				putMessage("Parsing Identifier.");
			}
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
			if(verboseMode)
			{
				putMessage("Parsing expression.");
			}
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
		idType = currentToken.value;
		match(TOKEN_TYPE);
		if(verboseMode)
		{
			putMessage("Parsing Identifier.");
		}
		parseId();
		varTypes[idName] = idType;
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