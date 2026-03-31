import os
import mysql.connector
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Database helper
# ---------------------------------------------------------------------------

def get_db():
    """Open a new MySQL connection using env-var credentials."""
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASSWORD", ""),
        database=os.environ.get("DB_NAME", "microservices_db"),
    )


# ---------------------------------------------------------------------------
# Health check (Kubernetes liveness / readiness probe)
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200


# ---------------------------------------------------------------------------
# Notes endpoints
# ---------------------------------------------------------------------------

@app.route("/api/notes", methods=["GET"])
def get_notes():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, content FROM notes")
    notes = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(notes), 200


@app.route("/api/notes", methods=["POST"])
def add_note():
    data = request.get_json()

    content = (data or {}).get("content", "").strip()
    if not content:
        return jsonify({"error": "content is required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO notes (content) VALUES (%s)", (content,))
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return jsonify({"id": new_id, "content": content}), 201


@app.route("/api/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notes WHERE id = %s", (note_id,))
    conn.commit()
    affected = cursor.rowcount
    cursor.close()
    conn.close()

    if affected == 0:
        return jsonify({"error": "Note not found"}), 404

    return jsonify({"message": "Note deleted"}), 200


# ---------------------------------------------------------------------------
# Entry point (development only – production uses gunicorn)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
