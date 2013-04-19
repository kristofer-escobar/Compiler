//ast.js

function AST(CST) {
var a = {};
a.rootNode = null;
a.currentNode = {};

var scopeLevel = 0;

a.addBranchNode = function(name){
	var node = {name: name, children: [], parent: {}};

	if(!isRoot(a.rootNode)){
		node.parent = a.currentNode;

		// Add node to children.
		a.currentNode.children.push(node);
	} else{
        a.rootNode = node;
    }//  End else.

    a.currentNode = node;

}; // End addBranchNode

a.addLeafNode = function(name){
	var node = {name: name, children: [], parent: {}};

	if(!isRoot(a.rootNode)){
		node.parent = a.currentNode;

		// Add node to children.
		a.currentNode.children.push(node);
	} else{
        a.rootNode = node;
    }// End else.

}; // End addLeafNode

function isRoot(root){
	if((root === null) || (!root)){
		// This is the root node.
		return true;
	} // End if

	return false;
} // End isRoot

a.endChildren = function(){
	// Move back to parent node.
    if ((a.currentNode.parent !== null) && (a.currentNode.parent.name !== undefined)){
        a.currentNode = a.currentNode.parent;
    } else{
		// Error
    } // End else

}; // End endChildren

// Create a string representation of the tree.
a.build = function() {
    var traversalResult = "";
	
	var count = 0;
    // Recursive function to handle the expansion of the nodes.
    function expand(node, depth){

        // Check for leaf nodes.
        if (!node.children || node.children.length === 0){
            //traversalResult +=  node.name + " ";
            //traversalResult += "\n";
        }else{

        if(node.name == "StatementList"){
			if(node.children[0]){
				//a.addBranchNode("block");
				//count++;
			}
        }

        // Create nodes for VarDecl
		if(node.name == "VarDecl"){
			varDecl(node);
			return;
		}

		if(node.name == "Statement"){
			//
			//a.addBranchNode("block");

			if(node.children[1]){
				if(node.children[1].name == "="){
					assign(node);
					return;
				}

			// Increase scope level.

			if(node.children[0] && node.children[2]){
				if(node.children[0].name == "{" && node.children[2].name == "}"){
				a.addBranchNode("block");
				count++;
				scopeLevel++;
					if(node.children[1].name == "StatementList"){
						if(!node.children[1].children[0]){
							while(count !== 0){
								a.endChildren();
								count--;
							}
						}
					}
				}
			}

				//else if(node.children[1].name == "StatementList"){
				//	a.addBranchNode("block");
				//	count++;
				//}
			}
			//a.endChildren();
		}

		if(node.name == "Print"){
			print(node.children[2]);
			return; // Move onto next subtree.
		}

			traversalResult +=  node.name + " ";

            // Recursive call to expand.
            for (var j = 0; j < node.children.length; j++){
                expand(node.children[j], depth + 1);
            } //  End for
        }// End else
    } // End toString

    // Initial call to expand.
    expand(CST.rootNode, 0);
};

function print(node){
//debugger;

	a.addBranchNode("print");
	expr(node);
	a.endChildren();
}
function expr(node){
	if(node.children[0].name == "IntExpr"){
		intExpr(node.children[0]);
	} else if(node.children[0].name == "CharExpr"){
		charExpr(node.children[0]);
	} else{
		id(node.children[0]);
	}
}

function intExpr(node){
	if(node.children[1]){
		if(node.children[1].name == "+" || node.children[1].name == "-"){
			a.addBranchNode(node.children[1].name);
			a.addLeafNode(node.children[0].name);
			expr(node.children[2]);
			a.endChildren();
		}
	} else{
		a.addLeafNode(node.children[0].name);
	}
}

function charExpr(node){
	a.addLeafNode(node.children[1].name);
}

function varDecl(node){
	a.addBranchNode("declare");
	a.addLeafNode(node.children[0].name); // get type.
	a.addLeafNode(node.children[1].children[0].name); // get id.
	a.endChildren();
}

function assign(node){
a.addBranchNode("assign");
a.addLeafNode(node.children[0].children[0].name);
expr(node.children[2]);
a.endChildren();
}

function id(node){
	a.addLeafNode(node.children[0].name);
}

a.toString = function() {
    var traversalResult = "";

    // Recursive function to handle the expansion of the nodes.
    function expand(node, depth){
		var scopeLevel = 1;
        // Space out nodes.
        for (var i = 0; i < depth; i++){
            traversalResult += "-";
        } // End for

        // Check for leaf nodes.
        if (!node.children || node.children.length === 0){
            traversalResult += "[" + node.name + "]";
            traversalResult += "\n";
        }else{

			// Increase scope level.
			if(node.mame == "{"){
				scopeLevel++;
			}
			if(node.mame == "}"){
				scopeLevel--;
			}

			// Not a statement list, lower scope level to 0.
			if(depth === 0 && node.name !== "block"){
				scopeLevel--;
			}

			// Do some type checking.
			if(node.name == "assign"){
				typeCheckAssign(node,scopeLevel);
			}

            // Check for branch nodes.
            traversalResult += "<" + node.name + "> \n";
            // Recursive call to expand.
            for (var j = 0; j < node.children.length; j++){
                expand(node.children[j], depth + 1);
            } //  End for
        }// End else
    } // End toString

    // Initial call to expand.
    expand(a.rootNode, 0);

    return traversalResult;
    };

function typeCheckAssign(node, scopeLevel){
	// Get the Identifer type.
	var variable = symbolTableLookUp(node.children[0].name,scopeLevel);

	// Get the type of value.
	var compareType = "";

	if(isDigit(node.children[1].name)){
		compareType = "int";
	} else if(isChar(node.children[1].name) || isCharList(node.children[1].name)){
		compareType = "string";
	} else if(isChar(node.children[1].name)){
		compareType = "id";
	} else if(node.children[1].name == "+" || node.children[1].name == "-") {
		compareType = typeCheckOps(node.children[1]);
		}

	if(variable.type != compareType){
		putErrorMessage("Type mismatch: expected type '" +
		variable.type + "', received type '" +
		compareType + "'" , variable.token.line, variable.token.position);
	}
}

function typeCheckOps(node){

	var operand1 = node.children[0];
	var operand2 = node.children[1];
	var compareType = "";

	if(isDigit(operand2.name)){
		compareType = "int";
	} else if(isChar(operand2.name) || isCharList(node.children[1].name)){
		compareType = "string";
	} else if(isChar(operand2.name)){
		compareType = "id";
	} else if(node.children[1].name == "+" || node.children[1].name == "-") {
		compareType = typeCheckOps(node.children[1]);
	}
		return compareType;
}


    a.build();

    return a;

}