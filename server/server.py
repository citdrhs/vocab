from flask import Flask, request, jsonify
from flask_cors import CORS
import database as db

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize the database on startup
db.init_db()

# ── Get all lesson data ──
@app.route("/api/lessons", methods=["GET"])
def get_lessons():
    lesson_nums = db.get_all_lessons()
    result = {}

    for num in lesson_nums:
        words        = db.get_words(num)
        rps          = db.get_rps(num)
        deleted_words = db.get_deleted_words(num)
        deleted_rps  = db.get_deleted_rps(num)

        result[num] = {
            "words":        words,
            "rps":          rps,
            "deletedWords": deleted_words,
            "deletedRPS":   deleted_rps
        }

    return jsonify(result)

# ── Add or edit a word ──
@app.route("/api/lessons/add-word", methods=["POST"])
def add_word():
    data       = request.json
    lesson_num = data.get("lesson_num", "").strip()
    word       = data.get("word", "").strip().lower()
    ps         = data.get("ps", "").strip()
    def_       = data.get("def", "").strip()
    ex         = data.get("ex", "").strip()
    syn        = [s.strip() for s in data.get("syn", [])]
    ant        = [a.strip() for a in data.get("ant", [])]

    if not lesson_num or not word or not ps or not def_:
        return jsonify({"error": "lesson_num, word, ps and def are required"}), 400

    db.add_or_update_word(lesson_num, word, ps, def_, ex, syn, ant)
    return jsonify({"success": True, "message": f'Word "{word}" saved to lesson {lesson_num}.'})

# ── Delete a word ──
@app.route("/api/lessons/delete-word", methods=["POST"])
def delete_word():
    data       = request.json
    lesson_num = data.get("lesson_num", "").strip()
    word       = data.get("word", "").strip().lower()

    if not lesson_num or not word:
        return jsonify({"error": "lesson_num and word are required"}), 400

    db.delete_word(lesson_num, word)
    return jsonify({"success": True, "message": f'Word "{word}" deleted from lesson {lesson_num}.'})

# ── Add or edit an RPS entry ──
@app.route("/api/lessons/add-rps", methods=["POST"])
def add_rps():
    data       = request.json
    lesson_num = data.get("lesson_num", "").strip()
    type_      = data.get("type", "").strip()
    term       = data.get("term", "").strip().lower()
    meaning    = data.get("meaning", "").strip()

    valid_types = ["roots", "prefixes", "suffixes", "words", "sentences"]
    if not lesson_num or not type_ or not term or not meaning:
        return jsonify({"error": "lesson_num, type, term and meaning are required"}), 400
    if type_ not in valid_types:
        return jsonify({"error": f"type must be one of {valid_types}"}), 400

    db.add_or_update_rps(lesson_num, type_, term, meaning)
    return jsonify({"success": True, "message": f'"{term}" saved as {type_[:-1]} in lesson {lesson_num}.'})

# ── Delete an RPS entry ──
@app.route("/api/lessons/delete-rps", methods=["POST"])
def delete_rps():
    data       = request.json
    lesson_num = data.get("lesson_num", "").strip()
    term       = data.get("term", "").strip().lower()

    if not lesson_num or not term:
        return jsonify({"error": "lesson_num and term are required"}), 400

    db.delete_rps(lesson_num, term)
    return jsonify({"success": True, "message": f'"{term}" deleted from lesson {lesson_num}.'})

# ── Delete an entire lesson ──
@app.route("/api/lessons/delete-lesson", methods=["POST"])
def delete_lesson():
    data       = request.json
    lesson_num = data.get("lesson_num", "").strip()

    if not lesson_num:
        return jsonify({"error": "lesson_num is required"}), 400

    db.delete_lesson(lesson_num)
    return jsonify({"success": True, "message": f'Lesson {lesson_num} deleted.'})

# ── Get a single lesson ──
@app.route("/api/lessons/<lesson_num>", methods=["GET"])
def get_lesson(lesson_num):
    words         = db.get_words(lesson_num)
    rps           = db.get_rps(lesson_num)
    deleted_words = db.get_deleted_words(lesson_num)
    deleted_rps   = db.get_deleted_rps(lesson_num)

    return jsonify({
        "words":        words,
        "rps":          rps,
        "deletedWords": deleted_words,
        "deletedRPS":   deleted_rps
    })

# ── Register ──
@app.route("/api/register", methods=["POST"])
def register():
    data      = request.json
    username  = data.get("username", "").strip()
    password  = data.get("password", "")
    class_num = data.get("class_num", "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    if not class_num:
        return jsonify({"error": "Class number is required."}), 400

    if username.lower() == "admin":
        return jsonify({"error": "That username is not allowed."}), 400

    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    success = db.register_user(username, password, class_num)
    if not success:
        return jsonify({"error": "Username already taken."}), 409

    return jsonify({"success": True, "message": "Account created! You can now log in."})

# ── Login ──
@app.route("/api/login", methods=["POST"])
def login():
    data     = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    if username == "admin" and password == "admin123":
        return jsonify({"success": True, "username": "admin", "role": "admin", "class_num": ""})

    user = db.get_user(username)

    if not user:
        return jsonify({"error": "Username not found."}), 404

    if user["password"] != db.hash_password(password):
        return jsonify({"error": "Incorrect password."}), 401

    return jsonify({"success": True, "username": user["username"], "role": user["role"], "class_num": user["class_num"]})

# ── Get all users (admin only) ──
@app.route("/api/users", methods=["GET"])
def get_users():
    return jsonify(db.get_all_users())

# ── Delete a user (admin only) ──
@app.route("/api/users/delete", methods=["POST"])
def delete_user():
    data     = request.json
    username = data.get("username", "").strip()
    if not username:
        return jsonify({"error": "Username is required."}), 400
    db.delete_user(username)
    return jsonify({"success": True, "message": f'User "{username}" deleted.'})

# ── Save a result ──
@app.route("/api/results/save", methods=["POST"])
def save_result():
    data      = request.json
    name      = data.get("name", "Unknown")
    class_num = data.get("class", "")
    test_type = data.get("testType", "")
    lessons   = data.get("lessons", [])
    score     = data.get("score", 0)
    total     = data.get("total", 0)
    date      = data.get("date", "")

    if not test_type or not lessons:
        return jsonify({"error": "testType and lessons are required."}), 400

    db.save_result(name, class_num, test_type, lessons, score, total, date)
    return jsonify({"success": True})

# ── Get all results ──
@app.route("/api/results", methods=["GET"])
def get_results():
    return jsonify(db.get_all_results())

# ── Clear all results ──
@app.route("/api/results/clear", methods=["POST"])
def clear_results():
    db.clear_all_results()
    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)