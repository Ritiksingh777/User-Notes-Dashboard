import { useEffect, useState } from "react";

export default function MessageForm({
  editingMessage,
  onSave,
  onCancel,
  busy,
}) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage(editingMessage?.message || "");
  }, [editingMessage]);

  async function submit(event) {
    event.preventDefault();
    const text = message.trim();

    if (!text || text.length > 1000) return;

    const saved = await onSave(text);

    if (saved && !editingMessage) {
      setMessage("");
    }
  }

  return (
    <form className="panel message-form" onSubmit={submit}>
      <h2>{editingMessage ? "Edit message" : "Write a message"}</h2>

      <label htmlFor="message">Your note</label>
      <textarea
        id="message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        maxLength={1000}
        rows={4}
        placeholder="Write something you want to remember..."
        required
      />

      <div className="form-actions">
        <span className="muted">{message.length}/1000</span>

        {editingMessage && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}

        <button
          className="btn btn-primary"
          disabled={busy || !message.trim()}
        >
          {busy
            ? "Saving..."
            : editingMessage
              ? "Update message"
              : "Add message"}
        </button>
      </div>
    </form>
  );
}