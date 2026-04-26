var current_lessons = []
 
var wordcontainer = document.getElementById("word-container");
var rpscontainer = document.getElementById("rps-container");
 
// ── Auth helpers ──
// Called from index/index.html — login is at ../login/login.html
function requireLoginIndex() {
    if (sessionStorage.getItem("logged_in") !== "true") {
        window.location.href = "../login/login.html";
    }
}
 
// Called from lessons/lessons.html — login is at ../login/login.html
function requireLoginLessons() {
    if (sessionStorage.getItem("logged_in") !== "true") {
        window.location.href = "../login/login.html";
    }
}
 
function logout() {
    sessionStorage.clear();
    window.location.href = "../login/login.html";
}
 
// ── Index page ──
function index_onload() {
    requireLoginIndex();
    sessionStorage.setItem("current_lessons", JSON.stringify([])) //reset everything
    document.getElementById("gotoall").style.display = "none"
 
    var name = sessionStorage.getItem("student_name") || "";
    document.getElementById("welcome-text").textContent = "Welcome, " + name + "!";
}
 
function index_addLesson(lessonNum) { //sets the lesson # to use
    if (!current_lessons.includes(lessonNum)) {
        current_lessons.push(lessonNum)
    } else {
        current_lessons.splice(current_lessons.indexOf(lessonNum), 1)
    }
 
    sessionStorage.setItem("current_lessons", JSON.stringify(current_lessons))
 
    if (current_lessons.length != 0) {
        document.getElementById("gotoall").style.display = "block"
    } else {
        document.getElementById("gotoall").style.display = "none"
    }
}
 
function index_setLesson(lessonNum) {
    sessionStorage.setItem("current_lessons", JSON.stringify([lessonNum]))
}
 
// ── Lessons page ──
function lessons_onload() {
    requireLoginLessons();
    current_lessons = JSON.parse(sessionStorage.getItem("current_lessons"));
    if (current_lessons.length == 0) { window.location.href = "../index/index.html"; }
 
    var title = "Lesson ";
    for (num in current_lessons) {
        if (title == "Lesson ") {
            title += current_lessons[num];
        } else {
            title += ", " + current_lessons[num];
        }
    }
    document.getElementById("title").innerHTML = title;
 
    wordcontainer.innerHTML = "";
    for (lesson in current_lessons) { addKards(current_lessons[lesson]); }
 
    rpscontainer.innerHTML = "";
    for (lesson in current_lessons) { addRPS(current_lessons[lesson]); }
}
 
function addKards(lessonID) {
    var lesson = lesson_data[lessonID];
    for (var word in lesson.words) {
        var data = lesson.words[word];
 
        var wordbox = document.createElement("div");
        wordbox.classList.add("word-box");
 
        var wordtitle = document.createElement("h3");
        wordtitle.textContent = word;
        wordbox.appendChild(wordtitle);
 
        var ps = document.createElement("p");
        ps.textContent = "(" + data.ps + ") " + data.def;
        wordbox.appendChild(ps);
 
        wordcontainer.appendChild(wordbox);
    }
}
 
function addRPS(lessonID) {
    var rps = lesson_data[lessonID].rps;
 
    var types = [
        { key: "roots",    label: "Roots"    },
        { key: "prefixes", label: "Prefixes" },
        { key: "suffixes", label: "Suffixes" }
    ];
 
    for (var t = 0; t < types.length; t++) {
        var type    = types[t];
        var entries = rps[type.key];
 
        if (Object.keys(entries).length === 0) continue;
 
        var header = document.createElement("h3");
        header.textContent = type.label;
        header.classList.add("rps-section-header");
        rpscontainer.appendChild(header);
 
        for (var term in entries) {
            var meaning = entries[term];
 
            var box = document.createElement("div");
            box.classList.add("word-box", "rps-box");
 
            var termEl = document.createElement("h3");
            termEl.textContent = term;
            box.appendChild(termEl);
 
            var meaningEl = document.createElement("p");
            meaningEl.textContent = meaning;
            box.appendChild(meaningEl);
 
            rpscontainer.appendChild(box);
        }
    }
}