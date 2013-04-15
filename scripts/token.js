function Token (kind, line, position, value) {
    this.kind  = kind;
    this.line = line;
    this.position = position;
    this.value = value;
}

/*
 * Token factory that creates and add token to token stream.
 */
function tokenize(kind, line, position, value, tokenStream){
    // Create and initialize a new token.
    var token = new Token(kind, line, position, value);

    // Add token to token stream.
    tokenStream.push(token);
}