function saveScore(testType, lessons, score, total) {
    var studentName = sessionStorage.getItem("student_name") || "Unknown";
 
    var result = {
        name: studentName,
        testType: testType,
        lessons: lessons,
        score: score,
        total: total,
        date: new Date().toLocaleString()
    };
 
    var results = JSON.parse(localStorage.getItem("quiz_results") || "[]");
    results.push(result);
    localStorage.setItem("quiz_results", JSON.stringify(results));
}
 