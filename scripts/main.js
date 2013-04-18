//main.js

/*
 * This is executed as a result of the user pressing the 
 *"compile" button.
 */

var verboseMode = false;

function run(){        
	// Initialize variable and text areas.
    init();

    // Display  starting message.
    putMessage("Compilation Started.");

    // Create an instance of a lexer object.
    var lexer = new Lexer();

    // Grab the tokens from the lexer.
    var tokens = lexer.lex();

    // If tokens is null then lex did not succeed.
    if(tokens !== null){
		// Display errors and warning for lex.
        putMessage("Lexer found " + warningCount + " warning(s)" + " and " + errorCount + " error(s).");   
        
        // If there are no lex errors, then parse.
        if(!errorsFound){
			// Create a string of the tokens returned by lex.
			var tokenString = getTokenValues(tokens);

			// Display tokens returned from lex.
            putMessage("Lex returned [" + tokenString + "]");

            // Create an instance of a parser object.
            var parser = new Parser(tokens);

            // Begin parsing tokens.
            parser.parse();   

            // Check if parse produced any errors. 
            if(!errorsFound){
			// Create AST

			// Display symbol table.
			document.getElementById("taSymbolTable").value +=  parser.scope.buildSymbolTable();

			//var entry = symbolTableLookUp("a",1);

			//alert(entry.value);

			//putMessage(" and " + warningCount + " warning(s)");
				
                //document.getElementById("taSymbolTable").value += getSymbolTable() + "\n";

                // Display parse tree.
                document.getElementById("parseTree").value = parser.tree.toString();

                var ast = new AST(parser.tree);

                //ast.build(parser.tree.rootNode,0);
                var test = ast.toString();

                document.getElementById("parseTree").value += "\n" + ast.toString();

            } // End if       
        } else{ // Parse errors were found. 
			// Display parse errors.
            putMessage("Failed to parse due to lexical errors.");
        } // End else

    }// End null check.

} // End run.