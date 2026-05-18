// scoretracker.js — saves quiz results to the server API
// API variable is defined in shared/api.js

function saveScore(testType, lessons, score, total) {
    var studentName = sessionStorage.getItem("student_name") || "Unknown";
    var classNum    = sessionStorage.getItem("class_num")    || "";

    var result = {
        name:     studentName,
        class:    classNum,
        testType: testType,
        lessons:  lessons,
        score:    score,
        total:    total,
        date:     new Date().toLocaleString()
    };

    fetch(API + "/results/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result)
    })
    .catch(function(err) {
        console.error("Could not save result to server:", err);
    });
}