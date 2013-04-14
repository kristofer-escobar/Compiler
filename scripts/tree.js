// Tree1.js
// Based on work By Alan G. Labouseur, Michael Ardizzone and Tim Smith.

function Tree(){

this.rootNode = null;
this.currentNode = {};

this.addBranchNode = function(name){
	var node = {name: name, children: [], parent: {}};

	if(!isRoot()){
		node.parent = this.currentNode;

		// Add node to children.
		this.currentNode.children.push(node);

		this.currentNode = node;
	} //  End if

}; // End addBranchNode

this.addLeafNode = function(name){
	var node = {name: name, children: [], parent: {}};

	if(!isRoot()){
		node.parent = this.currentNode;

		// Add node to children.
		this.currentNode.children.push(node);
	} // End if

}; // End addLeafNode

function isRoot(){
	if((this.root === null) || (!this.root)){
		// This is the root node.
		this.root = node;
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
        for (var i = 0; i < depth; i++){
            traversalResult += "-";
        } // End for

        // Check for leaf nodes.
        if (!node.children || node.children.length === 0){
            traversalResult += "[" + node.name + "]";
            traversalResult += "\n";
        }else{
            // Check for branch nodes.
            traversalResult += "<" + node.name + "> \n";
            // Recursive call to expand.
            for (var j = 0; j < node.children.length; j++){
                expand(node.children[j], depth + 1);
            } //  End for
        }// End else
    } // End toString

    // Initial call to expand.
    expand(this.root, 0);

    return traversalResult;
    };

} // end Tree