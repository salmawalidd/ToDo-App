import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import {
  deleteUser,
  getAccessOptions,
  getUsers,
  updateUserAccess,
  type AdminUser,
} from "../services/userApi";

import type { User } from "../services/authApi";

function AdminDashboardPage() {
  const savedUser = localStorage.getItem("user");

  const currentUser: User | null = savedUser
    ? JSON.parse(savedUser)
    : null;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [availableRoles, setAvailableRoles] =
    useState<string[]>([]);
  const [availablePermissions, setAvailablePermissions] =
    useState<string[]>([]);

  const [editingUser, setEditingUser] =
    useState<AdminUser | null>(null);

  const [selectedRole, setSelectedRole] = useState("");

  const [
    selectedDirectPermissions,
    setSelectedDirectPermissions,
  ] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingAccess, setSavingAccess] = useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const canManageUsers =
    currentUser?.permissions.includes("manage users") ||
    currentUser?.roles.includes("super-admin");

  const canDeleteUsers =
    currentUser?.permissions.includes("delete users") ||
    currentUser?.roles.includes("super-admin");

  const canManageAccess =
    currentUser?.permissions.includes(
      "manage roles and permissions"
    ) ||
    currentUser?.roles.includes("super-admin");

  useEffect(() => {
    async function loadAdminData() {
      try {
        setError("");

        const usersData = await getUsers();

        setUsers(usersData);

        if (canManageAccess) {
          const accessOptions = await getAccessOptions();

          setAvailableRoles(accessOptions.roles);
          setAvailablePermissions(
            accessOptions.permissions
          );
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not load administration data."
        );
      } finally {
        setLoading(false);
      }
    }

    if (canManageUsers) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [canManageUsers, canManageAccess]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!canManageUsers) {
    return <Navigate to="/todos" replace />;
  }

  function openAccessEditor(user: AdminUser) {
    setError("");
    setSuccessMessage("");

    setEditingUser(user);

    setSelectedRole(
      user.roles[0] ||
        availableRoles.find((role) => role === "user") ||
        availableRoles[0] ||
        ""
    );

    setSelectedDirectPermissions(
      user.direct_permissions ?? []
    );
  }

  function closeAccessEditor() {
    if (savingAccess) {
      return;
    }

    setEditingUser(null);
    setSelectedRole("");
    setSelectedDirectPermissions([]);
    setError("");
  }

  function togglePermission(permission: string) {
    setSelectedDirectPermissions(
      (currentPermissions) =>
        currentPermissions.includes(permission)
          ? currentPermissions.filter(
              (item) => item !== permission
            )
          : [...currentPermissions, permission]
    );
  }

  async function handleSaveAccess() {
    if (!editingUser) {
      return;
    }

    if (!selectedRole) {
      setError("Please select a role.");
      return;
    }

    try {
      setSavingAccess(true);
      setError("");
      setSuccessMessage("");

      const updatedUser = await updateUserAccess(
        editingUser.id,
        {
          roles: [selectedRole],
          permissions: selectedDirectPermissions,
        }
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === updatedUser.id
            ? updatedUser
            : user
        )
      );

      setEditingUser(null);
      setSelectedRole("");
      setSelectedDirectPermissions([]);

      setSuccessMessage(
        `${updatedUser.name}'s access was updated successfully.`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not update user access."
      );
    } finally {
      setSavingAccess(false);
    }
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
      setSuccessMessage("");

      await deleteUser(user.id);

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) => currentUser.id !== user.id
        )
      );

      setSuccessMessage(
        `${user.name}'s account was deleted.`
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
            Manage registered users, roles, permissions,
            and account access.
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
            <p>
              View accounts and control their application
              access.
            </p>
          </div>
        </div>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {successMessage && (
          <p className="success-message" role="status">
            {successMessage}
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
                  <th>Permissions</th>
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

                  const displayedPermissions =
                    user.permissions.slice(0, 3);

                  const extraPermissionCount =
                    user.permissions.length -
                    displayedPermissions.length;

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {user.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="user-details">
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`role-badge role-${user.roles[0] || "none"}`}
                        >
                          {user.roles[0] || "No role"}
                        </span>
                      </td>

                      <td>
                        <div className="table-permissions">
                          {displayedPermissions.length >
                          0 ? (
                            <>
                              {displayedPermissions.map(
                                (permission) => (
                                  <span
                                    key={permission}
                                    className="table-permission-badge"
                                  >
                                    {permission}
                                  </span>
                                )
                              )}

                              {extraPermissionCount > 0 && (
                                <span className="table-permission-more">
                                  +{extraPermissionCount} more
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="empty-value">
                              No permissions
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        {new Date(
                          user.created_at
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <div className="admin-actions">
                          {canManageAccess && (
                            <button
                              type="button"
                              className="access-button"
                              disabled={
                                isSuperAdmin &&
                                !isCurrentUser
                              }
                              onClick={() =>
                                openAccessEditor(user)
                              }
                            >
                              {isSuperAdmin &&
                              !isCurrentUser
                                ? "Protected"
                                : "Manage access"}
                            </button>
                          )}

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
                            !canManageAccess && (
                              <span className="no-permission">
                                View only
                              </span>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingUser && (
        <div
          className="access-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAccessEditor();
            }
          }}
        >
          <section
            className="access-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="access-modal-title"
          >
            <header className="access-modal-header">
              <div className="access-modal-user">
                <div className="access-modal-avatar">
                  {editingUser.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <p className="eyebrow">
                    Manage access
                  </p>

                  <h2 id="access-modal-title">
                    {editingUser.name}
                  </h2>

                  <p>{editingUser.email}</p>
                </div>
              </div>

              <button
                type="button"
                className="modal-close-button"
                aria-label="Close"
                disabled={savingAccess}
                onClick={closeAccessEditor}
              >
                ×
              </button>
            </header>

            <div className="access-modal-body">
              <div className="access-form-section">
                <div className="access-section-heading">
                  <div>
                    <h3>Role</h3>
                    <p>
                      Select the user&apos;s main level of
                      access.
                    </p>
                  </div>
                </div>

                <select
                  className="access-role-select"
                  value={selectedRole}
                  disabled={savingAccess}
                  onChange={(event) =>
                    setSelectedRole(event.target.value)
                  }
                >
                  <option value="">
                    Select a role
                  </option>

                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="access-form-section">
                <div className="access-section-heading">
                  <div>
                    <h3>Additional permissions</h3>
                    <p>
                      Add permissions directly to this user
                      beyond those inherited from the role.
                    </p>
                  </div>

                  <span className="selected-count">
                    {selectedDirectPermissions.length}{" "}
                    selected
                  </span>
                </div>

                <div className="permission-grid">
                  {availablePermissions.map(
                    (permission) => {
                      const selected =
                        selectedDirectPermissions.includes(
                          permission
                        );

                      return (
                        <label
                          key={permission}
                          className={`permission-card ${
                            selected
                              ? "permission-card-selected"
                              : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={savingAccess}
                            onChange={() =>
                              togglePermission(permission)
                            }
                          />

                          <span className="permission-check">
                            {selected ? "✓" : ""}
                          </span>

                          <span className="permission-card-text">
                            {permission}
                          </span>
                        </label>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="access-form-section inherited-section">
                <div className="access-section-heading">
                  <div>
                    <h3>Current effective permissions</h3>
                    <p>
                      These include both role permissions and
                      direct permissions.
                    </p>
                  </div>
                </div>

                <div className="effective-permissions">
                  {editingUser.permissions.length > 0 ? (
                    editingUser.permissions.map(
                      (permission) => (
                        <span
                          key={permission}
                          className="effective-permission-badge"
                        >
                          {permission}
                        </span>
                      )
                    )
                  ) : (
                    <span className="empty-value">
                      No effective permissions.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <footer className="access-modal-footer">
              <button
                type="button"
                className="secondary-button"
                disabled={savingAccess}
                onClick={closeAccessEditor}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                disabled={
                  savingAccess || !selectedRole
                }
                onClick={handleSaveAccess}
              >
                {savingAccess
                  ? "Saving changes..."
                  : "Save changes"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminDashboardPage;
