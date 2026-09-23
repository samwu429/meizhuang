// Admin shell with Chinese navigation.
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { clearAdminToken, getAdminToken } from "./auth/token";
import "./admin.css";

export function AdminLayout() {
  const navigate = useNavigate();
  const token = getAdminToken();
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <strong>管理后台</strong>
        <nav>
          <NavLink to="/admin" end>
            商品
          </NavLink>
          <NavLink to="/admin/orders">订单</NavLink>
          <NavLink to="/admin/settings">收款设置</NavLink>
          <button
            type="button"
            onClick={() => {
              clearAdminToken();
              navigate("/admin/login");
            }}
          >
            退出
          </button>
        </nav>
      </header>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
