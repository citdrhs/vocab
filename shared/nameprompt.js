// nameprompt.js — shows a name entry screen before the quiz starts
// Call: askName(callback) — callback runs after name is set
 
function askName(callback) {
    if (sessionStorage.getItem("student_name")) { //if name already set this session, skip
        callback();
        return;
    }
 
    // Build overlay
    var overlay = document.createElement("div");
    overlay.id = "name-overlay";
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); display: flex; flex-direction: column;
        align-items: center; justify-content: center; z-index: 9999;
    `;
 
    var box = document.createElement("div");
    box.style.cssText = `
        background: #fff; padding: 40px; border-radius: 10px;
        text-align: center; max-width: 400px; width: 90%;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
 
    var heading = document.createElement("h2");
    heading.textContent = "Enter Your Name";
    heading.style.marginBottom = "10px";
 
    var sub = document.createElement("p");
    sub.textContent = "Your name will be saved with your quiz results.";
    sub.style.cssText = "color: #666; margin-bottom: 20px; font-size: 0.95em;";
 
    var input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Your name";
    input.style.cssText = `
        width: 100%; padding: 10px 14px; font-size: 1.1em;
        border: 2px solid #ccc; border-radius: 5px; margin-bottom: 16px;
        box-sizing: border-box; font-family: Arial, sans-serif;
    `;
 
    var btn = document.createElement("button");
    btn.textContent = "Start Quiz";
    btn.style.cssText = `
        background: #3f3f3f; color: white; border: none;
        padding: 12px 30px; font-size: 1.1em; border-radius: 5px;
        cursor: pointer; width: 100%;
    `;
 
    btn.onclick = function() {
        var name = input.value.trim();
        if (!name) { input.style.borderColor = "red"; return; }
        sessionStorage.setItem("student_name", name);
        document.body.removeChild(overlay);
        callback();
    };
 
    input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") btn.click();
    });
 
    box.appendChild(heading);
    box.appendChild(sub);
    box.appendChild(input);
    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    input.focus();
}