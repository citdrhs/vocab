var allResults = [];
var sortKey = "date";
var sortAsc = false;
 
function admin_onload() {
    // Redirect to login if not logged in as admin
    if (sessionStorage.getItem("logged_in") !== "true" || sessionStorage.getItem("role") !== "admin") {
        window.location.href = "../login/login.html";
        return;
    }
 
    loadResults();
    renderTable();
}
 
function adminLogout() {
    sessionStorage.clear();
    window.location.href = "../login/login.html";
}
 
// ── Tabs ──
function showTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(function(el) {
        el.style.display = "none";
    });
    document.querySelectorAll(".tab-btn").forEach(function(btn) {
        btn.classList.remove("active");
    });
 
    document.getElementById("tab-" + tabName).style.display = "block";
    event.target.classList.add("active");
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
            var tr = document.createElement("tr");
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
    if (sortKey === key) {
        sortAsc = !sortAsc;
    } else {
        sortKey = key;
        sortAsc = true;
    }
    renderTable();
}
 
function clearResults() {
    if (confirm("Are you sure you want to delete ALL results? This cannot be undone.")) {
        localStorage.removeItem("quiz_results");
        renderTable();
    }
}