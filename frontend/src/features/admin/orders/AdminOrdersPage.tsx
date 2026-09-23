// Admin order inbox with status filters, archive, and delete.
import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPatch } from "../../../shared/api/client";
import type { Order } from "../../../shared/api/types";
import { getAdminToken } from "../auth/token";
import "../admin.css";

const STATUSES = ["pending", "paid", "shipped", "cancelled"] as const;

type FilterKey = "active" | "pending" | "paid" | "shipped" | "cancelled" | "archived";

const STATUS_LABEL: Record<string, string> = {
  pending: "\u5f85\u4ed8\u6b3e",
  paid: "\u5df2\u4ed8\u6b3e",
  shipped: "\u5df2\u53d1\u8d27",
  cancelled: "\u5df2\u53d6\u6d88",
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "active", label: "\u8fdb\u884c\u4e2d" },
  { key: "pending", label: "\u5f85\u4ed8\u6b3e" },
  { key: "paid", label: "\u5df2\u4ed8\u6b3e" },
  { key: "shipped", label: "\u5df2\u53d1\u8d27" },
  { key: "cancelled", label: "\u5df2\u53d6\u6d88" },
  { key: "archived", label: "\u5df2\u5f52\u6863" },
];

export function AdminOrdersPage() {
  const token = getAdminToken() ?? "";
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<FilterKey>("active");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await apiGet<Order[]>("/api/admin/orders", token);
      setOrders(data.map((o) => ({ ...o, archived: Boolean(o.archived) })));
      setError("");
    } catch {
      setError("\u52a0\u8f7d\u8ba2\u5355\u5931\u8d25\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(() => {
    const result: Record<FilterKey, number> = {
      active: 0,
      pending: 0,
      paid: 0,
      shipped: 0,
      cancelled: 0,
      archived: 0,
    };
    for (const order of orders) {
      if (order.archived) {
        result.archived += 1;
      } else {
        result.active += 1;
        if (order.status in result) {
          result[order.status as Exclude<FilterKey, "active" | "archived">] += 1;
        }
      }
    }
    return result;
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter === "archived") {
        if (!order.archived) return false;
      } else if (filter === "active") {
        if (order.archived) return false;
      } else {
        if (order.archived || order.status !== filter) return false;
      }
      if (!q) return true;
      return (
        String(order.id).includes(q) ||
        order.customer_name.toLowerCase().includes(q) ||
        order.phone.toLowerCase().includes(q) ||
        order.address.toLowerCase().includes(q)
      );
    });
  }, [orders, filter, query]);

  async function changeStatus(id: number, status: string) {
    try {
      await apiPatch(`/api/admin/orders/${id}`, { status }, token);
      await load();
    } catch {
      setError("\u66f4\u65b0\u72b6\u6001\u5931\u8d25");
    }
  }

  async function setArchived(id: number, archived: boolean) {
    try {
      await apiPatch(`/api/admin/orders/${id}`, { archived }, token);
      await load();
    } catch {
      setError("\u5f52\u6863\u64cd\u4f5c\u5931\u8d25");
    }
  }

  async function removeOrder(id: number) {
    const ok = window.confirm(
      "\u786e\u8ba4\u6c38\u4e45\u5220\u9664\u8be5\u8ba2\u5355\uff1f\u6b64\u64cd\u4f5c\u4e0d\u53ef\u6062\u590d\u3002",
    );
    if (!ok) return;
    try {
      await apiDelete(`/api/admin/orders/${id}`, token);
      await load();
    } catch {
      setError("\u5220\u9664\u5931\u8d25\uff0c\u4ec5\u5df2\u5f52\u6863\u8ba2\u5355\u53ef\u5220\u9664");
    }
  }

  return (
    <div className="admin-section">
      <h1>{"\u8ba2\u5355\u7ba1\u7406"}</h1>
      {error ? <p className="error">{error}</p> : null}

      <div className="admin-order-filters" role="tablist" aria-label={"\u8ba2\u5355\u5206\u7c7b"}>
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={filter === item.key}
            className={filter === item.key ? "is-active" : undefined}
            onClick={() => setFilter(item.key)}
          >
            {item.label}
            <span>{counts[item.key]}</span>
          </button>
        ))}
      </div>

      <label className="admin-order-search">
        {"\u641c\u7d22\uff08\u8ba2\u5355\u53f7 / \u59d3\u540d / \u624b\u673a / \u5730\u5740\uff09"}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={"\u8f93\u5165\u5173\u952e\u8bcd"}
        />
      </label>

      {visible.length === 0 ? <p className="muted">{"\u5f53\u524d\u5206\u7c7b\u6682\u65e0\u8ba2\u5355"}</p> : null}

      <div className="admin-orders">
        {visible.map((order) => (
          <article
            key={order.id}
            className={`admin-order-card${order.archived ? " is-archived" : ""}`}
          >
            <header>
              <div>
                <strong>
                  {"\u8ba2\u5355"} #{order.id}
                </strong>
                <span className={`admin-order-badge status-${order.status}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
                {order.archived ? (
                  <span className="admin-order-badge is-archive-tag">{"\u5df2\u5f52\u6863"}</span>
                ) : null}
              </div>
              <span>
                ${(order.total_cents / 100).toFixed(2)} {order.currency}
              </span>
            </header>
            <p>
              <strong>{"\u59d3\u540d\uff1a"}</strong>
              {order.customer_name}
            </p>
            <p>
              <strong>{"\u624b\u673a\uff1a"}</strong>
              {order.phone}
            </p>
            <p>
              <strong>{"\u5730\u5740\uff1a"}</strong>
              {order.address}
            </p>
            {order.note ? (
              <p>
                <strong>{"\u5907\u6ce8\uff1a"}</strong>
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
            <div className="admin-order-actions">
              <label>
                {"\u72b6\u6001"}
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
              {order.archived ? (
                <>
                  <button type="button" className="ghost" onClick={() => setArchived(order.id, false)}>
                    {"\u53d6\u51fa\u5f52\u6863"}
                  </button>
                  <button type="button" className="danger" onClick={() => removeOrder(order.id)}>
                    {"\u5220\u9664"}
                  </button>
                </>
              ) : (
                <button type="button" className="ghost" onClick={() => setArchived(order.id, true)}>
                  {"\u5f52\u6863"}
                </button>
              )}
            </div>
            <p className="muted">
              {"\u4e0b\u5355\u65f6\u95f4\uff1a"}
              {new Date(order.created_at).toLocaleString("zh-CN")}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
