var current_lessons = [];
var current_lesson_rps_data = { roots: {}, prefixes: {}, suffixes: {}, words: {}, sentences: {} };

var allQuestions = [];
var currentQuestionIndex = 0;
var correctAnswers = 0;
var active = false;
var got_wrong = false;

function onload() {
    if (sessionStorage.getItem("logged_in") !== "true") { window.location.href = "../../login/login.html"; }

    current_lessons = JSON.parse(sessionStorage.getItem("current_lessons"));
    if (current_lessons.length == 0) { window.location.href = "../../index/index.html"; }

    var title = "RPS Test for Lesson ";
    for (var num in current_lessons) {
        if (title == "RPS Test for Lesson ") {
            title += current_lessons[num];
        } else {
            title += ", " + current_lessons[num];
        }

        var rps = lesson_data[current_lessons[num]].rps;
        Object.assign(current_lesson_rps_data.roots,     rps.roots);
        Object.assign(current_lesson_rps_data.prefixes,  rps.prefixes);
        Object.assign(current_lesson_rps_data.suffixes,  rps.suffixes);
        Object.assign(current_lesson_rps_data.words,     rps.words);
        Object.assign(current_lesson_rps_data.sentences, rps.sentences);
    }

    document.getElementById("title").innerHTML = title;

    allQuestions = buildQuestions();

    if (allQuestions.length === 0) {
        document.getElementById("prompt").textContent = "No RPS data available for this lesson.";
        document.getElementById("answers").innerHTML = "";
        document.getElementById("question-type").textContent = "";
        document.getElementById("score").textContent = "";
        return;
    }

    allQuestions = shuffle(allQuestions);
    document.getElementById("score").textContent = `Question 1 of ${allQuestions.length}`;
    showQuestion(0);
}

function buildQuestions() {
    var questions = [];

    var rpsEntries = [
        ...Object.entries(current_lesson_rps_data.roots),
        ...Object.entries(current_lesson_rps_data.prefixes),
        ...Object.entries(current_lesson_rps_data.suffixes)
    ];

    // TYPE 1: What does [term] mean?
    for (var i = 0; i < rpsEntries.length; i++) {
        var term    = rpsEntries[i][0];
        var meaning = rpsEntries[i][1];

        var wrongChoices = rpsEntries.filter(e => e[0] !== term).map(e => e[1]);
        wrongChoices = [...new Set(wrongChoices)];
        wrongChoices = shuffle(wrongChoices).slice(0, 3);

        if (wrongChoices.length < 1) continue;

        questions.push({
            type:    "meaning",
            prompt:  'What does "' + term + '" mean?',
            label:   "Root / Prefix / Suffix",
            correct: meaning,
            choices: shuffle([meaning, ...wrongChoices])
        });
    }

    // TYPE 2: Sentence fill-in-the-blank
    for (var sentence in current_lesson_rps_data.sentences) {
        var answer   = current_lesson_rps_data.sentences[sentence];
        var allTerms = rpsEntries.map(e => e[0]);
        var wrongTerms = shuffle(allTerms.filter(t => t !== answer)).slice(0, 3);
        if (wrongTerms.length < 1) continue;

        questions.push({
            type:    "sentence",
            prompt:  sentence,
            label:   "Fill in the blank",
            correct: answer,
            choices: shuffle([answer, ...wrongTerms])
        });
    }

    // TYPE 2b: Word identification
    for (var word in current_lesson_rps_data.words) {
        var wordAnswer = current_lesson_rps_data.words[word];
        var allTerms2  = rpsEntries.map(e => e[0]);
        var wrongTerms2 = shuffle(allTerms2.filter(t => t !== wordAnswer)).slice(0, 3);
        if (wrongTerms2.length < 1) continue;

        questions.push({
            type:    "word",
            prompt:  word,
            label:   "Identify the root / prefix / suffix",
            correct: wordAnswer,
            choices: shuffle([wordAnswer, ...wrongTerms2])
        });
    }

    return questions;
}

function showQuestion(index) {
    if (index >= allQuestions.length) { endQuiz(); return; }

    var q = allQuestions[index];
    document.getElementById("question-type").textContent = q.label;
    document.getElementById("prompt").textContent = q.prompt;
    document.getElementById("feedback").textContent = "";

    var answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";

    for (var i = 0; i < q.choices.length; i++) {
        var btn = document.createElement("button");
        btn.textContent = q.choices[i];
        btn.setAttribute("data-choice", q.choices[i]);
        btn.onclick = (function(choice) {
            return function() { checkAnswer(choice); };
        })(q.choices[i]);
        answersDiv.appendChild(btn);
    }

    document.getElementById("score").textContent = `Question ${index + 1} of ${allQuestions.length}`;
    active = true;
    got_wrong = false;
}

function checkAnswer(selected) {
    if (!active) return;

    var q        = allQuestions[currentQuestionIndex];
    var btns     = document.querySelectorAll("#answers button");
    var feedback = document.getElementById("feedback");

    if (selected === q.correct) {
        btns.forEach(function(btn) {
            if (btn.getAttribute("data-choice") === q.correct) btn.classList.add("correct");
        });
        active = false;

        feedback.textContent = "Correct!";
        feedback.style.color = "green";

        if (!got_wrong) { correctAnswers++; }

        currentQuestionIndex++;
        setTimeout(function() { showQuestion(currentQuestionIndex); }, 1000);

    } else {
        btns.forEach(function(btn) {
            if (btn.getAttribute("data-choice") === selected) btn.classList.add("wrong");
        });

        feedback.textContent = "Incorrect! Try again.";
        feedback.style.color = "red";
        got_wrong = true;
    }
}

function endQuiz() {
    saveScore("RPS Test", current_lessons, correctAnswers, allQuestions.length);

    document.getElementById("prompt").textContent = "";
    document.getElementById("question-type").textContent = "";
    document.getElementById("answers").innerHTML = "";
    document.getElementById("feedback").textContent = "";
    document.getElementById("score").textContent = "";
    document.getElementById("nav-buttons").style.display = "none";

    var done = document.getElementById("done");
    done.style.display = "block";
    document.getElementById("done-text").textContent =
        "Quiz complete! You got " + correctAnswers + " out of " + allQuestions.length + " correct.";
}

function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
}