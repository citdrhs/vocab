var current_lessons = []
var current_lesson_word_data = {}

var def_options = []
var current_def = "" 
var anwser_idx = -1

var score = 0
var num_of_defs = 0

var active = false
var got_wrong = false

var buttons = document.querySelectorAll("#anwsers button")

function learnword_onload() {
    if (sessionStorage.getItem("logged_in") !== "true") { window.location.href = "../../login/login.html"; }

    current_lessons = JSON.parse(sessionStorage.getItem("current_lessons"))
    if (current_lessons.length == 0) { window.location.href = "../../index/index.html"; }

    mergeLocalData(function() {
        var title = "Word quiz for lesson "
        for (num in current_lessons) {
            if (title == "Word quiz for lesson ") { title += current_lessons[num] }
            else { title += ", " + current_lessons[num] }
            Object.assign(current_lesson_word_data, lesson_data[current_lessons[num]].words)
        }

        document.getElementById("title").innerHTML = title

        for (word in current_lesson_word_data) {
            def_options.push(current_lesson_word_data[word].def)
        }

        num_of_defs = def_options.length
        document.getElementById("score").innerHTML = score + "/" + num_of_defs
        document.getElementById("done").style.display = "none"

        buttons = document.querySelectorAll("#anwsers button")
        setQuestion()
    });
}

function setQuestion() {
    current_def = def_options[Math.floor(Math.random() * def_options.length)]
    document.getElementById("question").innerHTML = current_def

    var correct_word = ""
    var other_words = []
    for (word in current_lesson_word_data) {
        if (current_lesson_word_data[word].def == current_def) {
            correct_word = word
        } else {
            other_words.push(word)
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
                document.getElementById("score").innerHTML = score + "/" + num_of_defs
            }

            def_options.splice(def_options.indexOf(current_def), 1)

            if (def_options.length != 0) {
                setTimeout(setQuestion, 1000)
            } else {
                saveScore("Word Test", current_lessons, score, num_of_defs)
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