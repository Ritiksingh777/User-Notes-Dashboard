import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
    };

    window.addEventListener("auth-expired", handleExpired);

    async function validateSession() {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Protected endpoint: a valid token is required.
        const data = await apiRequest("/api/messages");

        // Keep the saved user only if the token was accepted.
        const savedUser = JSON.parse(
          localStorage.getItem("user") || "null"
        );

        if (savedUser) {
          setUser(savedUser);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }

        // The returned notes are not needed during validation.
        void data;
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    validateSession();

    return () => {
      window.removeEventListener("auth-expired", handleExpired);
    };
  }, []);

  async function signup(formData) {
    const data = await apiRequest("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);

    return data;
  }

  async function login(formData) {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);

    return data;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}