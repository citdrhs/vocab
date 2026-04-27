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
    if (sessionStorage.getItem("logged_in") !== "true") { window.location.href = "../../login/login.html"; }

    current_lessons = JSON.parse(sessionStorage.getItem("current_lessons"))
    if (current_lessons.length == 0) { window.location.href = "../../index/index.html"; }

    var title = "Synonym quiz for lesson "
    for (num in current_lessons) {
        if (title == "Synonym quiz for lesson ") {
            title += current_lessons[num]
        } else {
            title += ", " + current_lessons[num]
        }
        Object.assign(current_lesson_word_data, lesson_data[current_lessons[num]].words)
    }

    document.getElementById("title").innerHTML = title

    for (word in current_lesson_word_data) {
        for (i in current_lesson_word_data[word].syn) {
            var data = {
                "syn" : current_lesson_word_data[word].syn[i],
                "word" : word
            }
            synonym_options.push(data)
            all_options.push(data)
        }
    }

    num_of_syns = synonym_options.length
    document.getElementById("score").innerHTML = score + "/" + num_of_syns
    document.getElementById("done").style.display = "none"

    buttons = document.querySelectorAll("#anwsers button")
    setQuestion()
}

function setQuestion() {
    current_synonym = synonym_options[Math.floor(Math.random() * synonym_options.length)]
    document.getElementById("question").innerHTML = current_synonym.syn

    var correct_word = current_synonym.word
    var other_words = []

    for (data in all_options) {
        if (all_options[data].word != correct_word && !other_words.includes(all_options[data].word)) {
            other_words.push(all_options[data].word)
        }
    }

    anwser_idx = Math.floor(Math.random() * 4)

    buttons.forEach((button, i) => {
        document.getElementById("anwsers").children[i].style.background = "#000000"
        if (i == anwser_idx) {
            button.textContent = correct_word
        } else {
            var word = other_words[Math.floor(Math.random() * other_words.length)]
            other_words.splice(other_words.indexOf(word), 1)
            button.textContent = word
        }
    })

    active = true
    got_wrong = false
}

function buttonClicked(idx) {
    if (active) {
        if (idx == anwser_idx) {
            document.getElementById("anwsers").children[idx].style.background = 'green'
            active = false

            if (!got_wrong) {
                score += 1
                document.getElementById("score").innerHTML = score + "/" + num_of_syns
            }

            synonym_options.splice(synonym_options.indexOf(current_synonym), 1)

            if (synonym_options.length != 0) {
                setTimeout(setQuestion, 1000)
            } else {
                saveScore("Synonym Test", current_lessons, score, num_of_syns)
                setTimeout(() => {
                    document.getElementById("done").style.display = "block"
                    document.getElementById("question").style.display = "none"
                    document.getElementById("anwsers").style.display = "none"
                }, 1000)
            }
        } else {
            document.getElementById("anwsers").children[idx].style.background = 'red'
            got_wrong = true
        }
    }
}