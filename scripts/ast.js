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
	if(verboseMode){
        putMessage("Building Abtract syntax tree.");
    }
    var traversalResult = "";

	var count = 0;

    // Recursive function to handle the expansion of the nodes.
    function expand(node, depth){

        // Check for leaf nodes.
        if (!node.children || node.children.length === 0){

			if(node.name == "}"){
				a.endChildren();

			}

        }else{

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

			if(node.name == "WhileLoop"){
				//debugger;
				whileLoop(node);
				return;
			}

			if(node.name == "IfStatement"){
				ifStatement(node);
				return;
			}

			if(node.name == "BoolExpr"){
				boolExpr(node);
				return;
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

function whileLoop(node){
	a.addBranchNode("while");

	// Handle the boolean expression of the while expression.
	boolExpr(node.children[1]);

	// Handle the statement list inside the while loop.
	var stmtLst = node.children[3];

	// Add block for statement list.
	a.addBranchNode("block");

	// Check if the statement list has a statement.
	if(stmtLst.children[0]){

		// Handle while statement.
		whileStatement(stmtLst);

	} // End if

	// End block branch.
	a.endChildren();

	// End while branch.
	a.endChildren();

} // End whileLoop function.

function whileStatement(stmtLst){

	if(stmtLst.children[0]){
		var stmt = stmtLst.children[0];

		var expr = stmt.children[0];

		if(expr.name == "Print"){ // Tested.
			print(expr.children[2]);
		} else if (expr.name == "Id"){
			// Handle nested statements inside a while loop.
			if(stmt.children[1]){
				if(stmt.children[1].name == "="){
					assign(stmt);
				}
			}
		} else if(expr.name == "VarDecl"){ //Tested
			varDecl(expr);
		} else if(expr.name == "WhileLoop"){// Tested
			whileLoop(expr);
		} else if(expr.name == "IfStatement"){
			ifStatement(expr);
		} else if(expr.name == "{"){ // Statement
			if(stmt.children[1]){
				if(stmt.children[1].name == "StatementList"){
					a.addBranchNode("block");
					whileStatement(stmt.children[1]);
					a.endChildren();
				}
			}
		} else
		{
			// Unknown expression.
		}

		// Check for another statement list.
		if(stmtLst.children[1]){

			var innerStmtLst = stmtLst.children[1];

			// Check for another statment.
			if(innerStmtLst.children[0]){
				whileStatement(innerStmtLst);
			} // end if
		} // end if

	}// End check for children.

} // End whileStatement function.


function ifStatement(node){
	a.addBranchNode("if");

	// Handle the boolean expression of the while expression.
	boolExpr(node.children[1]);

	// Handle the statement list inside the while loop.
	var stmtLst = node.children[3];

	// Add block for statement list.
	a.addBranchNode("block");

	// Check if the statement list has a statement.
	if(stmtLst.children[0]){

		// Handle while statement.
		ifBody(stmtLst);

	} // End if

	// End block branch.
	a.endChildren();

	// End while branch.
	a.endChildren();
}

function ifBody(stmtLst){
	if(stmtLst.children[0]){
		var stmt = stmtLst.children[0];

		if(stmt.children[0]){ // Check for children.
			var expr = stmt.children[0];

			if(expr.name == "Print"){ // Tested.
				print(expr.children[2]);
			} else if (expr.name == "Id"){
				// Handle nested statements inside a while loop.
				if(stmt.children[1]){
					if(stmt.children[1].name == "="){
						assign(stmt);
					}
				}
			} else if(expr.name == "VarDecl"){ //Tested
				varDecl(expr);
			} else if(expr.name == "WhileLoop"){// Tested
				whileLoop(expr);
			} else if(expr.name == "IfStatement"){
				ifStatement(expr);
			} else if(expr.name == "{"){ // Statement
				if(stmt.children[1]){
					if(stmt.children[1].name == "StatementList"){
						a.addBranchNode("block");
						ifBody(stmt.children[1]);
						a.endChildren();
					}
				}
			} else
			{
				// Unknown expression.
			}

		} //  End check for children.

		// Check for another statement list.
		if(stmtLst.children[1]){

			var innerStmtLst = stmtLst.children[1];

			// Check for another statment.
			if(innerStmtLst.children[0]){
				ifBody(innerStmtLst);
			} // end if
		} // end if
	}// End check for children.

} // End ifBody


function boolExpr(node){

	if(node.children[0].name == "("){
		equality(node);
	}else
	{
		id(node);
	}

}

function equality(node){
	a.addBranchNode("equality");

	// Handle each expression in the boolean expression.
	expr(node.children[1]);
	expr(node.children[3]);

	a.endChildren();

}

function print(node){

	a.addBranchNode("print");
	expr(node);
	a.endChildren();
}
function expr(node){
	if(node.children[0].name == "IntExpr"){
		intExpr(node.children[0]);
	} else if(node.children[0].name == "CharExpr"){
		charExpr(node.children[0]);
	} else if(node.children[0].name == "BoolExpr"){
		boolExpr(node.children[0]);
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

	var scopeLevel = 1;

    // Recursive function to handle the expansion of the nodes.
    function expand(node, depth){

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

			if(node.name == "block"){
				scopeLevel++;
			}

			// Not a statement list, lower scope level to 0.
			if(depth === 0 && node.name !== "block"){
				scopeLevel--;
			}

			// Do some type checking.
			if(node.name == "assign"){
				//debugger;
				typeCheckAssign(node,scopeLevel);
			}

			if(node.name == "print"){
				//debugger;
				if(node.children[1]){
					typeCheckOps(node.children[0], scopeLevel);

				}
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
	if(isDigit(variable.value)){
		compareType = "int";
	} else if(variable.value.charAt(0) == "\"" && variable.value.charAt(variable.value.length -1) == "\""){
		compareType = "string";
	//} else if(isChar(node.children[1].name) && (node.children[1].name.length == 1)){
	} else if(isChar(variable.value) && (variable.value.length == 1)){
		compareType = symbolTableLookUp(variable.value,scopeLevel).type;
	} else if(variable.value.toUpperCase() == "TRUE" || variable.value.toUpperCase() == "FALSE"){
		compareType = "boolean";
	} else if(node.children[1].name == "+" || node.children[1].name == "-") {
		compareType = typeCheckOps(node.children[1],scopeLevel);
	}

	if(variable.type != compareType){
		putErrorMessage("Type mismatch: expected type '" +
		variable.type + "', received type '" +
		compareType + "'" , variable.token.line, variable.token.position);
	}
}

function typeCheckOps(node,scopeLevel){

	var operand1 = node.children[0];
	var operand2 = node.children[1];
	var compareType = "";
	var variable ="";

	if(isDigit(operand2.name)){
		compareType = "int";
	} else if((operand2.name.charAt(0) == "\"") || (operand2.name.charAt(operand2.name.length-1) == "\"")){
		compareType = "string";
	} else if(isChar(operand2.name)){
		variable = symbolTableLookUp(operand2.name,scopeLevel);
		compareType = variable.type;
	} else if(node.children[1].name == "+" || node.children[1].name == "-") {
		compareType = typeCheckOps(node.children[1]);
	}

		if(compareType !== "int"){
			putErrorMessage("Type mismatch: expected type '" +
			"int" + "', received type '" +
			compareType + "'");
		}

		return compareType;
}

    a.build();

    return a;

}