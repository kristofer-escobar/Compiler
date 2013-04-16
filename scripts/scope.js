//environment.js
// Keeps track of variable scope.

function ScopeTree(){
	var scopeLevel = -1;

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
}

function isRoot(root){
	if((root === null) || (!root)){
		// This is the root node.
		return true;
	} // End if

	return false;
} // End isRoot

