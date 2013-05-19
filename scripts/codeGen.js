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
			scopeLevel++;

			var scopeObj = { scope: scopeLevel,
							depth: depth };

			scopes.push(scopeObj);

			whileLoop(node);

			scopes.pop();
			return;
		}

		if(node.name == "if"){
			scopeLevel++;

			var scopeObj = { scope: scopeLevel,
							depth: depth };

			scopes.push(scopeObj);

			if_statement(node);

			scopes.pop();
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

// Handle code generation for boolean expressions.
function boolExpr(bool){

	var jump = "";

	// Handle condition.
	if(bool.name == "equality"){

		if(bool.children[0].name == "equality"){
			bool.children[0].name = handleEquality(bool.children[0]);
		}

		if(bool.children[1].name == "equality"){
			bool.children[1].name = handleEquality(bool.children[1]);
		}

		jump = equality(bool);
	} else if(bool.name == "true"){
		jump = makeTrue();
	} else if (bool.name == "false"){
		jump = makeFalse();
	}

	return jump;
}

function handleEquality(node){

	var retVal = "";
	var valOne = node.children[0];
	var valTwo = node.children[1];
	var compareOne = "";
	var compareTwo = "";


	if(valOne.name == "equality"){
		valOne.name = handleEquality(valOne);
	}

	if(valTwo.name == "equality"){
		valTwo.name = handleEquality(valTwo);
	}

	if(valOne.name.toUpperCase() == "TRUE" || valOne.name.toUpperCase() == "FALSE" ){
		if(valOne.name.toUpperCase() == "TRUE"){
			valOne.name = "1";
		} else{
			valOne.name = "0";
		}
	}

	if(valTwo.name.toUpperCase() == "TRUE" || valTwo.name.toUpperCase() == "FALSE" ){
		if(valTwo.name.toUpperCase() == "TRUE"){
			valTwo.name = "1";
		} else{
			valTwo.name = "0";
		}
	}

	if(isChar(valOne.name) && isChar(valTwo.name)){ // Two variables.

		compareOne = symbolTableLookUp(valOne.name, scopes[scopes.length - 1].scope).value;

		compareTwo = symbolTableLookUp(valOne.name, scopes[scopes.length - 1].scope).value;

		if(compareOne == compareTwo){ // TRUE
			retVal = "1";
		}else // FALSE
		{
			retVal = "0";
		}

	}else if( (isChar(valOne.name) && isDigit(valTwo.name)) || (isDigit(valOne.name) && isChar(valTwo.name)) ){ // A variable and a digit.

		if(isChar(valOne.name)){ // First is a variable.

			compareOne = symbolTableLookUp(valOne.name, scopes[scopes.length - 1].scope).value;

		}else{ // Second is a variable.
			compareOne = symbolTableLookUp(valTwo.name, scopes[scopes.length - 1].scope).value;
		}

		if(isDigit(valOne.name)){
			compareTwo = valOne.name;
		}else{
			compareTwo = valTwo.name;
		}

		if(compareOne == compareTwo){ // TRUE
			retVal = "1";
		}else // FALSE
		{
			retVal = "0";
		}

	}else if(isDigit(valOne.name) && isDigit(valTwo.name)){ // Two digits.

		if(valOne.name == valTwo.name){ // TRUE
			retVal = "1";
		}else // FALSE
		{
			retVal = "0";
		}

	}else{

	}

	return retVal;
}

function if_statement(node){
	var jump = "";

	var bool = node.children[0];

	// Handle boolean expression.
	jump = boolExpr(bool);

	var ifBlock = node.children[1];

	// Check if there is a statement in the if block.
	if(ifBlock.children[0]){

		// Handle if body.
		ifBody(ifBlock, 0);

	} // End check for statement.

	// Calculate jump offset.
	var codeArray = cg.code;

	var jumpStartIndex = codeArray.indexOf(jump);

	var jumpEndIndex = addIndex -1;

	var jumpOffset = jumpEndIndex - jumpStartIndex;

	// Add jump offset to jump table.
	cg.jumpTable.table[jump].address = jumpOffset.toString(16).toUpperCase();

} // Enf IF

// Handle code generation for while loops.
function whileLoop(node){
//debugger;
	var whileLoopStartIndex = addIndex;

	var jump = "";

	var bool = node.children[0];

	var flag = true;

	if(node.children[0].name.toUpperCase() == "FALSE"){
		flag = false;
	}

	// Handle boolean expression.
	jump = boolExpr(bool);

	var whileBlock = node.children[1];

	// Check if there is a statement in the while block.
	if(whileBlock.children[0]){

		// Handle if body.
		whileBody(whileBlock, 0);

	} // End check for statement.

	if(flag){
		// Unconditional jump back to the start of the while loop.
		var unconditionalJump = makeFalse();

		var unconditionalOffset = (256 - addIndex) + whileLoopStartIndex;

		cg.jumpTable.table[unconditionalJump].address = unconditionalOffset.toString(16).toUpperCase();
	}

	// Calculate jump offset.
	var codeArray = cg.code;

	var jumpStartIndex = codeArray.indexOf(jump);

	var jumpEndIndex = addIndex -1;

	var jumpOffset = jumpEndIndex - jumpStartIndex;

	// Add jump offset to jump table.
	cg.jumpTable.table[jump].address = jumpOffset.toString(16).toUpperCase();
}


function ifBody(ifBlock, index){

	if(ifBlock.children[0]){
		var expr = ifBlock.children[index];

		// Handle expression.
		if(expr.name == "declare"){
			declare(expr);
		} else if(expr.name == "assign"){
			assign(expr);
		} else if(expr.name == "print"){
			print(expr);
		}else if(expr.name == "if"){
			if_statement(expr);
		}else if(expr.name == "while"){
			whileLoop(expr);
		}else{

		} // End handle expression

		if(index === 0){
			for(var i = 1; i < ifBlock.children.length; i++){
				ifBody(ifBlock, i);
			}
		}


	} // End check for children.

} // End ifBody

function whileBody(whileBlock, index){
	if(whileBlock.children[0]){
		var expr = whileBlock.children[index];

		// Handle expression.
		if(expr.name == "declare"){
			declare(expr);
		} else if(expr.name == "assign"){
			assign(expr);
		} else if(expr.name == "print"){
			print(expr);
		}else if(expr.name == "if"){
			if_statement(expr);
		}else if(expr.name == "while"){
			whileLoop(expr);
		}else{

		} // End handle expression

		if(index === 0){
			for(var i = 1; i < whileBlock.children.length; i++){
				ifBody(whileBlock, i);
			}
		}


	} // End check for children.

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

		var valueOne = node.children[0];

		var valueTwo = node.children[1];

		var tempValue = "";

		// TREAT BOOLEAN VALUES AS DIGITS.

		if(valueOne.name.toUpperCase() == "TRUE" || valueOne.name.toUpperCase() == "FALSE"){
			if(valueOne.name.toUpperCase() == "TRUE"){
				valueOne.name = "1";
			}else{
				valueOne.name = "0";
			}
		}

		if(valueTwo.name.toUpperCase() == "TRUE" || valueTwo.name.toUpperCase() == "FALSE"){
			if(valueTwo.name.toUpperCase() == "TRUE"){
				valueTwo.name = "1";
			}else{
				valueTwo.name = "0";
			}
		}

		// Compare a variable to another variable.
		if(isChar(valueOne.name) && isChar(valueTwo.name)){

			var tempVal ="";

			var startScope = scopes.length - 1;

			if(cg.staticTable.table[node.children[0].name + scopes[startScope].scope]){
				tempVal = cg.staticTable.table[node.children[0].name + scopes[startScope].scope].temp;
			}else{
				while(!cg.staticTable.table[node.children[0].name + scopes[startScope].scope]){

					startScope = startScope - 1;
					if(cg.staticTable.table[node.children[0].name + scopes[startScope].scope]){
						tempVal = cg.staticTable.table[node.children[0].name + scopes[startScope].scope].temp;
					}

				}
			} // end else.

			// Load the X-register from memory.
			//addCode("AE " + cg.staticTable.table[node.children[0].name + scopes[scopes.length - 1].scope].temp);
			addCode("AE " + tempVal);

			tempVal ="";

			startScope = scopes.length - 1;

			if(cg.staticTable.table[node.children[1].name + scopes[startScope].scope]){
				tempVal = cg.staticTable.table[node.children[1].name + scopes[startScope].scope].temp;
			}else{
				while(!cg.staticTable.table[node.children[1].name + scopes[startScope].scope]){

					startScope = startScope - 1;
					if(cg.staticTable.table[node.children[1].name + scopes[startScope].scope]){
						tempVal = cg.staticTable.table[node.children[1].name + scopes[startScope].scope].temp;
					}

				}
			} // end else.

			// Compare memory to the X-register, set z-flag if equal.
			addCode("EC " + tempVal);

		} else if( (isChar(valueOne.name) && isDigit(valueTwo.name)) || (isDigit(valueOne.name) && isChar(valueTwo.name)) ) { // Compare a variable to a digit or digit to variable.

			if(isDigit(valueOne.name)){ // First value is a digit.
				tempValue = valueOne.name.toString();
			}else{ // Second value is a digit.
				tempValue = valueTwo.name.toString();
			}

			// Check if value has two bytes.
			if(tempValue.length == 1){
				tempValue = "0" + tempValue;
			}

			// Load the X-register from memory.
			addCode("A2 " + tempValue);

			if(isChar(valueOne.name)){ // First value is a variable.

				var tempVal ="";

				var startScope = scopes.length - 1;

				if(cg.staticTable.table[node.children[0].name + scopes[startScope].scope]){
					tempVal = cg.staticTable.table[node.children[0].name + scopes[startScope].scope].temp;
				}else{
					while(!cg.staticTable.table[node.children[0].name + scopes[startScope].scope]){

						startScope = startScope - 1;
						if(cg.staticTable.table[node.children[0].name + scopes[startScope].scope]){
							tempVal = cg.staticTable.table[node.children[0].name + scopes[startScope].scope].temp;
						}

					}
				} // end else.

				// Compare memory to the X-register, set z-flag if equal.
				//addCode("EC " + cg.staticTable.table[valueOne.name + scopes[scopes.length - 1].scope].temp);
				addCode("EC " + tempVal);


			}else{ // Second value is a variable.

			var tempVal ="";

			var startScope = scopes.length - 1;

			if(cg.staticTable.table[node.children[1].name + scopes[startScope].scope]){
				tempVal = cg.staticTable.table[node.children[1].name + scopes[startScope].scope].temp;
			}else{
				while(!cg.staticTable.table[node.children[1].name + scopes[startScope].scope]){

					startScope = startScope - 1;
					if(cg.staticTable.table[node.children[1].name + scopes[startScope].scope]){
						tempVal = cg.staticTable.table[node.children[1].name + scopes[startScope].scope].temp;
					}

				}
			} // end else.


				// Compare memory to the X-register, set z-flag if equal.
				//addCode("EC " + cg.staticTable.table[valueTwo.name + scopes[scopes.length - 1].scope].temp);
				addCode("EC " + tempVal);


			}

		} else{ // Both values to compare are digits.

			// HANDLE THE FIRST DIGIT.

			tempValue = valueOne.name.toString();

			// Check if value has two bytes.
			if(tempValue.length == 1){
				tempValue = "0" + tempValue;
			}

			// Load the X-register from memory.
			addCode("A2 " + tempValue);

			//HANDLE THE SECOND DIGIT.

			tempValue = valueTwo.name.toString();

			// Check if value has two bytes.
			if(tempValue.length == 1){
				tempValue = "0" + tempValue;
			}

			// Store the value of the second digit in the heap.
			cg.code[endIndex] = tempValue;

			// Get the value where it was stored.
			var secondDigitLocation = endIndex.toString(16).toUpperCase();

			// Move the heap index up.
			endIndex--;

			// Make sure the memory location is two bytes.
			if(secondDigitLocation.length ==1){
				secondDigitLocation = "0" + secondDigitLocation;
			}

			// Compare memory to the X-register, set z-flag if equal.
			addCode("EC " + secondDigitLocation + " 00");
		}

		// Add entry into the static table.
		var jump = cg.jumpTable.add();

		// Branch on not equal.
		addCode("D0 " + jump);

		return jump;

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

	var valOne = node.children[0];

	var valTwo = node.children[1];


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
	}else if(tempVal.toUpperCase() == "TRUE" || tempVal.toUpperCase() == "FALSE"){

		if(tempVal.toUpperCase() == "TRUE" ){

			// Load the accumulator with true or 01.
			addCode("A9 " + "01");
		} else{

			// Load the accumulator with false or 00.
			addCode("A9 " + "00");
		}

	} else if(tempVal == "+" || tempVal == "-"){ // Handle addition and subtraction.

		if(tempVal == "+"){
			tempVal = handleAddition(node.children[1]);
		} else{
			tempVal = handleSubtraction(node.children[1]);
		}

		// If the value is a single digit prepend a zero.
		if(tempVal.toString().length == 1){

			tempVal = "0" + tempVal;
		}

		// Added
		if(isChar(valTwo.children[1].name)){

			// Load the accumulator with the digit value.
			addCode("A9 " + tempVal);// load the value

			addCode("8D " + endIndex.toString(16).toUpperCase() + " 00"); // store value.

			var tempVal2 = findStaticValue(node.children[0].name);

			//addCode("AD " + cg.staticTable.table[node.children[0].name + scopes[scopes.length - 1].scope].temp); // load variable value
			addCode("AD " + tempVal2.temp);

			addCode("6D " + endIndex.toString(16).toUpperCase() + " 00"); // Add the value to the new value.

			endIndex--;
		}


	} else{

		// Put string at the end of the memory.
		putString(tempVal);

		// Load the accumulator with the stating index of the string.
		addCode("A9 " + (endIndex + 1).toString(16).toUpperCase());
	}


	var tempVal2 = findStaticValue(node.children[0].name);

	// Store the accumulator in memory.
	//addCode("8D " + cg.staticTable.table[node.children[0].name + scopes[scopes.length - 1].scope].temp);
	addCode("8D " + tempVal2.temp);




// var variable = JSON.parse(symbolTable[valOne.name + scopes[scopes.length - 1].scope]);
var variable = findSymbolTableEntry(valOne.name);

variable.value = tempVal;

// symbolTable[valOne.name + scopes[scopes.length - 1].scope] = JSON.stringify(variable);
symbolTable[valOne.name + variable.scope] = JSON.stringify(variable);

}

