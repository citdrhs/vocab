var current_lessons = []
var current_lesson_word_data = {}

var word_options = []
var current_word = "" 
var anwser_idx = -1

var score = 0
var num_of_words = 0

var active = false
var got_wrong = false

var buttons = document.querySelectorAll("#anwsers button")

function learndef_onload() {
    if (sessionStorage.getItem("logged_in") !== "true") { window.location.href = "../../login/login.html"; }

    current_lessons = JSON.parse(sessionStorage.getItem("current_lessons"))
    if (current_lessons.length == 0) { window.location.href = "../../index/index.html"; }

    mergeLocalData(function() {
        var title = "Definition quiz for lesson "
        for (num in current_lessons) {
            if (title == "Definition quiz for lesson ") { title += current_lessons[num] }
            else { title += ", " + current_lessons[num] }
            Object.assign(current_lesson_word_data, lesson_data[current_lessons[num]].words)
        }

        document.getElementById("title").innerHTML = title
        word_options = Object.keys(current_lesson_word_data)
        num_of_words = word_options.length
        document.getElementById("score").innerHTML = score + "/" + num_of_words
        document.getElementById("done").style.display = "none"

        buttons = document.querySelectorAll("#anwsers button")
        setQuestion()
    });
}

function setQuestion() {
    current_word = word_options[Math.floor(Math.random() * word_options.length)]
    document.getElementById("question").innerHTML = current_word

    var correct_def = current_lesson_word_data[current_word].def
    var other_defs = []
    for (word in current_lesson_word_data) {
        if (current_lesson_word_data[word].def != correct_def) {
            other_defs.push(current_lesson_word_data[word].def)
        }
    }

    anwser_idx = Math.floor(Math.random() * 4)

    buttons.forEach((button, i) => {
        document.getElementById("anwsers").children[i].style.background = "#000000"
        if (i == anwser_idx) {
            button.textContent = correct_def
        } else {
            var def = other_defs[Math.floor(Math.random() * other_defs.length)]
            other_defs.splice(other_defs.indexOf(def), 1)
            button.textContent = def
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
                document.getElementById("score").innerHTML = score + "/" + num_of_words
            }

            word_options.splice(word_options.indexOf(current_word), 1)

            if (word_options.length != 0) {
                setTimeout(setQuestion, 1000)
            } else {
                saveScore("Definition Test", current_lessons, score, num_of_words)
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