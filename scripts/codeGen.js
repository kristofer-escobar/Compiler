/*
* codeGen.js
*/

function CodeGeneration(AST){

// Instance of a code generator.
var cg = {};

//cg.code = "";

cg.code = [];

var addIndex = 0;

var endIndex = 255;

// Fill with zeroes.
function initCode(){
for(var i = 0; i < 256; i++){
	cg.code[i] = "00";
}

}

var instrCount = 0;
var scopes = [];

// Create a static table.
cg.staticTable = new StaticTable();

// Create a jump table.
cg.jumpTable = new JumpTable();

function addCode(code){


//cg.code += code + " ";

//debugger;
var temp = code.split(" ");

for(var i = 0; i < temp.length ; i++){
cg.code[addIndex] = temp[i];
addIndex++;
}
//cg.code = cg.code.concat(temp);

} // End addCode

function putString(string){

// Null terminated string.
cg.code[endIndex] = "00";
endIndex--;

var temp = string.split("");

temp.reverse();

for(var i = 0; i < temp.length ; i++){
cg.code[endIndex] = temp[i].charCodeAt(0).toString(16).toUpperCase();
endIndex--;
}
}


// Function to generate code.
// Create a string representation of the tree.
cg.generate = function() {

	initCode();
	//alert("cleared");

	if(verboseMode){
        putMessage("Generating code.");
    } // End if

    var traversalResult = "";

	var count = 0;

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
		//alert(depth);


		if(scopes.length > 0){
	        if(scopes[scopes.length - 1].depth == depth){
	        	//alert("Popping ..");
	        	scopes.pop();
	        }
		}



        // Keep Track of scope.
        if(node.name == "block"){
        	//alert("Adding ..");
			scopeLevel++;

			var scopeObj = { scope: scopeLevel,
							depth: depth };

			scopes.push(scopeObj);


        }

        if(node.name == "declare"){
        	//alert("scope is: " + scopes[scopes.length - 1].scope);
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
			//addCode("if");

			// // Load the X-register from memory.
			// addCode("AE " + cg.staticTable.table[node.children[0].name].temp);

			// // Compare memory to the X-register, set z-flag if equal.
			// addCode("EC " + cg.staticTable.table[node.children[1].name].temp);

			// // Add entry into the static table.
			// var jump = cg.jumpTable.add();
			// // Branch on not equal.
			// addCode("DO " + jump);
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

    // Make into an array.
    //cg.code = cg.code.split(" ");

    // Back patch jumps.
    backPatchJump();

    // Back patch static variables.
    backPatch();

}; // End generate

// Return code generated.
cg.toString = function() {
	//alert(cg.code);
	return cg.code.join(" ");
};


function if_statement(node){
	var jump = "";
//debugger;
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

	// Add jump offset.
	// add a J0 meta symbol to determine where the expr ends. Then calculate the jump offset.

	//debugger;

	// Calculate jump offset.
	//var codeArray = cg.code.split(" ");

	var codeArray = cg.code;

	var jumpStartIndex = codeArray.indexOf(jump);

	//var jumpEndIndex = codeArray.length - 1;

	var jumpEndIndex = addIndex;


	var jumpOffset = jumpEndIndex - jumpStartIndex;

	//alert(jumpOffset);

	// Add jump offset to jump table.
	cg.jumpTable.table[jump].address = jumpOffset;

	//alert(cg.jumpTable.table[jump].address);

//addCode();

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
		// Load the X-register from memory.
		addCode("AE " + cg.staticTable.table[node.children[0].name + scopes[scopes.length - 1].scope].temp);
//debugger;
		if(isChar(node.children[1].name)){
			// Compare memory to the X-register, set z-flag if equal.
			addCode("EC " + cg.staticTable.table[node.children[1].name + scopes[scopes.length - 1].scope].temp);
		} else if(isDigit(node.children[1].name)){

		}



		// Add entry into the static table.
		var jump = cg.jumpTable.add();
		// Branch on not equal.
		addCode("D0 " + jump);

		return jump;
	}


}

function declare(node){
//alert("scope is: " + scopes[scopes.length - 1].scope);

	// Add entry into the static table.
	//cg.staticTable.add(node.children[1].name);

	cg.staticTable.add(node.children[1].name, scopes[scopes.length - 1].scope);

	// Load the accumulator with zero.
	addCode("A9 00");

	// Store the accumulator into memory.
	addCode("8D " + cg.staticTable.table[node.children[1].name + scopes[scopes.length - 1].scope].temp);

	//alert(node.children[1].name);
	//alert(cg.staticTable.table[node.children[1].name].temp + " " + cg.staticTable.table[node.children[1].name].variable + " " + cg.staticTable.table[node.children[1].name].address);
}

function assign(node){
	//addCode("assign");

	// Get the value.
	var tempVal = node.children[1].name;

	// If the value is a variable look up the value in the symbol table.
	if(isChar(tempVal)){
		//tempVal = symbolTableLookUp(tempVal, scopeLevel).value;

		// Load the accumulator from memory.
		addCode("AD " + cg.staticTable.table[tempVal + scopes[scopes.length - 1].scope].temp);
	} else if(isDigit(tempVal)){
		// If the value is a single digit prepend a zero.
		if(tempVal.length == 1){
			tempVal = "0" + tempVal;
		}

		// Load the accumulator with the value.
		addCode("A9 " + tempVal);
	}else{
		//alert(tempVal);
		putString(tempVal);
		addCode("A9 " + (endIndex + 1).toString(16).toUpperCase());
	}

	// Store the accumulator in memory.
	addCode("8D " + cg.staticTable.table[node.children[0].name + scopes[scopes.length - 1].scope].temp);

}

function backPatch(){
//var codeArray = cg.code.split(" ");

//var staticTableStart = (cg.code.length - 1).toString(16);

var staticTableStart = (addIndex).toString(16);
//debugger;
//alert(staticTableStart);
for(var i in cg.staticTable.table){
	//alert(cg.staticTable.table[i].temp);

	var littleEndian = cg.staticTable.table[i].temp.substring(0,2);

	for(var j = 0; j < cg.code.length; j++)
	{
		if(cg.code[j] == littleEndian){
			cg.code[j] = staticTableStart.toUpperCase();

			cg.code[j+1] = "00";
		}

	}

	//cg.code[cg.code.indexOf(littleEndian)] = staticTableStart.toUpperCase();

	// Convert to decimal and add one.
	staticTableStart = parseInt(staticTableStart, 16) + 1;

	// Convert to hex.
	staticTableStart = staticTableStart.toString(16);

	//alert(cg.code);


}



}


function backPatchJump(){
//var codeArray = cg.code.split(" ");
//debugger;
for(var i in cg.jumpTable.table){

	var offset = cg.jumpTable.table[i].address;

	// Prepend a zero.
	if(offset.toString().length == 1){
		cg.code[cg.code.indexOf(i)] = "0" + offset;
	} else{
		cg.code[cg.code.indexOf(i)] = offset;
	}

}
}


function print(node){
	//addCode("print");

	// Load the Y-register from memory.
	addCode("AC " + cg.staticTable.table[node.children[0].name + scopes[scopes.length - 1].scope].temp);

	var temp = symbolTableLookUp(node.children[0].name , scopes[scopes.length - 1].scope);

	//alert(temp.type);

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

    cg.generate();

    return cg;

} // End CodeGeneration.

