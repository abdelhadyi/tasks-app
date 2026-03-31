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
# Task endpoints
# ---------------------------------------------------------------------------

@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, title, status FROM tasks")
    tasks = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(tasks), 200


@app.route("/api/tasks", methods=["POST"])
def add_task():
    data = request.get_json()

    title = (data or {}).get("title", "").strip()
    status = (data or {}).get("status", "Not started")

    if not title:
        return jsonify({"error": "title is required"}), 400

    allowed_statuses = {"Not started", "in-progress", "done"}
    if status not in allowed_statuses:
        return jsonify({"error": f"status must be one of {allowed_statuses}"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO tasks (title, status) VALUES (%s, %s)",
        (title, status),
    )
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return jsonify({"id": new_id, "title": title, "status": status}), 201


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
    conn.commit()
    affected = cursor.rowcount
    cursor.close()
    conn.close()

    if affected == 0:
        return jsonify({"error": "Task not found"}), 404

    return jsonify({"message": "Task deleted"}), 200


# ---------------------------------------------------------------------------
# Entry point (development only – production uses gunicorn)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
