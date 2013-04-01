//*****************************************
//* Lexer
//*     Author: Tim Smith
//* This lexer takes an input string and generates from it
//* an array of Token objects.  Lexemes are mostly delimited
//* by whitespace, but certain 1-character punction marks
//* also act as token delimiters.  Information about
//* lexical analysis can be found in Chapter 2, section 6
//* of Aho, Lam, Sethi and Ullman
//*****************************************

//token kinds
const TOKEN_STRING = "string";
const TOKEN_SEMICOLON = "semicolon";
const TOKEN_ASSIGN = "assignment";
const TOKEN_OPENPAREN = "open paren";
const TOKEN_CLOSEPAREN = "close paren";

const TOKEN_BOOLOP = "boolop";
const TOKEN_INTOP = "intop";
const TOKEN_TYPE = "type";
const TOKEN_ID = "id";
const TOKEN_NUMBER = "number";

const TOKEN_WHILE = "while";
const TOKEN_DO = "do";
const TOKEN_ENDWHILE = "endwhile";

const TOKEN_IF = "if";
const TOKEN_THEN = "then";
const TOKEN_ENDIF = "endif";

const TOKEN_PRINT = "print";
const TOKEN_BEGIN = "begin";
const TOKEN_END = "end";

const TOKEN_EOF = "EoF";


//*****************************************
//* The token is a very simple object,
//* a kind-value pair.  The token kind can be any of the
//* kinds enumerated above.  The value is whatever lexeme
//* in the source was recognized as a token.
//*****************************************

var Token = function(k, v){
    //We keep count of tokens for output purposes
    if (Token.counter == undefined) {
        Token.counter = 0;
    } else {
        Token.counter++;
    }
    var t = {kind: k, value: v, loc: Token.counter};

    t.toString = function(){
        return t.loc - 1 + ": <" + t.kind + " : "+t.value+">\n";
    }
    return t;
}

