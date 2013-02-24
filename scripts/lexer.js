/* lexer.js  */

    function lex()
    {
        // Grab the source code.
        var sourceCode = $("#taSourceCode").val();

        // Set the default test program.
		sourceCode = testProgramOne;

        // Trim the leading and trailing spaces.
        sourceCode = trim(sourceCode);

        // Check if there is source code.
        if(sourceCode.length > 0){
			// Check for the end of file symbol.
			if(sourceCode.indexOf(sourceCode.length - 1) !== EOF){
				// If the end symbol is not found, then add it to the end of the source code.
				sourceCode = sourceCode + EOF;

                // Warn that the end of file symbol was not found.
                putMessage("WARNING: EOF symbol not found. Adding EOF symbol.");
			}

            // Create token object.
            var token = new Token();

            // Divide the source code by lines.
            sourceLines = sourceCode.split("\n");

            // Iterate through each linePosition.
            for(var linePosition = 0; linePosition < sourceLines.length; linePosition++)
            {
                // Store the current working linePosition.
                var currentLine = sourceLines[linePosition];

                // Iterate through the characters in the current linePosition.
                for(var characterPosition = 0; characterPosition < currentLine.length; characterPosition++)
                {
                    // Store the current working characterPosition.
                    var currentCharacter = currentLine[characterPosition];

                    //TODO: Check for whitespace delimiter.

                    // Checking for characterPosition lists (Strings).
                    if(currentCharacter == '"')
                    {
                        // character list found.
                        isCharList = true;

                        // Save the position of the starting quote.
                        var startQuotePosition = characterPosition;
                        var endQuotePosition = 0;

                        // Create a token for a quote.
                        token.create(TOKEN_QUOTE, linePosition, startQuotePosition, "\"" ,"Open Quote");

                        // Loop through the characters until the end quote is found.
                        while(isCharList && endQuotePosition != -1)
                        {
                            // Start search for the end quote after the open quote.
                            endQuotePosition = currentLine.indexOf('"', startQuotePosition + 1);

                            // Check if the end quote was found.
                            if(endQuotePosition != -1)
                            {
                                // End quote found.

                                // Check if it's the end quote or an escape sequence.
                                if(currentLine.charAt(endQuotePosition - 1) !== "\\")
                                {
                                    // End quote found, create charList token.
                                    var charListValue = sourceLines.slice(startQuotePosition + 1, endQuotePosition);
                                    token.create(TOKEN_CHARLIST,linePosition,characterPosition,charListValue, "Char List");

                                    // Add charList token to the token stream.
                                    token_stream.push(token);

                                    // Add the end quote token to token stream.
                                    token.create(TOKEN_QUOTE,linePosition,endQuotePosition,"\"","End Quote");

                                    // Add end quote token to token stream.
                                    token_stream.push(token);

                                    // End of charList.
                                    isCharList = false;
                                }
                            }
                            else
                            {
                                // Error, no end quote found.
                                putMessage("ERROR: Unterminated string. Expected '\"'.");
                            }

                            // Set the characterPosition position to the end quote.
                            characterPosition = endQuotePosition;

                        }// End end quote check.

                    } // End Quote check.
                    

                }

            }

        }
        else {
        // No Source code found.
        putMessage("Error: No source code found.");
        }

        // TODO: remove all spaces in the middle; remove linePosition breaks too.
        return sourceCode;
    }