function findSymbolTableEntry(variable){

	var startScope = scopes.length - 1;

	var scopeValue = "";


	if(symbolTable[variable + scopes[startScope].scope]){

	return JSON.parse(symbolTable[variable + scopes[startScope].scope]);

	}else{

		while(!symbolTable[variable + scopes[startScope].scope]){

			startScope = startScope - 1;
			if(symbolTable[variable + scopes[startScope].scope]){
				return JSON.parse(symbolTable[variable + scopes[startScope].scope]);
			}

		}
	}
}


function findStaticValue(variable){

	var startScope = scopes.length - 1;

	var scopeValue = "";

	if(cg.staticTable.table[variable + scopes[startScope].scope]){
		scopeValue = cg.staticTable.table[variable + scopes[startScope].scope];
	}else{
		while(!cg.staticTable.table[variable + scopes[startScope].scope]){

			startScope = startScope - 1;
			if(cg.staticTable.table[variable + scopes[startScope].scope]){
				scopeValue = cg.staticTable.table[variable + scopes[startScope].scope];
			}

		}
	} // end else.	

	return scopeValue;
}



function handleAddition(node){

	var value = "0";
	var valOne = node.children[0];
	var valTwo = node.children[1];

	if(valOne.name == "+" || valOne.name == "-" ){
		if(valOne.name == "+"){
			valOne.name = handleAddition(valOne);
		}else{
			valOne.name = handleSubtraction(valOne);
		}
	}

	if(valTwo.name == "+" || valTwo.name == "-" ){
		if(valTwo.name == "+"){
			valTwo.name = handleAddition(valTwo);
		}else{
			valTwo.name = handleSubtraction(valTwo);
		}
	}

	if( isDigit(valOne.name) && isDigit(valTwo.name) ){ // Two digits.
		value = parseInt(valOne.name, 10) + parseInt(valTwo.name, 10);
	}else if( isDigit(valOne.name) && isChar(valTwo.name) ){ // digit and variable.

		// Get the variable value from the symbol table.
		var variable = symbolTableLookUp(valTwo.name, scopes[scopes.length - 1].scope);

		var variableValue = variable.value;

		if(variable.type == "int"){
			value = parseInt(valOne.name, 10) + parseInt(variableValue, 10);
		}else{
			value = parseInt(valOne.name, 10) + variableValue;
		}

	}else if( isDigit(valOne.name) && (valTwo.name.toUpperCase() == "TRUE" || valTwo.name.toUpperCase() == "FALSE") ){ // digit and boolean.
		value = parseInt(valOne.name, 10) + valTwo.name;
	}else if( isDigit(valOne.name) && isCharList(valTwo.name) ){ // digit and string.
		value = parseInt(valOne.name, 10) + valTwo.name;
	}

	return value;
}

