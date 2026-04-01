import React from 'react';

/**
 * MessageList
 * A generic list component that renders items and provides per-item deletion.
 *
 * Props:
 *   items        – array of objects (must have an `id` field)
 *   onDelete     – (id: number) => void
 *   renderItem   – (item) => ReactNode  — renders item content
 *   emptyMessage – string shown when list is empty
 */
export default function MessageList({
  items = [],
  onDelete,
  renderItem,
  emptyMessage = 'No items yet. Add one above!',
}) {
  if (items.length === 0) {
    return <p className="empty-msg">{emptyMessage}</p>;
  }

  return (
    <ul className="item-list">
      {items.map((item) => (
        <li key={item.id} className="item-row">
          <div className="item-content">{renderItem(item)}</div>
          <button
            className="btn-delete"
            onClick={() => onDelete(item.id)}
            aria-label="Delete item"
          >
            🗑
          </button>
        </li>
      ))}
    </ul>
  );
}
