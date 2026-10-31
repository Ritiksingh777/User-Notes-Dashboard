export default function MessageCard({
  item,
  onEdit,
  onDelete,
  busy,
}) {
  return (
    <article className="panel note-card">
      <p className="note-text">{item.message}</p>

      <p className="note-date">
        Updated {new Date(item.updated_at).toLocaleString()}
      </p>

      <div className="note-actions">
        <button
          className="btn btn-outline"
          onClick={() => onEdit(item)}
          disabled={busy}
        >
          Edit
        </button>

        <button
          className="btn btn-danger"
          onClick={() => onDelete(item.id)}
          disabled={busy}
        >
          Delete
        </button>
      </div>
    </article>
  );
}