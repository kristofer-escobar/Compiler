/*
* jumpTable.js
*/

function JumpTable(){
this.table = {};
this.count = 0;
this.address = 0;

this.add = function(){
	var count = this.count++;

	var entry = {
		temp: "J" + count,
		address: this.address
	};

	// If the entry doenst already exist, then add it.
	if(!this.table[name]){
		this.table[name] = entry;
	}

	this.address++;

	// Return the Jump name
	return entry.temp;
};


}