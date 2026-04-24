var current_lessons = []
 
var wordcontainer = document.getElementById("word-container");
var rpscontainer = document.getElementById("rps-container");
 
function index_onload() { //when the main page loads
    sessionStorage.setItem("current_lessons", JSON.stringify([])) //reset everything
    document.getElementById("gotoall").style.display = "none"
}
 
function index_addLesson(lessonNum) { //sets the lesson # to use
    if (!current_lessons.includes(lessonNum)) { //if the list does not have the number
        current_lessons.push(lessonNum) // add a lesson to the current lessons
    } else {
        current_lessons.splice(current_lessons.indexOf(lessonNum), 1) //remove the lessson if not selected
    }
 
    sessionStorage.setItem("current_lessons", JSON.stringify(current_lessons)) //update the storage
 
    if (current_lessons.length != 0) { //show the button if there's stuff in the list, hide if not
        document.getElementById("gotoall").style.display = "block"
    } else {
        document.getElementById("gotoall").style.display = "none"
    }
}
 
function index_setLesson(lessonNum) { //sends you to the lesson that you select
    sessionStorage.setItem("current_lessons", JSON.stringify([lessonNum]))
}
 
function lessons_onload() {  //load for the lesson page
    current_lessons = JSON.parse(sessionStorage.getItem("current_lessons")); //gets the lesson numbers, if empty it goes to the main page
    if (current_lessons.length == 0) {window.location.href = "../index.html";}
    
    var title = "Lesson "; //set the title to the lesson
    for (num in current_lessons) {
        if (title == "Lesson ") {
            title += current_lessons[num];
        } else {
            title += ", " + current_lessons[num];
        }
    }
    document.getElementById("title").innerHTML = title; //update the title
 
    wordcontainer.innerHTML = ""; //empty the container with all the words in it
    for (lesson in current_lessons) {addKards(current_lessons[lesson]);} //add words to the container for each lesson
 
    rpscontainer.innerHTML = ""; //empty the rps container
    for (lesson in current_lessons) {addRPS(current_lessons[lesson]);} //add rps cards for each lesson
}
 
function addKards(lessonID) {
    var lesson = lesson_data[lessonID]; //gets the lesson data
    for (var word in lesson.words) { //iterates through every word
        var data = lesson.words[word]; //gets the word
 
        var wordbox = document.createElement("div"); //creates a div that will hold all the word info
        wordbox.classList.add("word-box");
 
        var wordtitle = document.createElement("h3"); //make the title for the word itself
        wordtitle.textContent = word;
        wordbox.appendChild(wordtitle);
 
        var ps = document.createElement("p"); //make the text for the defenition and the part of speech
        ps.textContent = "(" + data.ps + ") " + data.def;
        wordbox.appendChild(ps);
 
        wordcontainer.appendChild(wordbox); //add the div to the container
    }
}
 
function addRPS(lessonID) {
    var rps = lesson_data[lessonID].rps; //gets the rps data for this lesson
 
    var types = [
        { key: "roots", label: "Roots" },
        { key: "prefixes", label: "Prefixes" },
        { key: "suffixes", label: "Suffixes" }
    ];
 
    for (var t = 0; t < types.length; t++) {
        var type = types[t];
        var entries = rps[type.key];
 
        if (Object.keys(entries).length === 0) continue; //skip if empty
 
        // Section header
        var header = document.createElement("h3");
        header.textContent = type.label;
        header.classList.add("rps-section-header");
        rpscontainer.appendChild(header);
 
        // One card per entry
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