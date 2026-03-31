import pytest
from unittest.mock import MagicMock, patch
import app as task_app


@pytest.fixture
def client():
    task_app.app.config["TESTING"] = True
    with task_app.app.test_client() as client:
        yield client


def make_mock_db(fetchall_return=None):
    """Return a mock connection whose cursor behaves correctly."""
    mock_cursor = MagicMock()
    mock_cursor.fetchall.return_value = fetchall_return or []
    mock_cursor.lastrowid = 1

    mock_conn = MagicMock()
    mock_conn.cursor.return_value = mock_cursor

    return mock_conn, mock_cursor


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.get_json() == {"status": "healthy"}


def test_add_task(client):
    mock_conn, _ = make_mock_db()
    with patch("app.get_db", return_value=mock_conn):
        res = client.post(
            "/api/tasks",
            json={"title": "Write tests", "status": "Not started"},
        )
    assert res.status_code == 201
    data = res.get_json()
    assert data["title"] == "Write tests"
    assert data["status"] == "Not started"


def test_get_tasks(client):
    mock_conn, mock_cursor = make_mock_db(
        fetchall_return=[{"id": 1, "title": "Write tests", "status": "Not started"}]
    )
    with patch("app.get_db", return_value=mock_conn):
        res = client.get("/api/tasks")
    assert res.status_code == 200
    data = res.get_json()
    assert len(data) == 1
    assert data[0]["title"] == "Write tests"
