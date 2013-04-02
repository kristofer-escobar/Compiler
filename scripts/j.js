//j.js
    function lex()
    {
    	// Grab the "raw" source code.
        var sourceCode = document.getElementById("taSourceCode").value;
        // Trim the leading and trailing spaces.
        sourceCode = trim(sourceCode);
        if (sourceCode.charAt(sourceCode.length - 1) != '$') //Check for $ at source code end
        {
        	sourceCode = sourceCode + " $";
        	putMessage("Didn't find $ at EOF, but that's okay, appending one anyway.");        	
        }
        var toReturn = [];
        var toPush = "";
        var inquote = false;
        var incomment = false;
        var test = false;
        for (var i = 0; i < sourceCode.length; i++)
        {        	
        	var c = sourceCode.charAt(i);
        	if (!incomment && c == '#') 
        	{
        		incomment = true;
        		continue;
        	}
        	else if (incomment && c != '#') continue;
        	else if (incomment && c == '#') 
        	{
        		incomment = false;
        		continue;
        	}
        	if (inquote && c=="\"") inquote = false;
        	else if (!inquote && c=="\"") inquote = true;
        	if (inquote) 
        	{
        		toReturn.push(c);
        		toPush = "";
        		continue;
        	}        	
        	if (toPush == "") //if toPush is empty (not checking for int or char symbols)
        	{
        		if (c == EOF)// if at any point we reach the EOF symbol, we're done
        		{
        			if (i!=sourceCode.length - 1) putMessage("Found $ in the middle of file - rest of input is being ignored");
        			return toReturn;
        		}

        		else if (!/\s/.test(c)) //if char is not white space
        		{
        			toPush = toPush + c;//Push character into toPush
        			if ((c != 'i') && (c != 'c') && (c != 'p') && (c != 'f') && (c != 't') && (c != 'w') && (c != 'b'))
        			{
        				toReturn.push(c); //if character isn't an i or c push it to toReturn.
        				toPush = "";
        			}
        		}
        	}
        	else //if toPush is not empty (checking for int or char smybols) 
        	{
        		toPush = toPush + c;
        		var reserve = false;
        		if (saysInt(toPush))
        		{
        			toReturn.push("int");
        			reserve = true;
        		}
        		if (saysIf(toPush))
        		{
        			toReturn.push("if");
        			reserve = true;
        		}
        		if (saysChar(toPush))
        		{
        			toReturn.push("char");
        			reserve = true;
        		}
        		if (saysPrint(toPush))
        		{
        			toReturn.push("print");
        			if (c == '(') toReturn.push(c);
        			toPush = "";
        			reserve = true;
        		}
        		if (saysWhile(toPush))
        		{
        			toReturn.push("while");
        			if (c == '(') toReturn.push(c);
        			toPush = "";
        			reserve = true;
        		}
        		if (saysTrue(toPush))
        		{
        			toReturn.push("true");
        			if ((c == ')') || (c == '=') || (c == '!')) toReturn.push(c);
        			toPush = "";
        			reserve = true;
        		}
        		if (saysBool(toPush))
        		{
        			toReturn.push("bool");
        			reserve = true;
        		}
        		if (saysFalse(toPush))
        		{
        			toReturn.push("false");
        			if ((c == ')') || (c == '=') || (c == '!')) toReturn.push(c);
        			toPush = "";
        			reserve = true;
        		}
        		
        		if ((c == EOF) || (/\s/.test(c)))// if c is EOF or white space
        		{
        			for (var k = 0; k < (toPush.length - 1); k++)
        			{
        				if (!reserve) toReturn.push(toPush.charAt(k));     		
        			}
        			toPush = "";
        		}
        	}
        	
        	
        }
        /*//For test purpose only -> prints tokens in toReturn.
        for (var k = 0; k < toReturn.length; k++)
        {
        	putMessage(toReturn[k]);
        }*/
        if (inquote) addError("Error: Quotes are mismatched, Parser will be unpredictable");
        return toReturn;

    }
    
    function saysInt(toCheck) 
    {
    	if ((toCheck.charAt(0) == 'i') && (toCheck.charAt(1) == 'n') && (toCheck.charAt(2) == 't') && 
    	((/\s/.test(toCheck.charAt(3))) || (toCheck.charAt(3) == '$'))) return true;
    	else return false; 
    }
    
        function saysIf(toCheck) 
    {
    	if ((toCheck.charAt(0) == 'i') && (toCheck.charAt(1) == 'f') && 
    	((/\s/.test(toCheck.charAt(2))) || (toCheck.charAt(2) == '$'))) return true;
    	else return false; 
    }
    
    function saysChar(toCheck) 
    {
    	if ((toCheck.charAt(0) == 'c') && (toCheck.charAt(1) == 'h') && (toCheck.charAt(2) == 'a') && (toCheck.charAt(3) == 'r') &&
    	((/\s/.test(toCheck.charAt(4))) || (toCheck.charAt(4) == '$'))) return true;
    	else return false; 
    } 
      
        function saysBool(toCheck) 
    {
    	if ((toCheck.charAt(0) == 'b') && (toCheck.charAt(1) == 'o') && (toCheck.charAt(2) == 'o') && (toCheck.charAt(3) == 'l') &&
    	((/\s/.test(toCheck.charAt(4))) || (toCheck.charAt(4) == '$'))) return true;
    	else return false; 
    } 
    
     function saysPrint(toCheck) 
    {
    	if ((toCheck.charAt(0) == 'p') && (toCheck.charAt(1) == 'r') && (toCheck.charAt(2) == 'i') && (toCheck.charAt(3) == 'n') &&
    	(toCheck.charAt(4) == 't') && ((/\s/.test(toCheck.charAt(5))) || (toCheck.charAt(5) == '$') || (toCheck.charAt(5) == '('))) return true;
    	else return false; 
    }
    
    function saysWhile(toCheck) 
    {
    	if ((toCheck.charAt(0) == 'w') && (toCheck.charAt(1) == 'h') && (toCheck.charAt(2) == 'i') && (toCheck.charAt(3) == 'l') &&
    	(toCheck.charAt(4) == 'e') && ((/\s/.test(toCheck.charAt(5))) || (toCheck.charAt(5) == '$') || (toCheck.charAt(5) == '('))) return true;
    	else return false; 
    }
    
    function saysTrue(toCheck)
    {
    	if ((toCheck.charAt(0) == 't') && (toCheck.charAt(1) == 'r') && (toCheck.charAt(2) == 'u') && (toCheck.charAt(3) == 'e') &&
    	((/\s/.test(toCheck.charAt(4))) || (toCheck.charAt(4) == '$') || (toCheck.charAt(4) == ')') || (toCheck.charAt(4) == '!')
    	|| (toCheck.charAt(4) == '='))) return true;
    	else return false; 
    }
    
     function saysFalse(toCheck) 
    {
    	if ((toCheck.charAt(0) == 'f') && (toCheck.charAt(1) == 'a') && (toCheck.charAt(2) == 'l') && (toCheck.charAt(3) == 's') &&
    	(toCheck.charAt(4) == 'e') && ((/\s/.test(toCheck.charAt(5))) || (toCheck.charAt(5) == '$') || (toCheck.charAt(5) == ')')
    	|| (toCheck.charAt(5) == '!') || (toCheck.charAt(5) == '='))) return true;
    	else return false; 
    }
    


Type
Location
Full URL	http://labouseur.com/courses/compilers/compilers/harpo/scripts/lexer.js
Scheme	http
Host	labouseur.com
Path	/courses/compilers/compilers/harpo/scripts/lexer.js
Filename	lexer.js
Request & Response
Method	—
Cached	No
Status	—
Code	—