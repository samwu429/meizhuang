// Chinese-only admin login screen.
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../../shared/api/client";
import { setAdminToken } from "./token";
import "../admin.css";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await apiPost<{ access_token: string }>("/api/admin/login", {
        password,
      });
      setAdminToken(result.access_token);
      navigate("/admin");
    } catch {
      setError("密码错误或无法连接服务器");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-shell">
      <main className="admin-login">
        <h1>管理后台登录</h1>
        <form onSubmit={onSubmit}>
          <label>
            密码
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
      </main>
    </div>
  );
}
