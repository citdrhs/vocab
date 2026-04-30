import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "vocab.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    with open(SCHEMA_PATH, "r") as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
    print("Database initialized.")

# ── Words ──
def add_or_update_word(lesson_num, word, ps, def_, ex, syn, ant):
    conn = get_db()
    syn_str = ",".join(syn) if syn else ""
    ant_str = ",".join(ant) if ant else ""
    conn.execute("""
        INSERT INTO words (lesson_num, word, ps, def, ex, syn, ant)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(lesson_num, word) DO UPDATE SET
            ps=excluded.ps, def=excluded.def, ex=excluded.ex,
            syn=excluded.syn, ant=excluded.ant
    """, (lesson_num, word, ps, def_, ex, syn_str, ant_str))
    # Ensure lesson exists
    conn.execute("INSERT OR IGNORE INTO lessons (lesson_num) VALUES (?)", (lesson_num,))
    # Remove from deleted_words if previously deleted
    conn.execute("DELETE FROM deleted_words WHERE lesson_num=? AND word=?", (lesson_num, word))
    conn.commit()
    conn.close()

def delete_word(lesson_num, word):
    conn = get_db()
    # Remove from words table if locally added
    conn.execute("DELETE FROM words WHERE lesson_num=? AND word=?", (lesson_num, word))
    # Mark as deleted to hide from lessondata.js
    conn.execute("INSERT OR IGNORE INTO deleted_words (lesson_num, word) VALUES (?, ?)", (lesson_num, word))
    conn.commit()
    conn.close()

def get_words(lesson_num):
    conn = get_db()
    rows = conn.execute("SELECT * FROM words WHERE lesson_num=?", (lesson_num,)).fetchall()
    conn.close()
    result = {}
    for row in rows:
        result[row["word"]] = {
            "ps":  row["ps"],
            "def": row["def"],
            "ex":  row["ex"],
            "syn": row["syn"].split(",") if row["syn"] else [],
            "ant": row["ant"].split(",") if row["ant"] else []
        }
    return result

def get_deleted_words(lesson_num):
    conn = get_db()
    rows = conn.execute("SELECT word FROM deleted_words WHERE lesson_num=?", (lesson_num,)).fetchall()
    conn.close()
    return [row["word"] for row in rows]

# ── RPS ──
def add_or_update_rps(lesson_num, type_, term, meaning):
    conn = get_db()
    conn.execute("""
        INSERT INTO rps (lesson_num, type, term, meaning)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(lesson_num, type, term) DO UPDATE SET meaning=excluded.meaning
    """, (lesson_num, type_, term, meaning))
    conn.execute("INSERT OR IGNORE INTO lessons (lesson_num) VALUES (?)", (lesson_num,))
    conn.execute("DELETE FROM deleted_rps WHERE lesson_num=? AND term=?", (lesson_num, term))
    conn.commit()
    conn.close()

def delete_rps(lesson_num, term):
    conn = get_db()
    conn.execute("DELETE FROM rps WHERE lesson_num=? AND term=?", (lesson_num, term))
    conn.execute("INSERT OR IGNORE INTO deleted_rps (lesson_num, term) VALUES (?, ?)", (lesson_num, term))
    conn.commit()
    conn.close()

def get_rps(lesson_num):
    conn = get_db()
    rows = conn.execute("SELECT * FROM rps WHERE lesson_num=?", (lesson_num,)).fetchall()
    conn.close()
    result = { "roots": {}, "prefixes": {}, "suffixes": {}, "words": {}, "sentences": {} }
    for row in rows:
        if row["type"] in result:
            result[row["type"]][row["term"]] = row["meaning"]
    return result

def get_deleted_rps(lesson_num):
    conn = get_db()
    rows = conn.execute("SELECT term FROM deleted_rps WHERE lesson_num=?", (lesson_num,)).fetchall()
    conn.close()
    return [row["term"] for row in rows]

# ── Lessons ──
def get_all_lessons():
    conn = get_db()
    rows = conn.execute("SELECT lesson_num FROM lessons").fetchall()
    conn.close()
    return [row["lesson_num"] for row in rows]

def delete_lesson(lesson_num):
    conn = get_db()
    conn.execute("DELETE FROM words WHERE lesson_num=?", (lesson_num,))
    conn.execute("DELETE FROM rps WHERE lesson_num=?", (lesson_num,))
    conn.execute("DELETE FROM deleted_words WHERE lesson_num=?", (lesson_num,))
    conn.execute("DELETE FROM deleted_rps WHERE lesson_num=?", (lesson_num,))
    conn.execute("DELETE FROM lessons WHERE lesson_num=?", (lesson_num,))
    conn.commit()
    conn.close()