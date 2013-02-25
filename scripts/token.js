function Token () {
    this.kind  = null;
    this.line  = -1;
    this.position = -1;
    this.value = null;

    this.create = function(kind, line, position, value) {
        this.kind  = kind;
        this.line = line;
        this.position = position;
        this.value = value;
    };

}

function tokenize(kind, line, position, value)
{
    var token = new Token();
    token.create(kind, line, position, value);
    token_stream.push(token);
}