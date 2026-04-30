var allResults = [];
var sortKey = "date";
var sortAsc = false;
var API = "http://localhost:5000/api";

// ── Onload ──
function admin_onload() {
    if (sessionStorage.getItem("logged_in") !== "true" || sessionStorage.getItem("role") !== "admin") {
        window.location.href = "../login/login.html";
        return;
    }
    loadResults();
    renderTable();
    renderManageLessons();
}

function adminLogout() {
    sessionStorage.clear();
    window.location.href = "../login/login.html";
}

// ── Tabs ──
function showTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(function(el) { el.style.display = "none"; });
    document.querySelectorAll(".tab-btn").forEach(function(btn) { btn.classList.remove("active"); });
    document.getElementById("tab-" + tabName).style.display = "block";
    event.target.classList.add("active");
    if (tabName === "createquiz") { renderManageLessons(); }
}

function showSubTab(name) {
    document.querySelectorAll(".sub-tab-content").forEach(function(el) { el.style.display = "none"; });
    document.querySelectorAll(".sub-tab-btn").forEach(function(btn) { btn.classList.remove("active"); });
    document.getElementById("subtab-" + name).style.display = "block";
    event.target.classList.add("active");
    if (name === "manage") { renderManageLessons(); }
}

// ── Add / Edit Word ──
function saveWord() {
    var lessonNum = document.getElementById("aw-lesson").value.trim();
    var word      = document.getElementById("aw-word").value.trim().toLowerCase();
    var ps        = document.getElementById("aw-ps").value.trim();
    var def_      = document.getElementById("aw-def").value.trim();
    var ex        = document.getElementById("aw-ex").value.trim();
    var synRaw    = document.getElementById("aw-syn").value.trim();
    var antRaw    = document.getElementById("aw-ant").value.trim();
    var errorEl   = document.getElementById("aw-error");
    var successEl = document.getElementById("aw-success");

    errorEl.textContent   = "";
    successEl.textContent = "";

    if (!lessonNum || !word || !ps || !def_) {
        errorEl.textContent = "Lesson, word, part of speech and definition are required.";
        return;
    }

    var syn = synRaw ? synRaw.split(",").map(function(s) { return s.trim(); }).filter(Boolean) : [];
    var ant = antRaw ? antRaw.split(",").map(function(s) { return s.trim(); }).filter(Boolean) : [];

    fetch(API + "/lessons/add-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_num: lessonNum, word: word, ps: ps, def: def_, ex: ex, syn: syn, ant: ant })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.error) { errorEl.textContent = data.error; return; }
        successEl.textContent = data.message;
        document.getElementById("aw-word").value = "";
        document.getElementById("aw-ps").value   = "";
        document.getElementById("aw-def").value  = "";
        document.getElementById("aw-ex").value   = "";
        document.getElementById("aw-syn").value  = "";
        document.getElementById("aw-ant").value  = "";
        renderManageLessons();
    })
    .catch(function() { errorEl.textContent = "Could not connect to server."; });
}

function loadWordForEdit() {
    var lessonNum = document.getElementById("aw-lesson").value.trim();
    var word      = document.getElementById("aw-word").value.trim().toLowerCase();
    var errorEl   = document.getElementById("aw-error");

    errorEl.textContent = "";
    if (!lessonNum || !word) { errorEl.textContent = "Enter a lesson number and word to load."; return; }

    fetch(API + "/lessons/" + lessonNum)
    .then(function(r) { return r.json(); })
    .then(function(data) {
        var wordData = data.words[word];
        if (!wordData) {
            // Also check lessondata.js
            if (lesson_data[lessonNum] && lesson_data[lessonNum].words[word]) {
                wordData = lesson_data[lessonNum].words[word];
            }
        }
        if (!wordData) { errorEl.textContent = 'Word "' + word + '" not found in lesson ' + lessonNum + '.'; return; }
        document.getElementById("aw-ps").value  = wordData.ps  || "";
        document.getElementById("aw-def").value = wordData.def || "";
        document.getElementById("aw-ex").value  = wordData.ex  || "";
        document.getElementById("aw-syn").value = (wordData.syn || []).join(", ");
        document.getElementById("aw-ant").value = (wordData.ant || []).join(", ");
    })
    .catch(function() { errorEl.textContent = "Could not connect to server."; });
}

