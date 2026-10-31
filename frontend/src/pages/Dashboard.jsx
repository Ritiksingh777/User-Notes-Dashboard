import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import MessageForm from "../components/MessageForm";
import MessageCard from "../components/MessageCard";

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    setError("");

    try {
      const data = await apiRequest("/api/messages");
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  async function saveMessage(message) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (editingMessage) {
        const updated = await apiRequest(
          `/api/messages/${editingMessage.id}`,
          {
            method: "PUT",
            body: JSON.stringify({ message }),
          }
        );

        setMessages((old) =>
          old.map((item) =>
            item.id === updated.id ? updated : item
          )
        );

        setEditingMessage(null);
        setNotice("Message updated successfully.");
      } else {
        const created = await apiRequest("/api/messages", {
          method: "POST",
          body: JSON.stringify({ message }),
        });

        setMessages((old) => [created, ...old]);
        setNotice("Message added successfully.");
      }

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function deleteMessage(id) {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await apiRequest(`/api/messages/${id}`, {
        method: "DELETE",
      });

      setMessages((old) => old.filter((item) => item.id !== id));

      if (editingMessage?.id === id) {
        setEditingMessage(null);
      }

      setNotice("Message deleted successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="dashboard">
      <section className="dashboard-heading">
        <div>
          <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
          <h1>My Notes</h1>
          <p className="muted">
            Keep your thoughts organized in one place.
          </p>
        </div>

        <div className="note-count">
          <strong>{messages.length}</strong>
          <span>Messages</span>
        </div>
      </section>

      {error && <div className="error">{error}</div>}
      {notice && <div className="success">{notice}</div>}

      <MessageForm
        editingMessage={editingMessage}
        onSave={saveMessage}
        onCancel={() => setEditingMessage(null)}
        busy={busy}
      />

      <section className="notes-section">
        <div className="section-heading">
          <h2>Saved messages</h2>
          <span className="muted">{messages.length} total</span>
        </div>

        {loading ? (
          <p className="center">Loading your messages...</p>
        ) : messages.length === 0 ? (
          <div className="panel empty-state">
            <h3>No messages yet</h3>
            <p className="muted">
              Add your first message using the form above.
            </p>
          </div>
        ) : (
          <div className="notes-grid">
            {messages.map((item) => (
              <MessageCard
                key={item.id}
                item={item}
                onEdit={setEditingMessage}
                onDelete={deleteMessage}
                busy={busy}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}