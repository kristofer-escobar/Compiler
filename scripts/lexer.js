function Lexer(){
    this.tokenStream = [];

    this.lex = function(){
        // Get the source code.

        var sourceCode = $("#taSourceCode").val();

        // Trim the leading and trailing spaces.
        sourceCode = sourceCode.trim();

        // Check if there is source code.
        if(sourceCode.length <= 0){
            putMessage("Error: No source code found.");
            return null;
        } // End if
        // Check for the end of file symbol.
        if(sourceCode.indexOf(EOF) == -1){
            // End of symbol was not found, but it will be added.
            sourceCode = sourceCode + EOF;

            putWarningMessage("EOF symbol not found, but has been added.",0,0);
        } // End if

        // Divide the source code into lines.
        sourceLines = sourceCode.split("\n");

        // Find which line has the end of file symbol.
        var lineEndPosition = checkForEOF(sourceLines);

        // Check if the end of file symbol is at the end of the file.
        if(sourceCode.indexOf(EOF) != sourceCode.length - 1){
            putWarningMessage("All content after EOF symbol will be disregarded",(lineEndPosition-1), sourceLines[lineEndPosition-1].indexOf(EOF)+1);
        } // End if
        // Iterate through each line.
        for(var linePosition = 0; linePosition < lineEndPosition; linePosition++){
            // Store the current working line.
            var currentLine = sourceLines[linePosition].trim();

            // Store the start position of the current lexeme.
            lexemeStartPosition = 0;

            // Store the value of the last character in the line.
            var LineEndPosition = currentLine.length;

            // Find the position of the EOF symbol.
            if(linePosition == (lineEndPosition - 1)){
                LineEndPosition = sourceLines[linePosition].indexOf(EOF) + 1;
            } // End if

            // Iterate through the characters in the current linePosition.
            for(var characterPosition = 0; characterPosition < LineEndPosition; characterPosition++){
                // Store the current working characterPosition.
                var currentCharacter = currentLine[characterPosition];
    //debugger;
                //Check for a delimiter. (Whitespace, last chatacter, and eof symbol)
                if((REGEX_SPACE.test(currentCharacter) || characterPosition == (currentLine.length - 1) || currentCharacter == EOF) && !inCharList){
                    if(currentCharacter == EOF){ // Reached end of file.
                        // Get all characters in the current lexeme up to and including the eof symbol.
                        currentLexeme = currentLine.slice(lexemeStartPosition, currentLine.indexOf(EOF)+1);

                        // Check if the eof symbol is included with other lexemes.
                        if(currentLexeme.length > 1){
                            // Remove the end of file symbol from current lexeme.
                            currentLexeme = currentLexeme.slice(0, currentLexeme.indexOf(EOF));
                        } else{
                            // End of file symbol found, end of file reached.
                            continue;
                        } // End else

                    } else if(REGEX_SPACE.test(currentCharacter)){ // Reached a whitespace.
                        if(characterPosition > lexemeStartPosition){
                            // Get the current lexeme.
                            currentLexeme = currentLine.slice(lexemeStartPosition, characterPosition);
                        } else{
                            lexemeStartPosition = lexemeStartPosition + 1;
                            continue;
                        } // End else
                    } else{ // Reached end of line.
                        // Get the current lexeme.
                        currentLexeme = currentLine.slice(lexemeStartPosition, currentLine.length);
                    } // End else

                    // Check if the lexeme is in the lexicon.
                    var tokenKind = checkLexicon(currentLexeme);

                    if(tokenKind !== null){
                        //Found in lexicon.
                        tokenize(tokenKind,linePosition,characterPosition,currentLexeme, this.tokenStream);
                    } else{
                        if(isChar(currentLexeme)){
                            // Found a characer.
                            tokenize(TOKEN_IDENTIFIER,linePosition,characterPosition,currentLexeme, this.tokenStream);
                        } // End else
                        else if(isDigit(currentLexeme)){
                            // Found a digit.
                            tokenize(TOKEN_DIGIT,linePosition,characterPosition,currentLexeme, this.tokenStream);
                        } else if(isTerminal(currentCharacter)){
                            // Check if there is a lexeme attached to the terminal.
                            if(characterPosition > lexemeStartPosition){
                                currentLexeme = currentLine.slice(lexemeStartPosition, characterPosition);
                                //alert(currentLexeme);
                                var t_kind = checkLexicon(currentLexeme);

                                if(t_kind !== null){
                                    //Found in lexicon.
                                    tokenize(t_kind,linePosition,characterPosition,currentLexeme, this.tokenStream);
                                } else{
                                    if(isChar(currentLexeme)){
                                        // Found a characer.
                                        tokenize(TOKEN_IDENTIFIER,linePosition,characterPosition,currentLexeme, this.tokenStream);
                                    } // End else
                                    else if(isDigit(currentLexeme)){
                                        // Found a digit.
                                        tokenize(TOKEN_DIGIT,linePosition,characterPosition,currentLexeme, this.tokenStream);
                                    } else{
                                        // Unknown lexeme.
                                        putErrorMessage("Invalid token",linePosition,characterPosition);
                                    } // End else
                                } // End else

                                lexemeStartPosition = characterPosition + 1;
                            }// End if

                            // Found a terminal.
                            tokenize(getTerminal(currentCharacter),linePosition,characterPosition,currentCharacter, this.tokenStream);
                            lexemeStartPosition = lexemeStartPosition + 1;
                            continue;
                } else{
                            // Unknown lexeme.
                            putErrorMessage("Invalid token.",linePosition,characterPosition);
                        } // End else
                    } // End else

                    // Increment lexeme start position.
                    lexemeStartPosition = characterPosition + 1;

                    continue;

                } // End Whitespace check.

                // Checking for character lists (Strings).
                if(currentCharacter == '"' || inCharList){
                    if(!inCharList){
                        // character list found.
                        inCharList = true;

                        // Save the position of the starting quote.
                         startQuotePosition = characterPosition;

                        // Create a token for a quote.
                        tokenize(TOKEN_QUOTE, linePosition, startQuotePosition, currentCharacter, this.tokenStream);

                        // Check for end quote.
                        if(currentLine.indexOf("\"", startQuotePosition + 1) == -1){
                            inCharList = false;
                            putErrorMessage("CharList is not properly closed by a double-quote",linePosition,characterPosition);
                        } // End if

                        lexemeStartPosition = characterPosition + 1;

                        continue;
                    } // End if

                    while(inCharList){
                        if(currentCharacter == "\""){
                            inCharList = false;

                            if(isCharList(charListValue)){
                                // Add charList to token stream.
                                tokenize(TOKEN_CHARLIST, linePosition, startQuotePosition, charListValue, this.tokenStream);
                                charListValue = "";
                            } else{
                                putErrorMessage("Invalid charList.",linePosition, characterPosition);
                            } // End else

                            // Add end quote to token stream.
                            tokenize(TOKEN_QUOTE, linePosition, startQuotePosition, currentCharacter, this.tokenStream);

                            lexemeStartPosition = characterPosition + 1;

                            continue;
                        } // End if

                        //if(currentCharacter !== " "){
                            charListValue = charListValue + currentCharacter;
                        //} // End if

                        // Move to the next character.
                        characterPosition = characterPosition + 1;
                        currentCharacter = currentLine[characterPosition];

                    } // End of while.

                    lexemeStartPosition = characterPosition + 1;

                    continue;
                } // End Quote check.
//debugger;
                // Check for terminals.
                if(isTerminal(currentCharacter)){
                    // Check if there is a lexeme attached to the terminal.
                    if(characterPosition > lexemeStartPosition){
                        currentLexeme = currentLine.slice(lexemeStartPosition, characterPosition);
                        //alert(currentLexeme);
                        var t_kind = checkLexicon(currentLexeme);

                        if(t_kind !== null){
                            //Found in lexicon.
                            tokenize(t_kind,linePosition,characterPosition,currentLexeme, this.tokenStream);
                        } else{
                            if(isChar(currentLexeme)){
                                // Found a characer.
                                tokenize(TOKEN_IDENTIFIER,linePosition,characterPosition,currentLexeme, this.tokenStream);
                            } // End else
                            else if(isDigit(currentLexeme)){
                                // Found a digit.
                                tokenize(TOKEN_DIGIT,linePosition,characterPosition,currentLexeme, this.tokenStream);
                            } else{
                                // Unknown lexeme.
                                putErrorMessage("Invalid token",linePosition,characterPosition);
                            } // End else
                        } // End else

                        lexemeStartPosition = characterPosition + 1;
                    }// End if

                    if(currentCharacter == "="){
                        //debugger;
                        var nextCharacter = currentLine[characterPosition + 1];
                        if(nextCharacter == "=" ){
                            var tempTerminal = getTerminal(currentCharacter + "=");
                            // Found the equality operator, which is not to be confused with the equal siqn.
                            tokenize(tempTerminal,linePosition,characterPosition,currentCharacter + "=", this.tokenStream);

                            // Move up two characters.
                            characterPosition = characterPosition + 1;

                            lexemeStartPosition = lexemeStartPosition + 2;
                            continue;
                        }
                    } 

                    // Found a terminal.
                    tokenize(getTerminal(currentCharacter),linePosition,characterPosition,currentCharacter, this.tokenStream);
                    lexemeStartPosition = lexemeStartPosition + 1;
                    continue;
                } else if(isChar(currentCharacter)){
                    // peek ahead one character.
                    if((characterPosition + 1) < currentLine.length){
                        var nextCharacter = currentLine[characterPosition + 1];
                        if((!isChar(nextCharacter) || isTerminal(nextCharacter)) && ((characterPosition - lexemeStartPosition) <= 1)) {
                            // Found a characer.
                            tokenize(TOKEN_IDENTIFIER,linePosition,characterPosition,currentCharacter, this.tokenStream);
                            lexemeStartPosition = lexemeStartPosition + 1;
                            continue;
                        } // End if

                    } // End if
                } else if(isDigit(currentCharacter)){
                    // Found a digit.
                    tokenize(TOKEN_DIGIT,linePosition,characterPosition,currentCharacter, this.tokenStream);
                    lexemeStartPosition = lexemeStartPosition + 1;
                    continue;
                } // End else

            } // End of For each character.

        } // End of For each line.

        // Return token stream.
        return this.tokenStream;
    }; // End lex function.
}// End lexer object.