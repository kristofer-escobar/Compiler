/*
* codeGen.js
*/

function CodeGeneration(AST){

// Instance of a code generator.
var cg = {};

// Variable to hold the generated code.
cg.code = [];

// Static table.
cg.staticTable = new StaticTable();

// Jump table.
cg.jumpTable = new JumpTable();

// Array to keep track of scope.
var scopes = [];

// Index for the next value to be added.
var addIndex = 0;

// Index for the next value to be added at the end of the memory.
var endIndex = 255;

// Function to fill code with zeroes.
function initCode(){

	// Initialize the code with all 00's.
	for(var i = 0; i < 256; i++){

		cg.code[i] = "00";
	}

}

// Function to add code to the code array.
function addCode(code){

	// Convert string of code into an array.
	var temp = code.split(" ");

	// Store each instruction into the code array.
	for(var i = 0; i < temp.length ; i++){

		// Store the insruction into code array.
		cg.code[addIndex] = temp[i];

		// Increase add index of next stored instruction.
		addIndex++;
	}

} // End addCode


// Function to put strings at the end of the code array.
function putString(string){

	// Null terminated string.
	cg.code[endIndex] = "00";

	// Decrease the postiion for the next character to be added.
	endIndex--;

	// Split the string into a character array.
	var temp = string.split("");

	// Reverse the order of the string.
	temp.reverse();

	// Add each character to the end of the code array. 
	for(var i = 0; i < temp.length ; i++){

		cg.code[endIndex] = temp[i].charCodeAt(0).toString(16).toUpperCase();

		// Decrease the index.
		endIndex--;
	}

}

// Function to generate code.
cg.generate = function() {

	initCode();

	if(verboseMode){
        putMessage("Generating code.");
    } // End if

    var traversalResult = "";

	// Keeps track of scope level.
	var scopeLevel = 0;

    // Recursive function to handle the expansion of the nodes.
    function expand(node, depth){

        // Check for leaf nodes.
        if (!node.children || node.children.length === 0){
			if(node.name == "{"){
				scopeLevel++;
			}

			if(node.name == "}"){
				scopeLevel--;
			}
        } // End If

        // Reduce the scope level.
		if(scopes.length > 0){
			if(scopes[scopes.length - 1].depth == depth){

				scopes.pop();
			}
		}

        // Increse the of scope.
        if(node.name == "block"){

			scopeLevel++;

			var scopeObj = { scope: scopeLevel,
							depth: depth };

			scopes.push(scopeObj);
        }


        // Handle each branch.

        if(node.name == "declare"){
			declare(node);
        }

		if(node.name == "assign"){
			assign(node);
		}

		if(node.name == "equality"){
			equality(node);
		}

		if(node.name == "print"){
			print(node);
		}

		if(node.name == "while"){
			addCode("while");
		}

		if(node.name == "if"){
			if_statement(node);
			return;
		}


		traversalResult +=  node.name + " ";

        // Recursive call to expand.
        for (var j = 0; j < node.children.length; j++){
            expand(node.children[j], depth + 1);
        } //  End for

    } // End expand

    // Initial call to expand.
    expand(AST.rootNode, 0);

    // End program.
    addCode("00");

    // Back patch jumps.
    backPatchJump();

    // Back patch static variables.
    backPatch();

}; // End generate

// Return code generated.
cg.toString = function() {
	return cg.code.join(" ");
};


function if_statement(node){
	var jump = "";

	// Handle condition.
	if(node.children[0].name == "equality"){
		jump = equality(node.children[0]);
	} else if(node.children[0].name == "true"){
		jump = makeTrue();
	} else if (node.children[0].name == "false"){
		jump = makeFalse();
	}

	// Handle expression.
	if(node.children[1].name == "declare"){
		declare(node.children[1]);
	} else if(node.children[1].name == "assign"){
		assign(node.children[1]);
	} else if(node.children[1].name == "print"){
		print(node.children[1]);
	}else{

	}


	// Calculate jump offset.
	var codeArray = cg.code;

	var jumpStartIndex = codeArray.indexOf(jump);

	var jumpEndIndex = addIndex -1;

	var jumpOffset = jumpEndIndex - jumpStartIndex;

	// Add jump offset to jump table.
	cg.jumpTable.table[jump].address = jumpOffset;

}

function makeTrue(){

	var jump = cg.jumpTable.add();
	addCode("AE 10 00 EC 10 00 D0 " + jump);

	return jump;
}

function makeFalse(){

	var jump = cg.jumpTable.add();
	addCode("AE 00 00 EC 01 00 D0 " + jump);

	return jump;
}

function equality(node){
	if(node.parent.name == "if"){

		// Compare a variable to another variable.
		if(isChar(node.children[0].name) && isChar(node.children[1].name)){

			// Load the X-register from memory.
			addCode("AE " + cg.staticTable.table[node.children[0].name + scopes[scopes.length - 1].scope].temp);

			// Compare memory to the X-register, set z-flag if equal.
			addCode("EC " + cg.staticTable.table[node.children[1].name + scopes[scopes.length - 1].scope].temp);
		} else if(isChar(node.children[0].name) && isDigit(node.children[1].name)){

			var tempValue = "";

			if(node.children[1].name.toString().length == 1){

				tempValue = "0" + node.children[1].name;
			}

			// Load the X-register from memory.
			addCode("A2 " + tempValue);

			// Compare memory to the X-register, set z-flag if equal.
			addCode("EC " + cg.staticTable.table[node.children[0].name + scopes[scopes.length - 1].scope].temp);
		}

		// Add entry into the static table.
		var jump = cg.jumpTable.add();

		// Branch on not equal.
		addCode("D0 " + jump);

		return jump;
	}

}

// Function to handle code generation for declarations.
function declare(node){

	// Add entry into the static table.
	cg.staticTable.add(node.children[1].name, scopes[scopes.length - 1].scope);

	// If the declaration is not a string, then load the memory with zero.
	if(node.children[0].name != "string"){

		// Load the accumulator with zero.
		addCode("A9 00");

		// Store the accumulator into memory.
		addCode("8D " + cg.staticTable.table[node.children[1].name + scopes[scopes.length - 1].scope].temp);

	}
}

// Function to handle code generation for the assignments.
function assign(node){

	// Get the value to be assigned.
	var tempVal = node.children[1].name;

	// If the value is a variable get the location of that temporary variable.
	if(isChar(tempVal)){

		// Load the accumulator from memory.
		addCode("AD " + cg.staticTable.table[tempVal + scopes[scopes.length - 1].scope].temp);
	} else if(isDigit(tempVal)){

		// If the value is a single digit prepend a zero.
		if(tempVal.length == 1){

			tempVal = "0" + tempVal;
		}

		// Load the accumulator with the digit value.
		addCode("A9 " + tempVal);
	}else{

		// Put string at the end of the memory.
		putString(tempVal);

		// Load the accumulator with the stating index of the string.
		addCode("A9 " + (endIndex + 1).toString(16).toUpperCase());
	}

	// Store the accumulator in memory.
	addCode("8D " + cg.staticTable.table[node.children[0].name + scopes[scopes.length - 1].scope].temp);

}

// Function to handle code generation for prints.
function print(node){

	// Load the Y-register from memory.
	addCode("AC " + cg.staticTable.table[node.children[0].name + scopes[scopes.length - 1].scope].temp);

	var temp = symbolTableLookUp(node.children[0].name , scopes[scopes.length - 1].scope);

	// Load the X-register with a 02 if printing strings, else load 01.
	if(temp.type == "string"){

		// Load the X-register with a constant.
		addCode("A2 02");
	}else{

		// Load the X-register with a constant.
		addCode("A2 01");
	}

	// System call.
	addCode("FF");
}

// Function to handle code back patching.
function backPatch(){

	// Find the index of where the static values end.
	var staticTableStart = (addIndex).toString(16);

	// Replace all temporary values.
	for(var i in cg.staticTable.table){

		var littleEndian = cg.staticTable.table[i].temp.substring(0,2);

		for(var j = 0; j < cg.code.length; j++){

			if(cg.code[j] == littleEndian){

				cg.code[j] = staticTableStart.toUpperCase();

				cg.code[j+1] = "00";
			}

		}

		// Convert to decimal and add one.
		staticTableStart = parseInt(staticTableStart, 16) + 1;

		// Convert to hex.
		staticTableStart = staticTableStart.toString(16);

	} // End for loop.

} // End function backPatch.


function backPatchJump(){

	// Replace all temporary jump values.
	for(var i in cg.jumpTable.table){

		// Get jump offset.
		var offset = cg.jumpTable.table[i].address;

		// Prepend a zero.
		if(offset.toString().length == 1){

			cg.code[cg.code.indexOf(i)] = "0" + offset;
		} else{

			cg.code[cg.code.indexOf(i)] = offset;
		}

	} // End for loop.

} // End function backPatchJump.


// Call to begin code generation.
cg.generate();

// Return code generation object.
return cg;

} // End CodeGeneration.

