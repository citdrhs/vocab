var current_lessons = []
 
var usedWords = new Set();
var totalWords;
var correctAnswers = 0;
var got_wrong = false; //tracks if the user has gotten the current word wrong
 
var correctWord;
 
var current_lesson_word_data = {};
 
function onload() { //runs when the spelling words opens up
    current_lessons = JSON.parse(sessionStorage.getItem("current_lessons")) //get the current lessons
    if (current_lessons.length == 0) {window.location.href = "../../index.html";}
 
    askName(function() { //ask for name before starting
        var title = "Spelling test for lesson " //title placeholder
        for (num in current_lessons) { //iterates through all of the lessons
            if (title == "Spelling test for lesson ") { //if it's the first lesson just add the number by itself
                title += current_lessons[num]
            } else { //if not, add a comma before
                title += ", " + current_lessons[num]
            }
            
            Object.assign(current_lesson_word_data, lesson_data[current_lessons[num]].words) //add the words from the lesson onto the local word data bank
        }
 
        document.getElementById("title").innerHTML = title //show the lesson names in the title
 
        correctWord = getNewPrompt() //sets the correct word to what the prompt is set to
        totalWords = Object.keys(current_lesson_word_data).length; //gets the total count of words
        document.getElementById('score').textContent = `Correct answers: 0 out of ${totalWords}`; //displays the initial score
    });
}
 
function getNewPrompt() { //gets a random word and displays the definition
    var wordKeys = Object.keys(current_lesson_word_data); //gets all of the words from the lesson data
 
    var unusedWords = wordKeys.filter(word => !usedWords.has(word)); //removes words that have already been used
 
    if (unusedWords.length === 0) { //if there are no more words left to use
        saveScore("Spelling Test", current_lessons, correctAnswers, totalWords) //save the score
        document.getElementById('feedback').textContent = 'You have completed the quiz!'; //show the end text
        document.getElementById('feedback').style.color = 'blue'; //make it blue
        return null; //end the function
    }
 
    var randomWordKey = unusedWords[Math.floor(Math.random() * unusedWords.length)]; //gets a random word's key
    var randomWord = current_lesson_word_data[randomWordKey]; //set the random word to the word under that key in the lesson data
 
    usedWords.add(randomWordKey); //add the word to used words
    got_wrong = false; //reset got_wrong for the new word
 
    document.getElementById('prompt').textContent = "Definition: " + randomWord.def; //set the prompt to the definition of that word
    return randomWordKey; //return the key of the word
}
 
document.getElementById('testForm').addEventListener('submit', function(event) { //runs when the user submits their typed word for grading
    event.preventDefault(); //cancels if nothing was typed in
    var userAnswer = document.getElementById('userInput').value.trim().toLowerCase(); //get the user input and standardize it to what's in lesson data
 
    if (userAnswer === correctWord) { //if it's the same word
        document.getElementById('feedback').textContent = 'Correct! Well done!'; //show the congrats text
        document.getElementById('feedback').style.color = 'green'; //make it green
 
        document.getElementById('userInput').value = ''; //reset the value in the text box
 
        if (!got_wrong) { //only award point if no wrong attempts
            correctAnswers++;
            document.getElementById('score').textContent = `Correct answers: ${correctAnswers} out of ${totalWords}`; //update the score
        }
 
        correctWord = getNewPrompt(); //get a new prompt
    } else { //if they got it wrong
        document.getElementById('feedback').textContent = 'Oops! That\'s not correct. Try again.'; //show the failure text
        document.getElementById('feedback').style.color = 'red'; //make it red
        got_wrong = true; //mark that they got this word wrong
    }
});