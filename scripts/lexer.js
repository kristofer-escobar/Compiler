/* lexer.js  */

    function lex()
    {
        // Get the source code.
        var sourceCode = $("#taSourceCode").val();

        // Set the default test program. (For Testing purposes only.)
		sourceCode = smallTest2;

        // Trim the leading and trailing spaces.
        sourceCode = trim(sourceCode);

        // Check if there is source code.
        if(sourceCode.length > 0)
        {
			// Check for the end of file symbol.
            if(sourceCode.indexOf(EOF) == -1)
            {
                // End of symbol was not found, but it will be added.
                sourceCode = sourceCode + EOF;
                putMessage("WARNING: EOF symbol not found, but has been added.");
            }

            // Check if the end of file symbol is at the end of the file.
            if(sourceCode.indexOf(EOF) != sourceCode.length - 1)
            {
                putMessage("WARNING: All content after EOF symbol will be disregarded");
            }

            // Divide the source code into lines.
            sourceLines = sourceCode.split("\n");
//debugger;
            // Find which line ends with the end of file symbol.
            var sourceEndPosition = checkForEOF(sourceLines);

            // Iterate through each line.
            for(var linePosition = 0; linePosition < sourceEndPosition; linePosition++)
            {
//debugger;
                // Store the current working line.
                var currentLine = sourceLines[linePosition].trim();

                // Store the start position of the current lexeme.
                lexemeStartPosition = 0;

                // Iterate through the characters in the current linePosition.
                for(var characterPosition = 0; characterPosition < currentLine.length; characterPosition++)
                {
                    // Store the current working characterPosition.
                    var currentCharacter = currentLine[characterPosition];

                    //Check for a delimiter.
                    if(REGEX_SPACE.test(currentCharacter) || characterPosition == (currentLine.length - 1) || currentCharacter == EOF)
                    {
//debugger;
                        if(currentCharacter == EOF)// Reached end of file.
                        {
//debugger;
                            // Get all characters in the current lexeme up to and including the eof symbol.
                            currentLexeme = currentLine.slice(lexemeStartPosition, currentLine.indexOf(EOF)+1);

                            // Check if the eof symbol is included with other lexemes.
                            if(currentLexeme.length > 1)
                            {
                                // Remove the end of file symbol from current lexeme.
                                currentLexeme = currentLexeme.slice(0, currentLexeme.indexOf(EOF));
                            }
                            else
                            {
                                // End of file symbol found, end of file reached.
                                continue;
                            }

                        }// End of EOF check.
                        else if(REGEX_SPACE.test(currentCharacter))// Reached a whitespace.
                        {
                            // Get the current lexeme.
                            currentLexeme = currentLine.slice(lexemeStartPosition, characterPosition);
                        }
                        else// Reached end of line.
                        {
//debugger;
                            // Get the current lexeme.
                            currentLexeme = currentLine.slice(lexemeStartPosition, currentLine.length);
                        }
//debugger;
                        // Check if the lexeme is in the lexicon.
                        var tokenKind = checkLexicon(currentLexeme);

                        if(tokenKind !== null)
                        {
                            //Found in lexicon.
                            tokenize(tokenKind,linePosition,characterPosition,currentLexeme);
                        }
                        else
                        {
                            if(isChar(currentLexeme))
                            {
                                // Found a characer.
                                tokenize(TOKEN_IDENTIFIER,linePosition,characterPosition,currentLexeme);
                            }
                            else if(isDigit(currentLexeme))
                            {
                                // Found a digit.
                                tokenize(TOKEN_DIGIT,linePosition,characterPosition,currentLexeme);
                            }
                            else
                            {
                                // Unknown lexeme.
                                putErrorMessage("Invalid token.",linePosition,characterPosition);
                            }
                        }

                        // Increment lexeme start position.
                        lexemeStartPosition = characterPosition + 1;

                        continue;

                    } // End Whitespace check.

                    // Checking for character lists (Strings).
                    if(currentCharacter == '"')
                    {
//debugger;
                        // character list found.
                        isCharList = true;

                        // Save the position of the starting quote.
                        var startQuotePosition = characterPosition;

                        var endQuotePosition = 0;

                        // Create a token for a quote.
                        tokenize(TOKEN_QUOTE, linePosition, startQuotePosition, currentCharacter);



                        

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
                                    var charListValue = currentLine.slice(startQuotePosition + 1, endQuotePosition).trim();
                                    tokenize(TOKEN_CHARLIST,linePosition,characterPosition,charListValue);

                                    // Add the end quote token to token stream.
                                    tokenize(TOKEN_QUOTE,linePosition,endQuotePosition,currentCharacter);

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

                        continue;
                    } // End Quote check.

                }

            }

        }
        else
        {
            // No Source code found.
            putMessage("ERROR: No source code found.");
        }

        // TODO: remove all spaces in the middle; remove linePosition breaks too.
        return token_stream;
    }

