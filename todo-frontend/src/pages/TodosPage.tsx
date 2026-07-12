import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
} from "../services/todoApi";

import type { Todo } from "../types/todo";

type TodoFilter = "all" | "completed" | "incomplete";

function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [filter, setFilter] = useState<TodoFilter>("all");
const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [error, setError] = useState("");

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let completed: boolean | undefined;

      if (filter === "completed") {
        completed = true;
      }

      if (filter === "incomplete") {
        completed = false;
      }

      const data = await getTodos(completed);
      setTodos(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not load todos."
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) {
      setError("Todo title is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createTodo({
        title: cleanTitle,
        description: cleanDescription || undefined,
      });

      setTitle("");
      setDescription("");

      await loadTodos();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not create todo."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(todo: Todo) {
    try {
      setUpdatingId(todo.id);
      setError("");

      const updatedTodo = await updateTodo(todo.id, {
        completed: !todo.completed,
      });

      if (
        filter === "completed" &&
        !updatedTodo.completed
      ) {
        setTodos((currentTodos) =>
          currentTodos.filter(
            (currentTodo) =>
              currentTodo.id !== updatedTodo.id
          )
        );

        return;
      }

      if (
        filter === "incomplete" &&
        updatedTodo.completed
      ) {
        setTodos((currentTodos) =>
          currentTodos.filter(
            (currentTodo) =>
              currentTodo.id !== updatedTodo.id
          )
        );

        return;
      }

      setTodos((currentTodos) =>
        currentTodos.map((currentTodo) =>
          currentTodo.id === updatedTodo.id
            ? updatedTodo
            : currentTodo
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not update todo."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(todoId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this todo?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(todoId);
      setError("");

      await deleteTodo(todoId);

      setTodos((currentTodos) =>
        currentTodos.filter(
          (todo) => todo.id !== todoId
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not delete todo."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleStartEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description ?? "");
    setError("");
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function handleSaveEdit(todoId: number) {
    const cleanTitle = editTitle.trim();
    const cleanDescription = editDescription.trim();

    if (!cleanTitle) {
      setError("Todo title is required.");
      return;
    }

    try {
      setSavingEdit(true);
      setError("");

      const updatedTodo = await updateTodo(todoId, {
        title: cleanTitle,
        description: cleanDescription || null,
      });

      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === updatedTodo.id
            ? updatedTodo
            : todo
        )
      );

      handleCancelEdit();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not save todo changes."
      );
    } finally {
      setSavingEdit(false);
    }
  }

  const completedCount = todos.filter(
    (todo) => todo.completed
  ).length;

  return (
    <main className="todos-page">
      <section className="todos-header">
        <div>
          <p className="eyebrow">Your workspace</p>
          <h1>My tasks</h1>
          <p>
            Create tasks and keep track of what you
            have completed.
          </p>
        </div>

        <div className="todo-summary">
          <strong>{todos.length}</strong>
          <span>Visible tasks</span>
        </div>
      </section>

      <section className="todo-create-card">
        <div className="section-heading">
          <h2>Add a new task</h2>
          <p>What would you like to complete?</p>
        </div>

        <form
          className="todo-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="todo-title">
              Task title
            </label>

            <input
              id="todo-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="For example: Finish React page"
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label htmlFor="todo-description">
              Description
              <span className="optional-label">
                Optional
              </span>
            </label>

            <textarea
              id="todo-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Add extra details about this task"
              maxLength={2000}
              rows={3}
            />
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Adding task..."
              : "Add task"}
          </button>
        </form>
      </section>

      <section className="todo-list-card">
        <div className="todo-toolbar">
          <div>
            <h2>Your tasks</h2>
            <p>
              {completedCount} completed in this view
            </p>
          </div>

          <div
            className="todo-filters"
            aria-label="Filter todos"
          >
            <button
              type="button"
              className={
                filter === "all" ? "active" : ""
              }
              onClick={() => setFilter("all")}
            >
              All
            </button>

            <button
              type="button"
              className={
                filter === "incomplete"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("incomplete")
              }
            >
              Active
            </button>

            <button
              type="button"
              className={
                filter === "completed"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("completed")
              }
            >
              Completed
            </button>
          </div>
        </div>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <div className="todo-empty-state">
            <p>Loading your tasks...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="todo-empty-state">
            <div className="empty-icon">✓</div>
            <h3>No tasks here</h3>
            <p>
              Add a new task or select another filter.
            </p>
          </div>
        ) : (
          <div className="todo-list">
            {todos.map((todo) => {
              const isEditing = editingId === todo.id;

              return (
                <article
                  className={`todo-item ${
                    todo.completed
                      ? "todo-completed"
                      : ""
                  }`}
                  key={todo.id}
                >
                  <button
                    type="button"
                    className="todo-checkbox"
                    aria-label={
                      todo.completed
                        ? "Mark todo as incomplete"
                        : "Mark todo as completed"
                    }
                    disabled={
                      updatingId === todo.id ||
                      isEditing
                    }
                    onClick={() => handleToggle(todo)}
                  >
                    {updatingId === todo.id
                      ? "…"
                      : todo.completed
                        ? "✓"
                        : ""}
                  </button>

                  <div className="todo-content">
                    {isEditing ? (
                      <div className="todo-edit-form">
                        <div className="form-group">
                          <label
                            htmlFor={`edit-title-${todo.id}`}
                          >
                            Task title
                          </label>

                          <input
                            id={`edit-title-${todo.id}`}
                            type="text"
                            value={editTitle}
                            onChange={(event) =>
                              setEditTitle(
                                event.target.value
                              )
                            }
                            maxLength={255}
                          />
                        </div>

                        <div className="form-group">
                          <label
                            htmlFor={`edit-description-${todo.id}`}
                          >
                            Description
                          </label>

                          <textarea
                            id={`edit-description-${todo.id}`}
                            value={editDescription}
                            onChange={(event) =>
                              setEditDescription(
                                event.target.value
                              )
                            }
                            maxLength={2000}
                            rows={3}
                          />
                        </div>

                        <div className="edit-actions">
                          <button
                            type="button"
                            className="save-button"
                            disabled={savingEdit}
                            onClick={() =>
                              handleSaveEdit(todo.id)
                            }
                          >
                            {savingEdit
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            type="button"
                            className="cancel-button"
                            disabled={savingEdit}
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3>{todo.title}</h3>

                        {todo.description && (
                          <p>{todo.description}</p>
                        )}

                        <span className="todo-date">
                          Created{" "}
                          {new Date(
                            todo.created_at
                          ).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="todo-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          handleStartEdit(todo)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        disabled={
                          deletingId === todo.id
                        }
                        onClick={() =>
                          handleDelete(todo.id)
                        }
                      >
                        {deletingId === todo.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default TodosPage;
