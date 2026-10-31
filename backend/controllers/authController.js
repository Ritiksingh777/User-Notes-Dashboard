import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { validEmail } from "../utils/validators.js";

function createToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 100 ||
      !validEmail(email) ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: "Enter a valid name, email, and password (8–72 characters).",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await pool.execute(
      "SELECT id FROM user_tbl WHERE email = ?",
      [normalizedEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      "INSERT INTO user_tbl (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), normalizedEmail, passwordHash]
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: normalizedEmail,
    };

    return res.status(201).json({
      message: "Account created successfully",
      token: createToken(user.id),
      user,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    console.error("Signup error:", error.message);
    return res.status(500).json({
      message: "Unable to create account",
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (
      !validEmail(email) ||
      typeof password !== "string" ||
      password.length === 0 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: "Enter a valid email and password",
      });
    }

    const [rows] = await pool.execute(
      "SELECT id, name, email, password FROM user_tbl WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    if (
      rows.length === 0 ||
      !(await bcrypt.compare(password, rows[0].password))
    ) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
    };

    return res.json({
      message: "Login successful",
      token: createToken(user.id),
      user,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Unable to log in",
    });
  }
}