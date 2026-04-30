var allResults = [];
var sortKey = "date";
var sortAsc = false;

// ── Helpers to get merged lesson data ──
function getLocalLessons() {
    return JSON.parse(localStorage.getItem("local_lessons") || "{}");
}

function saveLocalLessons(data) {
    localStorage.setItem("local_lessons", JSON.stringify(data));
}

function getMergedLesson(lessonNum) {
    var local = getLocalLessons();
    var base  = (lesson_data[lessonNum]) ? JSON.parse(JSON.stringify(lesson_data[lessonNum])) : {
        words: {},
        rps: { roots: {}, prefixes: {}, suffixes: {}, words: {}, sentences: {} }
    };

    if (local[lessonNum]) {
        // Merge words
        Object.assign(base.words, local[lessonNum].words || {});
        // Merge deletions
        var deletedWords = local[lessonNum].deletedWords || [];
        deletedWords.forEach(function(w) { delete base.words[w]; });
        // Merge RPS
        if (local[lessonNum].rps) {
            Object.assign(base.rps.roots,     local[lessonNum].rps.roots     || {});
            Object.assign(base.rps.prefixes,  local[lessonNum].rps.prefixes  || {});
            Object.assign(base.rps.suffixes,  local[lessonNum].rps.suffixes  || {});
            Object.assign(base.rps.words,     local[lessonNum].rps.words     || {});
            Object.assign(base.rps.sentences, local[lessonNum].rps.sentences || {});
            // Merge RPS deletions
            var deletedRPS = local[lessonNum].deletedRPS || [];
            deletedRPS.forEach(function(term) {
                delete base.rps.roots[term];
                delete base.rps.prefixes[term];
                delete base.rps.suffixes[term];
            });
        }
    }
    return base;
}

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
    var def       = document.getElementById("aw-def").value.trim();
    var ex        = document.getElementById("aw-ex").value.trim();
    var synRaw    = document.getElementById("aw-syn").value.trim();
    var antRaw    = document.getElementById("aw-ant").value.trim();
    var errorEl   = document.getElementById("aw-error");
    var successEl = document.getElementById("aw-success");

    errorEl.textContent   = "";
    successEl.textContent = "";

    if (!lessonNum || !word || !ps || !def) {
        errorEl.textContent = "Lesson, word, part of speech and definition are required.";
        return;
    }

    var syn = synRaw ? synRaw.split(",").map(function(s) { return s.trim(); }).filter(Boolean) : [];
    var ant = antRaw ? antRaw.split(",").map(function(s) { return s.trim(); }).filter(Boolean) : [];

    var local = getLocalLessons();

    if (!local[lessonNum]) {
        local[lessonNum] = { words: {}, deletedWords: [], rps: { roots: {}, prefixes: {}, suffixes: {}, words: {}, sentences: {} }, deletedRPS: [] };
    }

    local[lessonNum].words[word] = { ps: ps, def: def, ex: ex, syn: syn, ant: ant };

    // Remove from deletedWords if it was previously deleted
    local[lessonNum].deletedWords = (local[lessonNum].deletedWords || []).filter(function(w) { return w !== word; });

    saveLocalLessons(local);
    successEl.textContent = "Word \"" + word + "\" saved to lesson " + lessonNum + "!";

    // Clear form
    document.getElementById("aw-word").value = "";
    document.getElementById("aw-ps").value   = "";
    document.getElementById("aw-def").value  = "";
    document.getElementById("aw-ex").value   = "";
    document.getElementById("aw-syn").value  = "";
    document.getElementById("aw-ant").value  = "";

    renderManageLessons();
}

function loadWordForEdit() {
    var lessonNum = document.getElementById("aw-lesson").value.trim();
    var word      = document.getElementById("aw-word").value.trim().toLowerCase();
    var errorEl   = document.getElementById("aw-error");

    errorEl.textContent = "";

    if (!lessonNum || !word) {
        errorEl.textContent = "Enter a lesson number and word to load.";
        return;
    }

    var merged = getMergedLesson(lessonNum);
    var data   = merged.words[word];

    if (!data) {
        errorEl.textContent = "Word \"" + word + "\" not found in lesson " + lessonNum + ".";
        return;
    }

    document.getElementById("aw-ps").value  = data.ps  || "";
    document.getElementById("aw-def").value = data.def || "";
    document.getElementById("aw-ex").value  = data.ex  || "";
    document.getElementById("aw-syn").value = (data.syn || []).join(", ");
    document.getElementById("aw-ant").value = (data.ant || []).join(", ");
}

