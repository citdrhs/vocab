from flask import Flask, request, jsonify
from flask_cors import CORS
import database as db

app = Flask(__name__)
CORS(app)  # Allow requests from Live Server (localhost:5501)

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

if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)