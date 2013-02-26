/*
* identifer.js
*/

/*
 * Identifier Object
 */
function Identifer () {
    this.name  = null;
    this.address  = -1;
    this.value = -1;
    this.type = null;
    this.isUsed = false;
    this.scope = null;
    this.lifetime = null;
    this.category = null;
    this.visibility = null;

    // Function to create a identifer object.
    this.create = function(name, address, value, type, isUsed, scope, lifetime, category, visibility) {
    this.name  = name;
    this.address  = address;
    this.value = value;
    this.type = type;
    this.isUsed = isUsed;
    this.scope = scope;
    this.lifetime = lifetime;
    this.category = category;
    this.visibility = visibility;
    };

}

/*
 * Function to add an entry to the symbol table.
 */
function addToSymbolTable(name, address, value, type, isUsed, scope, lifetime, category, visibility){

	var newIdentifer = new Identifer();

	newIdentifer.create(name, address, value, type, isUsed, scope, lifetime, category, visibility);

	symbolTable[newIdentifer.name] = newIdentifer;
}