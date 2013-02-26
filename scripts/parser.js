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
    
    function parseStatement(){
		if(currentToken.kind == TOKEN_PRINT){
			parsePrint();
		}
		else if(currentToken.kind == TOKEN_IDENTIFIER)
		{
			parseId();
			match(TOKEN_EQUAL_SIGN);
			parseExpr();
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
			// ERROR
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
			putMessage("PARSE ERROR: Unknown expression." );
		}
    }

    function parseIntExpr()
    {
//debugger;
		if (tokens[tokenIndex].kind == TOKEN_OP) {
			match(TOKEN_DIGIT);
			match(TOKEN_OP);
			parseExpr();
			} else {
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
			putMessage("Got: " + currentToken.kind);
			currentToken = getNextToken();
		}
		else
		{
			putMessage("ERROR: Expected token kind: " + expectedKind + " but got " + currentToken.kind + " instead.");
		}
    }



    function parseG()
    {
        // A G(oal) production can only be an E(xpression), so parse the E production.
        parseE();
    }

    function parseE()
    {
        // All E productions begin with a digit, so make sure that we have one.
        checkToken("digit");
        // Look ahead 1 char (which is now in currentToken because checkToken 
        // consumes another one) and see which E production to follow.
        if (currentToken != EOF)
        {
            // We're not done, we we expect to have an op.
            checkToken("op");
            parseE();
        }
        else
        {
            // There is nothing else in the token stream, 
            // and that's cool since E --> digit is valid.
            putMessage("EOF reached");
        }
    }

    function checkToken(expectedKind)
    {
        // Validate that we have the expected token kind and et the next token.
        switch(expectedKind)
        {
            case "digit":   putMessage("Expecting a digit");
                            if (currentToken=="0" || currentToken=="1" || currentToken=="2" || 
                                currentToken=="3" || currentToken=="4" || currentToken=="5" || 
                                currentToken=="6" || currentToken=="7" || currentToken=="8" || 
                                currentToken=="9")
                            {
                                putMessage("Got a digit!");
                            }
                            else
                            {
                                errorCount++;
                                putMessage("NOT a digit.  Error at position " + tokenIndex + ".");
                            }
                            break;
            case "op":      putMessage("Expecting an operator");
                            if (currentToken=="+" || currentToken=="-")
                            {
                                putMessage("Got an operator!");
                            }
                            else
                            {
                                errorCount++;
                                putMessage("NOT an operator.  Error at position " + tokenIndex + ".");
                            }
                            break;
            default:        putMessage("Parse Error: Invalid Token Type at position " + tokenIndex + ".");
                            break;			
        }
        // Consume another token, having just checked this one, because that 
        // will allow the code to see what's coming next... a sort of "look-ahead".
        currentToken = getNextToken();
    }

    function getNextToken()
    {
        var thisToken = EOF;    // Let's assume that we're at the EOF.
        if (tokenIndex < tokens.length)
        {
            // If we're not at EOF, then return the next token in the stream and advance the index.
            thisToken = tokens[tokenIndex];
            putMessage("Current token:" + thisToken.value);
            tokenIndex++;
        }
        return thisToken;
    }