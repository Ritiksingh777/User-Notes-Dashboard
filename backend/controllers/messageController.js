import pool from "../config/db.js";
import { validMessage } from "../utils/validators.js";

export async function getMessages(req, res) {
  try {
    const [messages] = await pool.execute(
      `SELECT id, message, created_at, updated_at
       FROM message_tbl
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error.message);
    return res.status(500).json({
      message: "Unable to fetch messages",
    });
  }
}

export async function createMessage(req, res) {
  try {
    const { message } = req.body;

    if (!validMessage(message)) {
      return res.status(400).json({
        message: "Message must contain 1–1000 characters",
      });
    }

    const [result] = await pool.execute(
      "INSERT INTO message_tbl (user_id, message) VALUES (?, ?)",
      [req.user.id, message.trim()]
    );

    const [rows] = await pool.execute(
      `SELECT id, message, created_at, updated_at
       FROM message_tbl
       WHERE id = ? AND user_id = ?`,
      [result.insertId, req.user.id]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create message error:", error.message);
    return res.status(500).json({
      message: "Unable to save message",
    });
  }
}

export async function updateMessage(req, res) {
  try {
    const { message } = req.body;
    const id = Number(req.params.id);

    if (
      !Number.isSafeInteger(id) ||
      id < 1 ||
      !validMessage(message)
    ) {
      return res.status(400).json({
        message: "Invalid message ID or message text",
      });
    }

    const [result] = await pool.execute(
      `UPDATE message_tbl
       SET message = ?
       WHERE id = ? AND user_id = ?`,
      [message.trim(), id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    const [rows] = await pool.execute(
      `SELECT id, message, created_at, updated_at
       FROM message_tbl
       WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    return res.json(rows[0]);
  } catch (error) {
    console.error("Update message error:", error.message);
    return res.status(500).json({
      message: "Unable to update message",
    });
  }
}

export async function deleteMessage(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid message ID",
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM message_tbl WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    return res.json({
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error.message);
    return res.status(500).json({
      message: "Unable to delete message",
    });
  }
}