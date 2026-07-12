import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authApi";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const response = await forgotPassword(email.trim());

      setMessage(response.message);
      setEmail("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not send the password reset link."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <h1>Forgot your password?</h1>
          <p>
            Enter your email address and we will send you a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="forgot-email">Email address</label>

            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="salma@example.com"
              autoComplete="email"
            />
          </div>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="success-message" role="status">
              {message}
            </p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Sending link..." : "Send reset link"}
          </button>
        </form>

        <p className="auth-footer">
          Remembered your password?{" "}
          <Link to="/login">Back to login</Link>
        </p>
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