function handleSubtraction(node){
//debugger;
	var value = "0";
	var valOne = node.children[0];
	var valTwo = node.children[1];

	if(valOne.name == "+" || valOne.name == "-" ){
		if(valOne.name == "+"){
			valOne.name = handleAddition(valOne);
		}else{
			valOne.name = handleSubtraction(valOne);
		}
	}

	if(valTwo.name == "+" || valTwo.name == "-" ){
		if(valTwo.name == "+"){
			valTwo.name = handleAddition(valTwo);
		}else{
			valTwo.name = handleSubtraction(valTwo);
		}
	}

	if( isDigit(valOne.name) && isDigit(valTwo.name) ){ // Two digits.
		value = parseInt(valOne.name, 10) - parseInt(valTwo.name, 10);
	}else if( isDigit(valOne.name) && isChar(valTwo.name) ){ // digit and variable.

		// Get the variable value from the symbol table.
		var variable = symbolTableLookUp(valTwo.name, scopes[scopes.length - 1].scope);

		var variableValue = variable.value;

		if(variable.type == "int"){
			value = parseInt(valOne.name, 10) - parseInt(variableValue, 10);
		}else{
			value = parseInt(valOne.name, 10) - variableValue;
		}

	}else if( isDigit(valOne.name) && (valTwo.name.toUpperCase() == "TRUE" || valTwo.name.toUpperCase() == "FALSE") ){ // digit and boolean.
		value = parseInt(valOne.name, 10) - valTwo.name;
	}else if( isDigit(valOne.name) && isCharList(valTwo.name) ){ // digit and string.
		value = parseInt(valOne.name, 10) - valTwo.name;
	}

	return value;
}

