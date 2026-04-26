var current_lessons = []
var current_lesson_word_data = {}
 
var all_options = []
var synonym_options = []
var current_synonym = "" 
var anwser_idx = -1
 
var score = 0
var num_of_syns = 0
 
var active = false
var got_wrong = false
 
var buttons = document.querySelectorAll("#anwsers button")
 
function onload() {
    current_lessons = JSON.parse(sessionStorage.getItem("current_lessons")) //get the current lessons
    if (current_lessons.length == 0) {window.location.href = "../../index.html";}
 
    askName(function() { //ask for name before starting
        var title = "Synonym quiz for lesson " //title placeholder
        for (num in current_lessons) { //iterates through all of the lessons
            if (title == "Synonym quiz for lesson ") { //if it's the first lesson just add the number by itself
                title += current_lessons[num]
            } else { //if not, add a comma before
                title += ", " + current_lessons[num]
            }
            
            Object.assign(current_lesson_word_data, lesson_data[current_lessons[num]].words) //add the words from the lesson onto the local word data bank
        }
 
        document.getElementById("title").innerHTML = title //show the lesson names in the title
 
        for (word in current_lesson_word_data) { //iterates through all the words
            for (i in current_lesson_word_data[word].syn) { //iterate through all synonyms in the word
                var data = { //make an object containing the synonym and the word
                    "syn" : current_lesson_word_data[word].syn[i],
                    "word" : word
                }
 
                synonym_options.push(data) //add it to the options to use and the full list of options
                all_options.push(data)
            }
        }
 
        num_of_syns = synonym_options.length //set the number of synonyms to how many options there are
        document.getElementById("score").innerHTML = score + "/" + num_of_syns //display the starting score
        document.getElementById("done").style.display = "none" //hide the completed text thingy
 
        buttons = document.querySelectorAll("#anwsers button") //re-query buttons after DOM is ready
        setQuestion() //sets the first question
    });
}
 
function setQuestion() { //this sets the data for the questions
    current_synonym = synonym_options[Math.floor(Math.random() * synonym_options.length)] //the current synonym that's being questioned
    document.getElementById("question").innerHTML = current_synonym.syn //the question is set to the synonym for the user to see
 
    var correct_word = current_synonym.word //store the correct word for the current word
    var other_words = [] //initiate an array for all the other words
    
    for (data in all_options) { //iterate through all the options
        if (all_options[data].word != correct_word && !other_words.includes(all_options[data].word)) { //if its word is not the correct word and the word isnt already in the the other word options
            other_words.push(all_options[data].word) //add it to the other word options
        }
    }
 
    anwser_idx = Math.floor(Math.random() * 4) //select a random button to have the correct word
 
    buttons.forEach((button, i) => { //iterate through all the buttons
        document.getElementById("anwsers").children[i].style.background = "#000000" //resets the color for all the buttons
        if (i == anwser_idx) { //if this button is the one selected to be the correct one
            button.textContent = correct_word //set the text to the correct button
        } else { //if not the correct button
            var word = other_words[Math.floor(Math.random() * other_words.length)] //pick a word from the other word options
            other_words.splice(other_words.indexOf(word), 1) //remove it so it cannot be used again
            button.textContent = word //set the button's text to the selected word
        }
    })
 
    active = true //allows you to click on buttons
    got_wrong = false //reset the got wrong value
}
 
function buttonClicked(idx) { //runs when a button is clicked, idx is the number of the button
    if (active) { //if the user is allowed to click on buttons
        if (idx == anwser_idx) { //if it's the correct word
            document.getElementById("anwsers").children[idx].style.background = 'green' //make the button green
            active = false //you cannot click on buttons anymore
 
            if (!got_wrong) { //if the user got it right the first time
                score += 1 //increase the score by 1
                document.getElementById("score").innerHTML = score + "/" + num_of_syns //update the score
            }
 
            synonym_options.splice(synonym_options.indexOf(current_synonym), 1) //remove synonym from pool regardless
 
            if (synonym_options.length != 0) { //if there are still words left
                setTimeout(setQuestion, 1000) //update the question after 1 second
            } else { //if there are no more words left
                saveScore("Synonym Test", current_lessons, score, num_of_syns) //save the score
                setTimeout(() => {
                    document.getElementById("done").style.display = "block"
                    document.getElementById("question").style.display = "none"
                    document.getElementById("anwsers").style.display = "none"
                }, 1000)
            }
        } else { //if it's the wrong word — stay on same question
            document.getElementById("anwsers").children[idx].style.background = 'red' //make the button red
            got_wrong = true //the user got a question wrong
        }
    }
}