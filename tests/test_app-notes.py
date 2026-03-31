import pytest
from unittest.mock import MagicMock, patch
import app as notes_app


@pytest.fixture
def client():
    notes_app.app.config["TESTING"] = True
    with notes_app.app.test_client() as client:
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


def test_add_note(client):
    mock_conn, _ = make_mock_db()
    with patch("app.get_db", return_value=mock_conn):
        res = client.post(
            "/api/notes",
            json={"content": "Remember to drink water"},
        )
    assert res.status_code == 201
    data = res.get_json()
    assert data["content"] == "Remember to drink water"


def test_get_notes(client):
    mock_conn, mock_cursor = make_mock_db(
        fetchall_return=[{"id": 1, "content": "Remember to drink water"}]
    )
    with patch("app.get_db", return_value=mock_conn):
        res = client.get("/api/notes")
    assert res.status_code == 200
    data = res.get_json()
    assert len(data) == 1
    assert data[0]["content"] == "Remember to drink water"
