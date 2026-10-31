import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="navbar">
      <Link className="brand" to={user ? "/dashboard" : "/"}>
        Notes<span>Board</span>
      </Link>

      <nav>
        {user ? (
          <>
            <span className="welcome">
              Hi, {user.name}
            </span>
            <button className="btn btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link className="btn btn-primary" to="/signup">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}