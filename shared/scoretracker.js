// scoretracker.js shared across all quizzes to save results to localStorage

function saveScore(testType, lessons, score, total) {
    var studentName = sessionStorage.getItem("student_name") || "Unknown";
    var classNum    = sessionStorage.getItem("class_num") || "";

    var result = {
        name:     studentName,
        class:    classNum,
        testType: testType,
        lessons:  lessons,
        score:    score,
        total:    total,
        date:     new Date().toLocaleString()
    };

    var results = JSON.parse(localStorage.getItem("quiz_results") || "[]");
    results.push(result);
    localStorage.setItem("quiz_results", JSON.stringify(results));
}