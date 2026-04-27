var current_lessons = []
 
var wordcontainer = document.getElementById("word-container");
var rpscontainer  = document.getElementById("rps-container");
 
// ── Merge localStorage lessons into lesson_data ──
function mergeLocalData() {
    var local = JSON.parse(localStorage.getItem("local_lessons") || "{}");
 
    for (var lessonNum in local) {
        if (!lesson_data[lessonNum]) {
            lesson_data[lessonNum] = {
                words: {},
                rps: { roots: {}, prefixes: {}, suffixes: {}, words: {}, sentences: {} }
            };
        }
 
        // Merge words
        Object.assign(lesson_data[lessonNum].words, local[lessonNum].words || {});
 
        // Apply word deletions
        var deletedWords = local[lessonNum].deletedWords || [];
        deletedWords.forEach(function(w) { delete lesson_data[lessonNum].words[w]; });
 
        // Merge RPS
        if (local[lessonNum].rps) {
            if (!lesson_data[lessonNum].rps) {
                lesson_data[lessonNum].rps = { roots: {}, prefixes: {}, suffixes: {}, words: {}, sentences: {} };
            }
            Object.assign(lesson_data[lessonNum].rps.roots,     local[lessonNum].rps.roots     || {});
            Object.assign(lesson_data[lessonNum].rps.prefixes,  local[lessonNum].rps.prefixes  || {});
            Object.assign(lesson_data[lessonNum].rps.suffixes,  local[lessonNum].rps.suffixes  || {});
            Object.assign(lesson_data[lessonNum].rps.words,     local[lessonNum].rps.words     || {});
            Object.assign(lesson_data[lessonNum].rps.sentences, local[lessonNum].rps.sentences || {});
 
            // Apply RPS deletions
            var deletedRPS = local[lessonNum].deletedRPS || [];
            deletedRPS.forEach(function(t) {
                delete lesson_data[lessonNum].rps.roots[t];
                delete lesson_data[lessonNum].rps.prefixes[t];
                delete lesson_data[lessonNum].rps.suffixes[t];
            });
        }
    }
}
 
// ── Auth helpers ──
function requireLoginIndex() {
    if (sessionStorage.getItem("logged_in") !== "true") {
        window.location.href = "../login/login.html";
    }
}
 
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
    mergeLocalData();
 
    sessionStorage.setItem("current_lessons", JSON.stringify([]))
    document.getElementById("gotoall").style.display = "none"
 
    var name = sessionStorage.getItem("student_name") || "";
    document.getElementById("welcome-text").textContent = "Welcome, " + name + "!";
 
    renderLessonButtons();
}
 
function renderLessonButtons() {
    var container = document.getElementById("lesson_container");
    if (!container) return;
 
    container.innerHTML = "";
 
    var lessonNums = Object.keys(lesson_data).sort(function(a, b) { return parseInt(a) - parseInt(b); });
 
    lessonNums.forEach(function(num, i) {
        var colorClass = i % 2 === 0 ? "blue" : "lightblue";
 
        var wrapper = document.createElement("div");
        wrapper.classList.add("lesson-button-wrapper", colorClass);
 
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.onclick = (function(n) { return function() { index_addLesson(n); }; })(num);
 
        var link = document.createElement("a");
        link.href = "../lessons/lessons.html";
        link.classList.add("lesson-button-wrapper", colorClass);
        link.textContent = num;
        link.onclick = (function(n) { return function() { index_setLesson(n); }; })(num);
 
        wrapper.appendChild(checkbox);
        wrapper.appendChild(link);
        container.appendChild(wrapper);
    });
}
 
function index_addLesson(lessonNum) {
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
    mergeLocalData();
 
    current_lessons = JSON.parse(sessionStorage.getItem("current_lessons"));
    if (current_lessons.length == 0) { window.location.href = "../index/index.html"; }
 
    var title = "Lesson ";
    for (var num in current_lessons) {
        if (title == "Lesson ") {
            title += current_lessons[num];
        } else {
            title += ", " + current_lessons[num];
        }
    }
    document.getElementById("title").innerHTML = title;
 
    wordcontainer.innerHTML = "";
    for (var lesson in current_lessons) { addKards(current_lessons[lesson]); }
 
    rpscontainer.innerHTML = "";
    for (var lesson in current_lessons) { addRPS(current_lessons[lesson]); }
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
    var rps   = lesson_data[lessonID].rps;
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
            var box = document.createElement("div");
            box.classList.add("word-box", "rps-box");
 
            var termEl = document.createElement("h3");
            termEl.textContent = term;
            box.appendChild(termEl);
 
            var meaningEl = document.createElement("p");
            meaningEl.textContent = entries[term];
            box.appendChild(meaningEl);
 
            rpscontainer.appendChild(box);
        }
    }
}