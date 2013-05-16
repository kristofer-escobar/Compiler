/*
* staticTable.js
*/

function StaticTable(){
this.table = {};
this.count = 0;
this.address = 0;
this.scope = 0;

this.add = function(name){
	var count = this.count++;

	var entry = {
		temp: "T" + count + " XX",
		variable: name,
		address: this.address,
		scope : this.scope++
	};

	// If the entry doenst already exist, then add it.
	if(!this.table[name]){
		this.table[name] = entry;
	} else if(!this.table[name].scope){
		this.table[name] = entry;
	}

	//this.address++;

};


}