function printInt(node){
var retVal = "";

	if(node.children[1].name == "+"){ // Has two children.
		retVal = parseInt(node.children[0].name, 10)  + parseInt(printInt(node.children[1]), 10);
	}else{ // Has one child.
		retVal = parseInt(node.children[0].name, 10) + parseInt(node.children[1].name, 10);
	}

	return retVal;
}

// Function to handle code generation for prints.
function print(node){

if(node.children[0]){

	if(node.children[0].name == "+"){
		node = node.children[0];
	}

	var firstChild = node.children[0];

	// Check if Print node has two children.
	if(node.children[1]){

		var secondChild = node.children[1];

		if(isDigit(firstChild.name) && isDigit(secondChild.name)){ // IntExpr
			// Add digits and store in accumulator.
			var total = parseInt(firstChild.name,10)  + parseInt(secondChild.name, 10);

			total = total.toString(16).toUpperCase();

			if(total.toString().length == 1){
				total = "0" + total;
			}

			addCode("A0 " + total);
		}else if(isDigit(firstChild.name) && isChar(secondChild.name)){ // Int and a variable.
			// Look up the variable in the symbol table.
			var temp = symbolTableLookUp(secondChild.name , scopes[scopes.length - 1].scope);

			if(temp.type == "int"){ // Two ints.

				// Add digits and store in accumulator.
				var total = parseInt(firstChild.name,10)  + parseInt(temp.value , 10);

				total = total.toString(16).toUpperCase();

				if(total.toString().length == 1){
					total = "0" + total;
				}

				addCode("A0 " + total);
			}else{ // Anything else, print separately.

				print(firstChild);

				print(secondChild);

				return;
			}
		}else if(isDigit(firstChild.name) && secondChild.name == "+"){

			var total = parseInt(firstChild.name, 10) + parseInt(printInt(secondChild), 10);

			total = total.toString(16).toUpperCase();

			if(total.toString().length == 1){
				total = "0" + total;
			}

			addCode("A0 " + total);

		} else { // Anything else print separately.
			print(firstChild);

			print(secondChild);

			return;
		}
	}else{ // Print node has only one child.

		// Check what type to print.
		if(isChar(firstChild.name)){ // Its a character. (variable.)

			var tempVal ="";

			var startScope = scopes.length - 1;

			if(cg.staticTable.table[node.children[0].name + scopes[startScope].scope]){
				tempVal = cg.staticTable.table[node.children[0].name + scopes[startScope].scope].temp;
			}else{
				while(!cg.staticTable.table[node.children[0].name + scopes[startScope].scope]){

					startScope = startScope - 1;
					if(cg.staticTable.table[node.children[0].name + scopes[startScope].scope]){
						tempVal = cg.staticTable.table[node.children[0].name + scopes[startScope].scope].temp;
					}

				}
			} // end else.

			// Load the Y-register from memory.
			//addCode("AC " + cg.staticTable.table[node.children[0].name + scopes[scopes.length - 1].scope].temp);

			addCode("AC " + tempVal);

			var temp = symbolTableLookUp(node.children[0].name , scopes[scopes.length - 1].scope);

			// Load the X-register with a 02 if printing strings, else load 01.
			if(temp.type == "string"){

				// Load the X-register with a constant.
				addCode("A2 02");

				// System call.
				addCode("FF");
				return;
			}

		} else if(isDigit(firstChild.name)){ // It's a digit.

			var temp = firstChild.name;

			if(temp.toString().length == 1){
				temp = "0" + temp;
			}

			addCode("A0 " + temp);

		} else if(firstChild.name.toUpperCase() == "TRUE" || firstChild.name.toUpperCase() == "FALSE"){ // Its a boolean.

			if(firstChild.name.toUpperCase() == "TRUE"){
				addCode("A0 " + "01");
			}else{
				addCode("A0 " + "00");
			}

		} else if(firstChild.name == "equality"){
			var boolOne = firstChild.children[0].name;

			var boolTwo = firstChild.children[1].name;

			var boolResult = "";

			if(boolOne == boolTwo){
				boolResult = "01"; // True
			}else{
				boolResult = "00"; // False
			}

			addCode("A0 " + boolResult);

		}else if(isCharList(firstChild.name)){ // It's a string.
		// Put string at the end of the memory.
		putString(firstChild.name);

		// Load the accumulator with the stating index of the string.
		//addCode("A9 " + (endIndex + 1).toString(16).toUpperCase());

		// Store the accumulator in memory.
		//addCode("8D " + cg.staticTable.table[node.children[0].name + scopes[scopes.length - 1].scope].temp);

		addCode("A0 " + (endIndex + 1).toString(16).toUpperCase());

		// Load the X-register with a constant.
		addCode("A2 02");

		// System call.
		addCode("FF");
		return;

		} else{
			// Unknown, throw error.
			putErrorMessage("Unknown print type in code generation");
		}

	}

} else{ // No children.

		var firstChild = node;

			// Check what type to print.
		if(isChar(firstChild.name)){ // Its a character. (variable.)
			// Load the Y-register from memory.
			addCode("AC " + cg.staticTable.table[firstChild.name + scopes[scopes.length - 1].scope].temp);

			var temp = symbolTableLookUp(firstChild.name , scopes[scopes.length - 1].scope);

			// Load the X-register with a 02 if printing strings, else load 01.
			if(temp.type == "string"){

				// Load the X-register with a constant.
				addCode("A2 02");

				// System call.
				addCode("FF");
				return;
			}

		} else if(isDigit(firstChild.name)){ // It's a digit.

			var temp = firstChild.name;

			if(temp.toString().length == 1){
				temp = "0" + temp;
			}

			addCode("A0 " + temp);

		} else if(firstChild.name.toUpperCase() == "TRUE" || firstChild.name.toUpperCase() == "FALSE"){ // Its a boolean.

			if(firstChild.name.toUpperCase() == "TRUE"){
				addCode("A0 " + "01");
			}else{
				addCode("A0 " + "00");
			}

		} else if(isCharList(firstChild.name)){ // It's a string.
		// Put string at the end of the memory.
		putString(firstChild.name);

		// Load the accumulator with the stating index of the string.
		addCode("A9 " + (endIndex + 1).toString(16).toUpperCase());

		// Store the accumulator in memory.
		//addCode("8D " + cg.staticTable.table[node.children[0].name + scopes[scopes.length - 1].scope].temp);

		addCode("A0 " + (endIndex + 1).toString(16).toUpperCase());

		// Load the X-register with a constant.
		addCode("A2 02");

		// System call.
		addCode("FF");
		return;

		} else{
			// Unknown, throw error.
			putErrorMessage("Unknown print type in code generation");
		}
}


	// // Load the Y-register from memory.
	// addCode("AC " + cg.staticTable.table[node.children[0].name + scopes[scopes.length - 1].scope].temp);

	// var temp = symbolTableLookUp(node.children[0].name , scopes[scopes.length - 1].scope);

	// // Load the X-register with a 02 if printing strings, else load 01.
	// if(temp.type == "string"){

	// 	// Load the X-register with a constant.
	// 	addCode("A2 02");
	// }else{

		// Load the X-register with a constant.
		addCode("A2 01");
	//}

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

				if(staticTableStart.toString().length == 1){
					cg.code[j] = "0" + staticTableStart.toUpperCase();
				}else{
					cg.code[j] = staticTableStart.toUpperCase();
				}

				cg.code[j+1] = "00";
			}

		}

		// Convert to decimal and add one.
		staticTableStart = parseInt(staticTableStart, 16) + 1;

		// Convert to hex.
		staticTableStart = staticTableStart.toString(16);

	} // End for loop.

} // End function backPatch.

// Function to back patch temporary jump values.
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