//*****************************************
//* The lexer constructor generates a new lexer object
//* and returns it.  The lexer object has some helper
//* functions, but is mostly the lex function.
//* Because of the simplicity of the grammar, our
//* lexer does not use a state machine to lex
//* the input.  Instead, it breaks tokens on a closed
//* set of token delimiters, then determines what the token
//* it just passed was.  It uses JavaScript's regexp engine
//* for a very limited amount of simple recognition.
//*****************************************
var Lexer = function(){
    //The lexer object
    var l = {};
    //an array of tokens
    l.tokens = {};
    //a pointer to the first character in the current lexeme
    l.lexemeStart=0;
    //the error flag
    l.errors = false;
    
    
    l.lex = function(input){
        Token.counter = 0;
        l.errors = false;
        l.tokens = new Array();
        l.lexemeStart=0;
        
        var i = 0;
        //This is The Big Loop, over the input string
        for(; i < input.length; i++){
            if(/\s/.test(input[i])){
                //whitespace means we may have hit the end of a lexeme   
                if(i>l.lexemeStart){
                    //if the index is greater than the start of the current lexeme, there's a lexeme of interest
                    //otherwise, the last character was a delimiter, and has already been handled, so we'll move on
                    
                    //determine what kind of token we have, and add it to the tokens array
                    l.getToken(input.substring(l.lexemeStart, i));
                }
                l.lexemeStart = i+1;                
            }//end whitespace if
            else{
                //check for string
                if(input[i] == '"'){
                    //if we hit a quotation mark, it's the beginning of a string
                    //the lexer will find the end of the string, and make the string a single token
                    
                    //loop until the terminating quotation mark is found
                    do {
                        i++;
                        if(!/[a-zA-Z]| |"/.test(input[i])){
                            //if the current character isn't a valid string character (letter or space)
                            //and it's not the terminating quotation mark, there's a lex error.
                            trace("invalidCharacterError", OUTPUT, input[i], i);
                            trace("lexError", OUTPUT);
                            return false;
                        }
                        if(i>=input.length){
                            //if we've run out of input without finding the terminating quotation mark, that's a problem
                            trace("unmatchedQuoteError", OUTPUT, l.lexemeStart);
                            trace("lexError", OUTPUT);
                            return false;
                        }
                    } while(input[i]!='"');

                    //if we got here, we found a complete string
                    //put the string in the tokens
                    l.tokens.push(Token(TOKEN_STRING, input.substring(l.lexemeStart+1, i)));
                    l.lexemeStart = i+1;
                }
                
                 //check for comment
                else if(input[i] == '_'){
                    //comments are delimited by underscores.  They're easy to lex: ignore everything between
                    //the underscores
                    do {
                        i++;
                        if(i>=input.length){
                            //of course, if there is no terminating underscore, that's a lexical error
                            trace("unterminatedCommentError", OUTPUT, l.lexemeStart);
                            trace("lexError", OUTPUT);
                            return false;
                        }
                    } while(input[i]!='_');

                    //if we got here, we found a complete comment, hooray!
                    //we're just going to discard it, so move on
                    l.lexemeStart = i+1;
                }
                //the following cases are for tokens that always indicate the end of any previous token
                //if one is found, we add the previous token if there is one, then add the delimiter
                else if(input[i] == ';'){
                    if(!l.isTerminator(input[i-1])){
                        l.getToken(input.substring(l.lexemeStart, i));
                    }
                    l.tokens.push(Token(TOKEN_SEMICOLON, input[i]));
                    l.lexemeStart = i+1;
                }
                
                else if(input[i] == '('){
                    if(!l.isTerminator(input[i-1])){
                        l.getToken(input.substring(l.lexemeStart, i));
                    }
                    l.tokens.push(Token(TOKEN_OPENPAREN, input[i]));
                    l.lexemeStart = i+1;
                }
                
                else if(input[i] == ')'){
                    if(!l.isTerminator(input[i-1])){
                        l.getToken(input.substring(l.lexemeStart, i));
                    }
                    l.tokens.push(Token(TOKEN_CLOSEPAREN, input[i]));
                    l.lexemeStart = i+1;
                }
            }//end whitespace else
        }//end Big Loop
        if(l.lexemeStart < i){
            //This case makes sure that we get the last token, even if there's no whitespace after it
            l.getToken(input.substring(l.lexemeStart, i));
        }
        if(l.errors){
            trace("lexError", OUTPUT);
            return false;
        }
        //add eof token
        l.tokens.push(Token(TOKEN_EOF, "$"));
        trace("start", TRACE, l.toString());
        return true;
    }//end lex
    
    //*****************************************
    //* getToken constructs a token object from a lexeme
    //*****************************************
    l.getToken = function(lexeme){
        //check to see if we have a reserved word
        var matched = l.checkReservedWords(lexeme);
        
        if(!matched){
            //if we don't have a reserved word, check the remaining possibilities.
            
            //check for the closed sets
            if(lexeme == "int" || lexeme == "bool" || lexeme == "string"){
                 l.tokens.push(Token(TOKEN_TYPE, lexeme));
            }
            else if(lexeme == "+"){
                 l.tokens.push(Token(TOKEN_INTOP, lexeme));
            }
            else if(lexeme == "==" || lexeme == "!="){
                l.tokens.push(Token(TOKEN_BOOLOP, lexeme));
            }
            
            //regexp for id or number
            else if(/^[a-z]+$/.test(lexeme)){
                l.tokens.push(Token(TOKEN_ID, lexeme));
            }
            else if(/^\d+$/.test(lexeme)){
                l.tokens.push(Token(TOKEN_NUMBER, lexeme));
            }        
            else{
                //oh noes, invalid lexeme!
                trace("invalidLexemeError", OUTPUT, lexeme, l.lexemeStart);
                l.errors = true;
            }
        }
    }
    
    //*****************************************
    //* checkReservedWords is a helper function to reduce
    //* the complexity of getToken.  It's a switchg statement
    //* that checks to see if the lexeme is a reserved word.
    //* Reserved words are terminals in the grammar that
    //* do not appear alone as a right-hand-side production.
    //*****************************************
    l.checkReservedWords = function(lexeme){
        switch(lexeme){
            case "if":
                l.tokens.push(Token(TOKEN_IF, lexeme));
                return true;
                
            case "then":
                l.tokens.push(Token(TOKEN_THEN, lexeme));
                return true;
            
            case "endif":
                l.tokens.push(Token(TOKEN_ENDIF, lexeme));
                return true;
                
            case "while":
                l.tokens.push(Token(TOKEN_WHILE, lexeme));
                return true;
            
            case "do":
                l.tokens.push(Token(TOKEN_DO, lexeme));
                return true;
            
            case "endwhile":
                l.tokens.push(Token(TOKEN_ENDWHILE, lexeme));
                return true;
            
            case "begin:":
                l.tokens.push(Token(TOKEN_BEGIN, lexeme));
                return true;
            
            case "end.":
                l.tokens.push(Token(TOKEN_END, lexeme));
                return true;
                
            case "print":
                l.tokens.push(Token(TOKEN_PRINT, lexeme));
                return true;
                
            case "=":
                l.tokens.push(Token(TOKEN_ASSIGN, lexeme));
                return true;
                
            default:
                return false;
        }
    }
    
    //*****************************************
    //* isTerminator is a helper function that abstracts
    //* a large and frequently used if expression
    //*****************************************
    l.isTerminator = function(character){
        if(/\s/.test(character) || character == ";"
            || character == "(" || character == ")"
            || character == "_" || character == '\"'){
            return true;
        }
        return false;
    }
    
    l.toString = function(){
        var result = "";
        for( var i = 0; i < l.tokens.length; i++ ){
            result += l.tokens[i].toString();
        }
        return result;
    }

    
    return l;
}