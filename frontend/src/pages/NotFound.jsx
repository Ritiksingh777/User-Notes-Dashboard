import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="center not-found">
      <h1>404 — Page not found</h1>
      <p className="muted">The page you requested does not exist.</p>
      <Link className="btn btn-primary" to="/">
        Go home
      </Link>
    </main>
  );
}