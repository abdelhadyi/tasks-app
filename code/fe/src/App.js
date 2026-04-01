import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import MessageForm from './MessageForm';
import MessageList from './MessageList';

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

function Home({ setView }) {
  return (
    <div className="home">
      <h1>Microservices Dashboard</h1>
      <p className="subtitle">A simple 3-tier microservices application</p>
      <div className="nav-cards">
        <button className="nav-card" onClick={() => setView('add-task')}>
          <span className="card-icon">➕</span>
          <span className="card-title">Add Task</span>
          <span className="card-desc">Create a new task with a status</span>
        </button>
        <button className="nav-card" onClick={() => setView('show-tasks')}>
          <span className="card-icon">📋</span>
          <span className="card-title">Show Tasks</span>
          <span className="card-desc">View and manage all tasks</span>
        </button>
        <button className="nav-card" onClick={() => setView('notes')}>
          <span className="card-icon">📝</span>
          <span className="card-title">Add Notes</span>
          <span className="card-desc">Create and browse your notes</span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Task view
// ---------------------------------------------------------------------------

function AddTask({ setView }) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Not started');
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFeedback({ type: 'error', msg: 'Title cannot be empty.' });
      return;
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), status }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add task');
      }

      setFeedback({ type: 'success', msg: 'Task added successfully!' });
      setTitle('');
      setStatus('Not started');
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  return (
    <div className="view">
      <button className="back-btn" onClick={() => setView('home')}>← Back</button>
      <h2>Add Task</h2>

      {feedback && (
        <div className={`alert alert-${feedback.type}`}>{feedback.msg}</div>
      )}

      <form className="card-form" onSubmit={handleSubmit}>
        <label>
          Task Title
          <input
            type="text"
            placeholder="Enter task title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Not started">Not started</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </label>

        <button type="submit" className="btn-primary">Add Task</button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Show Tasks view
// ---------------------------------------------------------------------------

function ShowTasks({ setView }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      setTasks(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const statusClass = (s) => {
    if (s === 'done') return 'badge badge-done';
    if (s === 'in-progress') return 'badge badge-progress';
    return 'badge badge-notstarted';
  };

  return (
    <div className="view">
      <button className="back-btn" onClick={() => setView('home')}>← Back</button>
      <h2>All Tasks</h2>

      {loading && <p className="loading">Loading tasks…</p>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <MessageList
          items={tasks}
          onDelete={deleteTask}
          renderItem={(task) => (
            <>
              <span className="item-title">{task.title}</span>
              <span className={statusClass(task.status)}>{task.status}</span>
            </>
          )}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notes view  (add + list in one page)
// ---------------------------------------------------------------------------

function Notes({ setView }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error('Failed to fetch notes');
      setNotes(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const addNote = async (content) => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add note');
    }
    const newNote = await res.json();
    setNotes((prev) => [newNote, ...prev]);
  };

  const deleteNote = async (id) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete note');
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="view">
      <button className="back-btn" onClick={() => setView('home')}>← Back</button>
      <h2>Notes</h2>

      <MessageForm
        placeholder="Write your note here…"
        fieldName="content"
        buttonLabel="Add Note"
        onSubmit={addNote}
      />

      {loading && <p className="loading">Loading notes…</p>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <MessageList
          items={notes}
          onDelete={deleteNote}
          renderItem={(note) => (
            <span className="item-title">{note.content}</span>
          )}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root App – simple view-state router (no react-router needed)
// ---------------------------------------------------------------------------

export default function App() {
  const [view, setView] = useState('home');

  const views = {
    home: <Home setView={setView} />,
    'add-task': <AddTask setView={setView} />,
    'show-tasks': <ShowTasks setView={setView} />,
    notes: <Notes setView={setView} />,
  };

  return <div className="app">{views[view] || views.home}</div>;
}