// ── Add / Edit RPS ──
function saveRPS() {
    var lessonNum = document.getElementById("rps-lesson").value.trim();
    var type      = document.getElementById("rps-type").value;
    var term      = document.getElementById("rps-term").value.trim().toLowerCase();
    var meaning   = document.getElementById("rps-meaning").value.trim();
    var errorEl   = document.getElementById("rps-error");
    var successEl = document.getElementById("rps-success");

    errorEl.textContent   = "";
    successEl.textContent = "";

    if (!lessonNum || !term || !meaning) {
        errorEl.textContent = "Lesson, term and meaning are required.";
        return;
    }

    var local = getLocalLessons();

    if (!local[lessonNum]) {
        local[lessonNum] = { words: {}, deletedWords: [], rps: { roots: {}, prefixes: {}, suffixes: {}, words: {}, sentences: {} }, deletedRPS: [] };
    }
    if (!local[lessonNum].rps) {
        local[lessonNum].rps = { roots: {}, prefixes: {}, suffixes: {}, words: {}, sentences: {} };
    }

    local[lessonNum].rps[type][term] = meaning;

    // Remove from deletedRPS if previously deleted
    local[lessonNum].deletedRPS = (local[lessonNum].deletedRPS || []).filter(function(t) { return t !== term; });

    saveLocalLessons(local);
    successEl.textContent = "\"" + term + "\" saved as " + type.slice(0, -1) + " in lesson " + lessonNum + "!";

    document.getElementById("rps-term").value    = "";
    document.getElementById("rps-meaning").value = "";

    renderManageLessons();
}

// ── Delete ──
function populateDeleteOptions() {
    var lessonNum = document.getElementById("del-lesson").value.trim();
    var type      = document.getElementById("del-type").value;
    var select    = document.getElementById("del-entry");

    select.innerHTML = "<option value=''>-- select entry --</option>";

    if (!lessonNum) return;

    var merged = getMergedLesson(lessonNum);

    if (type === "word") {
        Object.keys(merged.words).forEach(function(w) {
            var opt = document.createElement("option");
            opt.value = w;
            opt.textContent = w;
            select.appendChild(opt);
        });
    } else {
        var allRPS = Object.assign({}, merged.rps.roots, merged.rps.prefixes, merged.rps.suffixes);
        Object.keys(allRPS).forEach(function(t) {
            var opt = document.createElement("option");
            opt.value = t;
            opt.textContent = t + " — " + allRPS[t];
            select.appendChild(opt);
        });
    }
}

function deleteEntry() {
    var lessonNum = document.getElementById("del-lesson").value.trim();
    var type      = document.getElementById("del-type").value;
    var entry     = document.getElementById("del-entry").value;
    var errorEl   = document.getElementById("del-error");
    var successEl = document.getElementById("del-success");

    errorEl.textContent   = "";
    successEl.textContent = "";

    if (!lessonNum || !entry) {
        errorEl.textContent = "Please select a lesson and entry.";
        return;
    }

    if (!confirm("Delete \"" + entry + "\" from lesson " + lessonNum + "?")) return;

    var local = getLocalLessons();

    if (!local[lessonNum]) {
        local[lessonNum] = { words: {}, deletedWords: [], rps: { roots: {}, prefixes: {}, suffixes: {}, words: {}, sentences: {} }, deletedRPS: [] };
    }

    if (type === "word") {
        // Delete from local additions
        if (local[lessonNum].words && local[lessonNum].words[entry]) {
            delete local[lessonNum].words[entry];
        }
        // Mark as deleted so it's hidden from lessondata.js too
        if (!local[lessonNum].deletedWords) local[lessonNum].deletedWords = [];
        if (!local[lessonNum].deletedWords.includes(entry)) {
            local[lessonNum].deletedWords.push(entry);
        }
    } else {
        if (local[lessonNum].rps) {
            delete local[lessonNum].rps.roots[entry];
            delete local[lessonNum].rps.prefixes[entry];
            delete local[lessonNum].rps.suffixes[entry];
        }
        if (!local[lessonNum].deletedRPS) local[lessonNum].deletedRPS = [];
        if (!local[lessonNum].deletedRPS.includes(entry)) {
            local[lessonNum].deletedRPS.push(entry);
        }
    }

    saveLocalLessons(local);
    successEl.textContent = "\"" + entry + "\" deleted from lesson " + lessonNum + ".";
    populateDeleteOptions();
    renderManageLessons();
}

// ── Manage Lessons ──
function renderManageLessons() {
    var container = document.getElementById("manage-lessons-list");
    if (!container) return;

    var local = getLocalLessons();
    var allLessons = new Set([
        ...Object.keys(lesson_data),
        ...Object.keys(local)
    ]);

    container.innerHTML = "";

    allLessons.forEach(function(num) {
        var merged     = getMergedLesson(num);
        var wordCount  = Object.keys(merged.words).length;
        var rpsCount   = Object.keys(merged.rps.roots).length + Object.keys(merged.rps.prefixes).length + Object.keys(merged.rps.suffixes).length;
        var isLocal    = !lesson_data[num];

        var row = document.createElement("div");
        row.classList.add("manage-row");

        row.innerHTML = `
            <span class="manage-label">Lesson ${num} ${isLocal ? '<span class="local-badge">local</span>' : ''}</span>
            <span class="manage-counts">${wordCount} word(s), ${rpsCount} RPS entry(s)</span>
            ${isLocal ? `<button class="danger-btn small-btn" onclick="deleteLesson('${num}')">Delete Lesson</button>` : ""}
        `;

        container.appendChild(row);
    });
}

function deleteLesson(lessonNum) {
    if (!confirm("Delete all local data for lesson " + lessonNum + "? This cannot be undone.")) return;

    var local = getLocalLessons();
    delete local[lessonNum];
    saveLocalLessons(local);
    renderManageLessons();
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

