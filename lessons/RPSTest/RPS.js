var current_lessons = [];
var current_lesson_rps_data = { roots: {}, prefixes: {}, suffixes: {}, words: {}, sentences: {} };
 
var allQuestions = []; // list of all question objects
var currentQuestionIndex = 0;
var correctAnswers = 0;
 
function onload() {
    current_lessons = JSON.parse(sessionStorage.getItem("current_lessons"));
    if (current_lessons.length == 0) { window.location.href = "../../index.html"; }
 
    // Build title
    var title = "RPS Test for Lesson ";
    for (var num in current_lessons) {
        if (title == "RPS Test for Lesson ") {
            title += current_lessons[num];
        } else {
            title += ", " + current_lessons[num];
        }
 
        // Merge RPS data from each lesson
        var rps = lesson_data[current_lessons[num]].rps;
        Object.assign(current_lesson_rps_data.roots, rps.roots);
        Object.assign(current_lesson_rps_data.prefixes, rps.prefixes);
        Object.assign(current_lesson_rps_data.suffixes, rps.suffixes);
        Object.assign(current_lesson_rps_data.words, rps.words);
        Object.assign(current_lesson_rps_data.sentences, rps.sentences);
    }
 
    document.getElementById("title").innerHTML = title;
 
    // Build all questions
    allQuestions = buildQuestions();
 
    if (allQuestions.length === 0) {
        document.getElementById("prompt").textContent = "No RPS data available for this lesson.";
        document.getElementById("answers").innerHTML = "";
        document.getElementById("question-type").textContent = "";
        document.getElementById("score").textContent = "";
        return;
    }
 
    // Shuffle questions
    allQuestions = shuffle(allQuestions);
 
    document.getElementById("score").textContent = `Question 1 of ${allQuestions.length}`;
    showQuestion(0);
}
 
function buildQuestions() {
    var questions = [];
 
    // All possible meanings for wrong answers (from roots + prefixes + suffixes)
    var allMeanings = [];
    for (var r in current_lesson_rps_data.roots) allMeanings.push(current_lesson_rps_data.roots[r]);
    for (var p in current_lesson_rps_data.prefixes) allMeanings.push(current_lesson_rps_data.prefixes[p]);
    for (var s in current_lesson_rps_data.suffixes) allMeanings.push(current_lesson_rps_data.suffixes[s]);
 
    // TYPE 1: "What does [root/prefix/suffix] mean?" → answer is the meaning
    var rpsEntries = [
        ...Object.entries(current_lesson_rps_data.roots),
        ...Object.entries(current_lesson_rps_data.prefixes),
        ...Object.entries(current_lesson_rps_data.suffixes)
    ];
 
    for (var i = 0; i < rpsEntries.length; i++) {
        var entry = rpsEntries[i];
        var term = entry[0];
        var meaning = entry[1];
 
        var wrongChoices = allMeanings.filter(m => m !== meaning);
        wrongChoices = shuffle(wrongChoices).slice(0, 3);
 
        // If not enough wrong choices, skip
        if (wrongChoices.length < 1) continue;
 
        var choices = shuffle([meaning, ...wrongChoices]);
 
        questions.push({
            type: "meaning",
            prompt: 'What does "' + term + '" mean?',
            label: "Root / Prefix / Suffix",
            correct: meaning,
            choices: choices
        });
    }
 
    // TYPE 2: Sentence fill-in-the-blank (if any sentences exist)
    // sentences format: { "sentence with ____" : "answer" }
    for (var sentence in current_lesson_rps_data.sentences) {
        var answer = current_lesson_rps_data.sentences[sentence];
 
        // Build wrong choices from all rps terms
        var allTerms = [
            ...Object.keys(current_lesson_rps_data.roots),
            ...Object.keys(current_lesson_rps_data.prefixes),
            ...Object.keys(current_lesson_rps_data.suffixes)
        ];
        var wrongTerms = allTerms.filter(t => t !== answer);
        wrongTerms = shuffle(wrongTerms).slice(0, 3);
 
        if (wrongTerms.length < 1) continue;
 
        var choices = shuffle([answer, ...wrongTerms]);
 
        questions.push({
            type: "sentence",
            prompt: sentence,
            label: "Fill in the blank",
            correct: answer,
            choices: choices
        });
    }
 
    // TYPE 2b: Word fill-in-the-blank (if any words exist)
    // words format: { "word" : "definition or sentence" }
    for (var word in current_lesson_rps_data.words) {
        var wordAnswer = current_lesson_rps_data.words[word];
 
        var allTerms2 = [
            ...Object.keys(current_lesson_rps_data.roots),
            ...Object.keys(current_lesson_rps_data.prefixes),
            ...Object.keys(current_lesson_rps_data.suffixes)
        ];
        var wrongTerms2 = allTerms2.filter(t => t !== wordAnswer);
        wrongTerms2 = shuffle(wrongTerms2).slice(0, 3);
 
        if (wrongTerms2.length < 1) continue;
 
        var choices2 = shuffle([wordAnswer, ...wrongTerms2]);
 
        questions.push({
            type: "word",
            prompt: word,
            label: "Identify the root / prefix / suffix",
            correct: wordAnswer,
            choices: choices2
        });
    }
 
    return questions;
}
 
function showQuestion(index) {
    if (index >= allQuestions.length) {
        endQuiz();
        return;
    }
 
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
}
 
function checkAnswer(selected) {
    var q = allQuestions[currentQuestionIndex];
 
    // Disable all buttons
    var buttons = document.querySelectorAll("#answers button");
    buttons.forEach(function(btn) {
        btn.disabled = true;
        if (btn.getAttribute("data-choice") === q.correct) {
            btn.classList.add("correct");
        } else if (btn.getAttribute("data-choice") === selected && selected !== q.correct) {
            btn.classList.add("wrong");
        }
    });
 
    var feedback = document.getElementById("feedback");
    if (selected === q.correct) {
        feedback.textContent = "Correct!";
        feedback.style.color = "green";
        correctAnswers++;
    } else {
        feedback.textContent = 'Incorrect! The answer was "' + q.correct + '".';
        feedback.style.color = "red";
    }
 
    // Move to next question after a short delay
    currentQuestionIndex++;
    setTimeout(function() {
        showQuestion(currentQuestionIndex);
    }, 1200);
}
 
function endQuiz() {
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