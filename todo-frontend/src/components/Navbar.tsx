import { Link, useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  email: string;
}

function Navbar() {
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("user");
  const user: User | null = savedUser
    ? JSON.parse(savedUser)
    : null;

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  }

  return (
    <nav className="app-navbar">
      <Link className="nav-brand" to="/todos">
        TaskFlow
      </Link>

      <div className="nav-links">
        {user ? (
          <>
            <Link to="/todos">Todos</Link>

            <span className="nav-user">
              Hi, {user.name}
            </span>

            <button
              type="button"
              className="nav-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