// ── Add / Edit RPS ──
function saveRPS() {
    var lessonNum = document.getElementById("rps-lesson").value.trim();
    var type_     = document.getElementById("rps-type").value;
    var term      = document.getElementById("rps-term").value.trim().toLowerCase();
    var meaning   = document.getElementById("rps-meaning").value.trim();
    var errorEl   = document.getElementById("rps-error");
    var successEl = document.getElementById("rps-success");

    errorEl.textContent   = "";
    successEl.textContent = "";

    if (!lessonNum || !term || !meaning) { errorEl.textContent = "Lesson, term and meaning are required."; return; }

    fetch(API + "/lessons/add-rps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_num: lessonNum, type: type_, term: term, meaning: meaning })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.error) { errorEl.textContent = data.error; return; }
        successEl.textContent = data.message;
        document.getElementById("rps-term").value    = "";
        document.getElementById("rps-meaning").value = "";
        renderManageLessons();
    })
    .catch(function() { errorEl.textContent = "Could not connect to server."; });
}

// ── Delete ──
function populateDeleteOptions() {
    var lessonNum = document.getElementById("del-lesson").value.trim();
    var type_     = document.getElementById("del-type").value;
    var select    = document.getElementById("del-entry");

    select.innerHTML = "<option value=''>-- select entry --</option>";
    if (!lessonNum) return;

    // Get from both API and lessondata.js
    fetch(API + "/lessons/" + lessonNum)
    .then(function(r) { return r.json(); })
    .then(function(apiData) {
        var entries = {};

        if (type_ === "word") {
            // Merge lessondata.js words
            if (lesson_data[lessonNum]) Object.assign(entries, lesson_data[lessonNum].words);
            // Merge API words
            Object.assign(entries, apiData.words || {});
            // Remove deleted
            (apiData.deletedWords || []).forEach(function(w) { delete entries[w]; });

            Object.keys(entries).forEach(function(w) {
                var opt = document.createElement("option");
                opt.value = w; opt.textContent = w;
                select.appendChild(opt);
            });
        } else {
            var base = { roots: {}, prefixes: {}, suffixes: {} };
            if (lesson_data[lessonNum] && lesson_data[lessonNum].rps) {
                Object.assign(base.roots,    lesson_data[lessonNum].rps.roots    || {});
                Object.assign(base.prefixes, lesson_data[lessonNum].rps.prefixes || {});
                Object.assign(base.suffixes, lesson_data[lessonNum].rps.suffixes || {});
            }
            if (apiData.rps) {
                Object.assign(base.roots,    apiData.rps.roots    || {});
                Object.assign(base.prefixes, apiData.rps.prefixes || {});
                Object.assign(base.suffixes, apiData.rps.suffixes || {});
            }
            (apiData.deletedRPS || []).forEach(function(t) {
                delete base.roots[t]; delete base.prefixes[t]; delete base.suffixes[t];
            });
            var allRPS = Object.assign({}, base.roots, base.prefixes, base.suffixes);
            Object.keys(allRPS).forEach(function(t) {
                var opt = document.createElement("option");
                opt.value = t; opt.textContent = t + " — " + allRPS[t];
                select.appendChild(opt);
            });
        }
    })
    .catch(function() {});
}

function deleteEntry() {
    var lessonNum = document.getElementById("del-lesson").value.trim();
    var type_     = document.getElementById("del-type").value;
    var entry     = document.getElementById("del-entry").value;
    var errorEl   = document.getElementById("del-error");
    var successEl = document.getElementById("del-success");

    errorEl.textContent   = "";
    successEl.textContent = "";

    if (!lessonNum || !entry) { errorEl.textContent = "Please select a lesson and entry."; return; }
    if (!confirm('Delete "' + entry + '" from lesson ' + lessonNum + "?")) return;

    var endpoint = type_ === "word" ? "/lessons/delete-word" : "/lessons/delete-rps";
    var body     = type_ === "word"
        ? { lesson_num: lessonNum, word: entry }
        : { lesson_num: lessonNum, term: entry };

    fetch(API + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.error) { errorEl.textContent = data.error; return; }
        successEl.textContent = data.message;
        populateDeleteOptions();
        renderManageLessons();
    })
    .catch(function() { errorEl.textContent = "Could not connect to server."; });
}

