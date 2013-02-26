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
//debugger;
            // Check for the end of file symbol.
            if(sourceCode.indexOf(EOF) == -1)
            {
                // End of symbol was not found, but it will be added.
                sourceCode = sourceCode + EOF;

                putWarningMessage("EOF symbol not found, but has been added.",0,0);
            }

            // Divide the source code into lines.
            sourceLines = sourceCode.split("\n");

            // Find which line has the end of file symbol.
            var lineEndPosition = checkForEOF(sourceLines);

            // Check if the end of file symbol is at the end of the file.
            if(sourceCode.indexOf(EOF) != sourceCode.length - 1)
            {
                putWarningMessage("All content after EOF symbol will be disregarded",(lineEndPosition-1), sourceLines[lineEndPosition-1].indexOf(EOF)+1);
            }

            // Iterate through each line.
            for(var linePosition = 0; linePosition < lineEndPosition; linePosition++)
            {
//debugger;
                // Store the current working line.
                var currentLine = sourceLines[linePosition].trim();

                // Store the start position of the current lexeme.
                lexemeStartPosition = 0;

                // Store the value of the last character in the line.
                var characterEndPosition = currentLine.length;

                // Find the position of the EOF symbol.
                if(linePosition == (lineEndPosition - 1))
                {
                    characterEndPosition = sourceLines[linePosition].indexOf(EOF) + 1;
                }

                // Iterate through the characters in the current linePosition.
                for(var characterPosition = 0; characterPosition < characterEndPosition; characterPosition++)
                {
                    // Store the current working characterPosition.
                    var currentCharacter = currentLine[characterPosition];

                    //Check for a delimiter.
                    if((REGEX_SPACE.test(currentCharacter) || characterPosition == (currentLine.length - 1) || currentCharacter == EOF) && !inCharList)
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
                    if(currentCharacter == '"' || inCharList)
                    {
//debugger;
                        if(!inCharList)
                        {
                            // character list found.
                            inCharList = true;

                            // Save the position of the starting quote.
                             startQuotePosition = characterPosition;

                            // Create a token for a quote.
                            tokenize(TOKEN_QUOTE, linePosition, startQuotePosition, currentCharacter);

                            // Check for end quote.
                            if(currentLine.indexOf("\"", startQuotePosition + 1) == -1)
                            {
                                inCharList = false;
                                putErrorMessage("CharList is not properly closed by a double-quote",linePosition,characterPosition);
                            }

                            lexemeStartPosition = characterPosition + 1;

                            continue;
                        }

                        while(inCharList)
                        {
                            if(currentCharacter == "\"")
                            {
                                inCharList = false;

                                if(isCharList(charListValue))
                                {
                                    // Add charList to token stream.
                                    tokenize(TOKEN_CHARLIST, linePosition, startQuotePosition, charListValue);
                                    charListValue = "";
                                }
                                else
                                {
                                    putErrorMessage("Invalid charList.",linePosition, characterPosition);
                                }

                                // Add end quote to token stream.
                                tokenize(TOKEN_QUOTE, linePosition, startQuotePosition, currentCharacter);

                                lexemeStartPosition = characterPosition + 1;

                                continue;
                            }

                            if(currentCharacter !== " ")
                            {
                                charListValue = charListValue + currentCharacter;
                            }

                            // Move to the next character.
                            characterPosition = characterPosition + 1;
                            currentCharacter = currentLine[characterPosition];

                        } // End of while.

                        lexemeStartPosition = characterPosition + 1;

                        continue;
                    } // End Quote check.

                }

            }

        }
        else
        {
            // No Source code found.
            putErrorMessage("No source code found.",0,0);
        }

        // TODO: remove all spaces in the middle; remove linePosition breaks too.
        return token_stream;
    }

