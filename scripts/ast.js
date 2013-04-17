//ast.js

function AST(CST) {
this.rootNode = null;
this.currentNode = {};

var scopeLevel = 0;

this.addBranchNode = function(name){
	var node = {name: name, children: [], parent: {}};

	if(!isRoot(this.rootNode)){
		node.parent = this.currentNode;

		// Add node to children.
		this.currentNode.children.push(node);
	} else{
        this.rootNode = node;
    }//  End else.

    this.currentNode = node;

}; // End addBranchNode

this.addLeafNode = function(name){
	var node = {name: name, children: [], parent: {}};

	if(!isRoot(this.rootNode)){
		node.parent = this.currentNode;

		// Add node to children.
		this.currentNode.children.push(node);
	} else{
        this.rootNode = node;
    }// End else.

}; // End addLeafNode

function isRoot(root){
	if((root === null) || (!root)){
		// This is the root node.
		return true;
	} // End if

	return false;
} // End isRoot

this.endChildren = function(){
	// Move back to parent node.
    if ((this.currentNode.parent !== null) && (this.currentNode.parent.name !== undefined)){
        this.currentNode = this.currentNode.parent;
    } else{
		// Error
    } // End else

}; // End endChildren

// Create a string representation of the tree.
this.toString = function() {
    var traversalResult = "";

    // Recursive function to handle the expansion of the nodes.
    function expand(node, depth){
        // Space out nodes.
        // for (var i = 0; i < depth; i++){
        //     traversalResult += "-";
        // } // End for

        // Check for leaf nodes.
        if (!node.children || node.children.length === 0){
            traversalResult +=  node.name + " ";
            //traversalResult += "\n";
        }else{

		if(node.name == "VarDecl"){
			//addBranchNode("declare");
		}

		if(node.name == "id"){

		}

		// Increase scope level.
		if(node.mame == "{"){
			scopeLevel++;
		}
		if(node.mame == "}"){
			scopeLevel--;
		}

			traversalResult +=  node.name + " ";

            // Recursive call to expand.
            for (var j = 0; j < node.children.length; j++){
				// On the last child for a given node.
				if(j == (node.children.length - 1)){
					traversalResult += "\n";
				}

                expand(node.children[j], depth + 1);
            } //  End for
        }// End else
    } // End toString

    // Initial call to expand.
    expand(CST, 0);

    return traversalResult;
    };

}