// ── Manage Lessons ──
function renderManageLessons() {
    var container = document.getElementById("manage-lessons-list");
    if (!container) return;

    fetch(API + "/lessons")
    .then(function(r) { return r.json(); })
    .then(function(apiLessons) {
        var allNums = new Set([
            ...Object.keys(lesson_data),
            ...Object.keys(apiLessons)
        ]);

        container.innerHTML = "";

        allNums.forEach(function(num) {
            var baseWords = lesson_data[num] ? Object.keys(lesson_data[num].words).length : 0;
            var apiWords  = apiLessons[num]  ? Object.keys(apiLessons[num].words || {}).length : 0;
            var deleted   = apiLessons[num]  ? (apiLessons[num].deletedWords || []).length : 0;
            var wordCount = baseWords + apiWords - deleted;

            var baseRPS = 0;
            if (lesson_data[num] && lesson_data[num].rps) {
                var r = lesson_data[num].rps;
                baseRPS = Object.keys(r.roots||{}).length + Object.keys(r.prefixes||{}).length + Object.keys(r.suffixes||{}).length;
            }
            var apiRPS = 0;
            if (apiLessons[num] && apiLessons[num].rps) {
                var ar = apiLessons[num].rps;
                apiRPS = Object.keys(ar.roots||{}).length + Object.keys(ar.prefixes||{}).length + Object.keys(ar.suffixes||{}).length;
            }
            var rpsCount = baseRPS + apiRPS;

            var isLocal = !lesson_data[num];

            var row = document.createElement("div");
            row.classList.add("manage-row");
            row.innerHTML = `
                <span class="manage-label">Lesson ${num} ${isLocal ? '<span class="local-badge">local</span>' : ''}</span>
                <span class="manage-counts">${wordCount} word(s), ${rpsCount} RPS entry(s)</span>
                ${isLocal ? `<button class="danger-btn small-btn" onclick="deleteLesson('${num}')">Delete Lesson</button>` : ""}
            `;
            container.appendChild(row);
        });

        if (container.innerHTML === "") {
            container.innerHTML = "<p style='color:#888;'>No lessons yet.</p>";
        }
    })
    .catch(function() {
        container.innerHTML = "<p style='color:#c62828;'>Could not connect to server. Is server.py running?</p>";
    });
}

function deleteLesson(lessonNum) {
    if (!confirm("Delete all data for lesson " + lessonNum + "? This cannot be undone.")) return;

    fetch(API + "/lessons/delete-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_num: lessonNum })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        renderManageLessons();
    })
    .catch(function() { alert("Could not connect to server."); });
}

// ── Results ──
function loadResults() {
    allResults = JSON.parse(localStorage.getItem("quiz_results") || "[]");
}

function renderTable() {
    loadResults();

    var nameFilter   = document.getElementById("filter-name").value.trim().toLowerCase();
    var testFilter   = document.getElementById("filter-test").value;
    var lessonFilter = document.getElementById("filter-lesson").value.trim();

    var filtered = allResults.filter(function(r) {
        var nameMatch   = !nameFilter   || r.name.toLowerCase().includes(nameFilter);
        var testMatch   = !testFilter   || r.testType === testFilter;
        var lessonMatch = !lessonFilter || r.lessons.join(", ").includes(lessonFilter);
        return nameMatch && testMatch && lessonMatch;
    });

    filtered.sort(function(a, b) {
        var valA = sortKey === "score" ? (a.score / a.total) : (a[sortKey] || "").toString().toLowerCase();
        var valB = sortKey === "score" ? (b.score / b.total) : (b[sortKey] || "").toString().toLowerCase();
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
    });

    var tbody = document.getElementById("results-body");
    tbody.innerHTML = "";

    if (filtered.length === 0) {
        document.getElementById("no-results").style.display = "block";
        document.getElementById("results-table").style.display = "none";
    } else {
        document.getElementById("no-results").style.display = "none";
        document.getElementById("results-table").style.display = "table";

        filtered.forEach(function(r) {
            var tr  = document.createElement("tr");
            var pct = r.total > 0 ? r.score / r.total : 0;
            var scoreClass = pct >= 0.8 ? "score-high" : pct >= 0.5 ? "score-mid" : "score-low";
            tr.innerHTML = `
                <td>${r.name}</td>
                <td>${r.testType}</td>
                <td>Lesson ${r.lessons.join(", ")}</td>
                <td class="score-cell ${scoreClass}">${r.score} / ${r.total} (${Math.round(pct * 100)}%)</td>
                <td>${r.date}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    var avgPct = filtered.length > 0
        ? Math.round(filtered.reduce(function(sum, r) { return sum + (r.score / r.total); }, 0) / filtered.length * 100)
        : 0;
    document.getElementById("summary").textContent =
        `Showing ${filtered.length} result(s)` + (filtered.length > 0 ? ` — Average score: ${avgPct}%` : "");
}

function sortBy(key) {
    if (sortKey === key) { sortAsc = !sortAsc; } else { sortKey = key; sortAsc = true; }
    renderTable();
}

function clearResults() {
    if (confirm("Are you sure you want to delete ALL results? This cannot be undone.")) {
        localStorage.removeItem("quiz_results");
        renderTable();
    }
}