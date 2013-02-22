/* lexer.js  */

    function lex()
    {
        // Grab the "raw" source code.
        //var sourceCode = document.getElementById("taSourceCode").value;
        var sourceCode = $("#taSourceCode").val();

        // Set the default test program.
		sourceCode = testProgramOne;

        // Trim the leading and trailing spaces.
        sourceCode = trim(sourceCode);

        // Check if there is source code.
        if(sourceCode.length > 0){
			// Check for end of file symbol.
			if(sourceCode.indexOf(sourceCode.length - 1) !== EOF){
				// If the end symbol is not found, then add it to the end of the source code.
				sourceCode = sourceCode + EOF;
			}
        }
        else {
        // No Source code found.
        putMessage("Error: No source code found.");
        }

        // TODO: remove all spaces in the middle; remove line breaks too.
        return sourceCode;
    }

