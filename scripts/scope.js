//environment.js
// Keeps track of variable scope.

function ScopeTree(){
	var scopeLevel = 0;

	this.rootNode = null;
	this.currentScope = {};

	this.newScope = function(){
		var node = {
			name: scopeLevel++ , 
			children: [], 
			parent: {}, 
			entries: {}
		};

		if(!isRoot(this.rootNode)){
			node.parent = this.currentScope;

			// Add node to children.
			this.currentScope.children.push(node);
		} else{
			this.rootNode = node;
		}//  End else.

		this.currentScope = node;
	}; // End addBranchNode

	this.endScope = function(){
		// Move back to parent node.
		if ((this.currentScope.parent !== null) && (this.currentScope.parent.name !== undefined)){
		this.currentScope = this.currentScope.parent;
		} else{
			// Error
		} // End else

	}; // End endChildren

// Create a string representation of the tree.
this.buildSymbolTable = function() {
    var traversalResult = "";
    // Recursive function to handle the expansion of the nodes.
    function expand(node){
        // Check for leaf nodes.
    //     if (!node.children || node.children.length === 0){
    //          for(var k in node.entries){
				// traversalResult += 
				// "Name: " + node.entries[k].name + " " +
				// "Value: " + node.entries[k].value + " " +
				// "Type: " + node.entries[k].type + " " + 
				// "Scope: " + node.entries[k].scope + " " + 
				// "isUsed: " + node.entries[k].isUsed + "\n";
    //         }
    //     }else{
    //         // Check for branch nodes.
			for(var j in node.entries){
				
				// Add entries into symbol table.
				symbolTable[node.entries[j].name + node.entries[j].scope] = JSON.stringify(node.entries[j]);
				//alert(symbolTable[node.entries[j].name+ node.entries[j].scope]);

				if(!node.entries[j].isUsed){
					putWarningMessage("Variable " + node.entries[j].name + " declared but never used");
				}

				traversalResult += 
				"Name: " + node.entries[j].name + " " +
				"Value: " + node.entries[j].value + " " +
				"Type: " + node.entries[j].type + " " + 
				"Scope: " + node.entries[j].scope + " " + 
				"isUsed: " + node.entries[j].isUsed + "\n";
            }

            // Recursive call.
            for (var i = 0; i < node.children.length; i++){
                expand(node.children[i]);
            } //  End for
        //}// End else
    } // End toString

    // Initial call to expand.
    expand(this.rootNode);

    return traversalResult;
    };
}

function isRoot(root){
	if((root === null) || (!root)){
		// This is the root node.
		return true;
	} // End if

	return false;
} // End isRoot