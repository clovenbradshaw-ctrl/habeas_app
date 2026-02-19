import { useState } from "react";
import { loginWithPassword } from "../matrix/client";

interface LoginViewProps {
  onLogin: () => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const baseUrl =
    import.meta.env.VITE_MATRIX_SERVER_URL ||
    "https://matrix.aminoimmigration.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginWithPassword(baseUrl, username, password);
      onLogin();
    } catch (err: any) {
      setError(
        err?.data?.error ||
          err?.message ||
          "Login failed. Check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-box" onSubmit={handleSubmit}>
        <div className="login-brand">Habeas</div>
        <div className="login-sub">Amino Immigration</div>

        {error && <div className="login-error">{error}</div>}

        <div className="frow">
          <label className="flbl">Username</label>
          <input
            className="finp"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="attorney"
            autoFocus
            disabled={loading}
          />
        </div>

        <div className="frow">
          <label className="flbl">Password</label>
          <input
            className="finp"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="hbtn accent login-btn"
          disabled={loading || !username || !password}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="login-server">
          Server: {baseUrl.replace("https://", "")}
        </div>
      </form>
    </div>
  );
}
