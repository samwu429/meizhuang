// Admin order list.
import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "../../../shared/api/client";
import type { Order } from "../../../shared/api/types";
import { getAdminToken } from "../auth/token";
import "../admin.css";

const STATUSES = ["pending", "paid", "shipped", "cancelled"] as const;

const STATUS_LABEL: Record<string, string> = {
  pending: "待付款",
  paid: "已付款",
  shipped: "已发货",
  cancelled: "已取消",
};

export function AdminOrdersPage() {
  const token = getAdminToken() ?? "";
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await apiGet<Order[]>("/api/admin/orders", token);
      setOrders(data);
    } catch {
      setError("加载订单失败，请重新登录");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function changeStatus(id: number, status: string) {
    try {
      await apiPatch(`/api/admin/orders/${id}`, { status }, token);
      await load();
    } catch {
      setError("更新状态失败");
    }
  }

  return (
    <div className="admin-section">
      <h1>订单管理</h1>
      {error ? <p className="error">{error}</p> : null}
      {orders.length === 0 ? <p className="muted">暂无订单</p> : null}
      <div className="admin-orders">
        {orders.map((order) => (
          <article key={order.id} className="admin-order-card">
            <header>
              <strong>订单 #{order.id}</strong>
              <span>
                ${(order.total_cents / 100).toFixed(2)} {order.currency}
              </span>
            </header>
            <p>
              <strong>姓名：</strong>
              {order.customer_name}
            </p>
            <p>
              <strong>手机：</strong>
              {order.phone}
            </p>
            <p>
              <strong>地址：</strong>
              {order.address}
            </p>
            {order.note ? (
              <p>
                <strong>备注：</strong>
                {order.note}
              </p>
            ) : null}
            <ul>
              {order.items.map((item) => (
                <li key={`${order.id}-${item.product_id}`}>
                  {item.name_zh} x {item.qty} (${(item.price_cents / 100).toFixed(2)})
                </li>
              ))}
            </ul>
            <label>
              状态
              <select
                value={order.status}
                onChange={(e) => changeStatus(order.id, e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <p className="muted">
              下单时间：{new Date(order.created_at).toLocaleString("zh-CN")}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
