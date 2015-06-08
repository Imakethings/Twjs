/*
 * Author: Mirko van der Waal 
 * Mail: <mvdw at airmail dot cc>
 * Distributed under terms of the GNU2 license.
 */

"use strict";

/**
 * Creates a new typewriter that will write the given text like a typwriter would.
 * 
 * @argument {string} element - The DOM which to write to.
 * @constructor
 */
var Typewriter = function(element)
{
    this.element = document.querySelector(element);    
};

/**
 * Set the current writing cycle, thus the string that needs to be written.
 *
 * @argument {string} cycle - The string to write.
 */
/
Typewriter.prototype.cycle = function(cycle)
{
    this.string = cycle;
};

/**
 * Start or stop writingto the previously given element.
 *
 * @argument {number} delay - The delay between the "keypresses".
 * @argument {boolean} flip - Give 'true' for starting and false for the opposite.
 */
Typewriter.prototype.write = function(delay, flip) 
{   
    var index = 0;
    var timeout;

    /*  States of text. */
    var italic;
    var strike;
    var bold;

    /*  TODO: Implement state to to work as a .lock file. */
    /*  var state; */

    /*  This will be a recursively called function to handle the timeout.
        It will spawn the next process when the previous one finished. */
    function writeCharacter(index, string, element)
    {
        function validate(character)
        {
            if (italic)
                character = character.italics() || '<i>' + character + '</i>';
            if (strike)
                character = character.strike()  || '<strike>' + character + '</strike>';
            if (bold)
                character = character.bold()    || '<b>' + character + '</b>';

            return character;
        }

        /*  Remove the current timeout to prevent a memory leak. */
        window.clearTimeout(timeout);
       
        timeout = window.setTimeout(function() {
            
            var prefix;
            var suffix;
            var finish;
            var tags;
            
            /*  When said character is escaped, we write the character after
                The escape character and perform an extra iteration to skip it. */
            if (string[index] === "\\")
                element.innerHTML += validate(string[1 + (index++)]); 
                
            else
                switch (string[index]) {
                    /*  The '<' case will remove the previous placed character,
                        re-creating the effect of pressing a backspace. */
                    case '<':
                        /*  Everything before the recently written character. */
                        prefix = element.innerHTML.split(
                                element.innerHTML.replace(
                                    /<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/img, ''
                                ).slice(-1)[0]);

                        /*  Everything past the recently written character, this
                            will determine which tags we have to remove. */
                        suffix = prefix.slice(-1)[0];
                        
                        if (suffix.length)
                        {
                            tags = suffix.match(/\w+/g)
                            for(var i = 0; i < tags.length; i++)
                                finish = prefix[0].replace(
                                    new RegExp("\<" + tags[i] + "\>$", "g") ,'');
                            element.innerHTML = finish;
                        }
                        else
                            element.innerHTML = element.innerHTML.slice(0, -1);

                    break;
                       
                    /*  The '*' will format all the text in bold */
                    case '*':
                        bold ? bold = undefined : bold = true; 
                    break;

                    /*  The '~' will format all the text in italic. */
                    case '~':
                        italic ? italic = undefined : italic = true; 
                    break;
                    
                    /*  The '-' will format all the text in strike-through. */
                    case '-':
                        strike ? strike = undefined : strike = true; 
                    break;
                    
                    default:
                        element.innerHTML += validate(string[index]) 
                    break;
                }
           
            index++;

            /*  Ensure that we do not reach past the current cycle state. */
            if (index < string.length)
                writeCharacter(index, string, element)

        }, (delay || 1000));
    };
    writeCharacter(index, this.string, this.element);
};
