function Token () {
    this.kind  = null;
    this.line  = -1;
    this.position = -1;
    this.value = null;
    this.name  = "";


    this.init = function() {
        this.kind  = null;
        this.line = -1;
        this.position = -1;
        this.value = null;
        this.name = "";
    };

    this.create = function(kind, line, position, value, name) {
        this.kind  = kind;
        this.line = line;
        this.position = position;
        this.value = value;
        this.name = name;
    };

}