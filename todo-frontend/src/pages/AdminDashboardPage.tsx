import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import {
  deleteUser,
  getUsers,
  type AdminUser,
} from "../services/userApi";

import type { User } from "../services/authApi";

function AdminDashboardPage() {
  const savedUser = localStorage.getItem("user");

  const currentUser: User | null = savedUser
    ? JSON.parse(savedUser)
    : null;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);
  const [error, setError] = useState("");

  const canManageUsers =
    currentUser?.permissions.includes("manage users") ||
    currentUser?.roles.includes("super-admin");

  const canDeleteUsers =
    currentUser?.permissions.includes("delete users") ||
    currentUser?.roles.includes("super-admin");

  useEffect(() => {
    async function loadUsers() {
      try {
        setError("");

        const data = await getUsers();

        setUsers(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not load users."
        );
      } finally {
        setLoading(false);
      }
    }

    if (canManageUsers) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [canManageUsers]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!canManageUsers) {
    return <Navigate to="/todos" replace />;
  }

  async function handleDelete(user: AdminUser) {
    const confirmed = window.confirm(
      `Delete ${user.name}'s account?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(user.id);
      setError("");

      await deleteUser(user.id);

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) => currentUser.id !== user.id
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not delete user."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <p className="eyebrow">Administration</p>

          <h1>User management</h1>

          <p>
            View registered users and manage their accounts.
          </p>
        </div>

        <div className="todo-summary">
          <strong>{users.length}</strong>
          <span>Registered users</span>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-card-heading">
          <div>
            <h2>Users</h2>
            <p>All active accounts in the application.</p>
          </div>
        </div>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <div className="admin-empty">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            No users found.
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const isCurrentUser =
                    user.id === currentUser.id;

                  const isSuperAdmin =
                    user.roles.includes("super-admin");

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {user.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="role-badge">
                          {user.roles[0] || "No role"}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          user.created_at
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        {canDeleteUsers ? (
                          <button
                            type="button"
                            className="delete-button"
                            disabled={
                              isCurrentUser ||
                              isSuperAdmin ||
                              deletingId === user.id
                            }
                            onClick={() =>
                              handleDelete(user)
                            }
                          >
                            {deletingId === user.id
                              ? "Deleting..."
                              : isCurrentUser
                                ? "Current user"
                                : isSuperAdmin
                                  ? "Protected"
                                  : "Delete"}
                          </button>
                        ) : (
                          <span className="no-permission">
                            View only
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboardPage;
