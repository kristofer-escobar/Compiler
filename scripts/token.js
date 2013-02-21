function Token () {
    this.kind  = null;
    this.line  = -1;
    this.value = null;
    this.name  = ""; 


    this.getInfo = function() {
        return this.color + ' ' + this.type + ' apple';
    };
}