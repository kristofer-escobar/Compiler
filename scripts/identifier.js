/*
* Identifier.js
*/

/*
 * Identifier Object
 */
function Identifier () {
    this.name  = null;
    this.address  = -1;
    this.value = undefined;
    this.type = null;
    this.isUsed = false;
    this.scope = null;
    this.lifetime = null;
    this.category = null;
    this.visibility = null;
    this.token = null;

    // Function to create a Identifier object.
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