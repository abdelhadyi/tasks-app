import React, { useState } from 'react';

/**
 * MessageForm
 * A generic controlled form for adding a single text entry.
 *
 * Props:
 *   placeholder  – input placeholder text
 *   fieldName    – key name sent to onSubmit (default: "content")
 *   buttonLabel  – submit button label (default: "Add")
 *   onSubmit     – async (value: string) => void  — called with the trimmed value
 */
export default function MessageForm({
  placeholder = 'Enter text…',
  fieldName = 'content',
  buttonLabel = 'Add',
  onSubmit,
}) {
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState(null); // { type, msg }
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      setFeedback({ type: 'error', msg: 'Field cannot be empty.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      await onSubmit(trimmed);
      setValue('');
      setFeedback({ type: 'success', msg: 'Added successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="message-form">
      {feedback && (
        <div className={`alert alert-${feedback.type}`}>{feedback.msg}</div>
      )}

      <form className="card-form" onSubmit={handleSubmit}>
        <label>
          {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
          <textarea
            rows={3}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : buttonLabel}
        </button>
      </form>
    </div>
  );
}
