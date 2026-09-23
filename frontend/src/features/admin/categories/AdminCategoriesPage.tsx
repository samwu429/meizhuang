// Admin category CRUD. Storefront filters read the same records.
import { useEffect, useState, type FormEvent } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../../../shared/api/client";
import type { Category } from "../../../shared/api/types";
import { getAdminToken } from "../auth/token";
import "../admin.css";

const emptyForm = {
  name_zh: "",
  name_en: "",
  sort_order: "0",
  is_active: true,
};

export function AdminCategoriesPage() {
  const token = getAdminToken() ?? "";
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const data = await apiGet<Category[]>("/api/admin/categories", token);
      setCategories(data);
      setError("");
    } catch {
      setError("\u52a0\u8f7d\u5206\u7c7b\u5931\u8d25\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      name_zh: category.name_zh,
      name_en: category.name_en,
      sort_order: String(category.sort_order),
      is_active: category.is_active,
    });
    setMessage("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const payload = {
      name_zh: form.name_zh.trim(),
      name_en: form.name_en.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };
    try {
      if (editingId == null) {
        await apiPost("/api/admin/categories", payload, token);
        setMessage("\u5206\u7c7b\u5df2\u6dfb\u52a0");
      } else {
        await apiPut(`/api/admin/categories/${editingId}`, payload, token);
        setMessage("\u5206\u7c7b\u5df2\u66f4\u65b0");
      }
      resetForm();
      await load();
    } catch {
      setError("\u4fdd\u5b58\u5931\u8d25");
    }
  }

  async function onDelete(id: number) {
    if (!confirm("\u786e\u5b9a\u5220\u9664\u8be5\u5206\u7c7b\uff1f\u5206\u7c7b\u4e0b\u7684\u5546\u54c1\u4f1a\u53d8\u4e3a\u672a\u5206\u7c7b\u3002")) {
      return;
    }
    try {
      await apiDelete(`/api/admin/categories/${id}`, token);
      if (editingId === id) resetForm();
      await load();
    } catch {
      setError("\u5220\u9664\u5931\u8d25");
    }
  }

  return (
    <div className="admin-section">
      <h1>{"\u5206\u7c7b\u7ba1\u7406"}</h1>
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok">{message}</p> : null}

      <form className="admin-form" onSubmit={onSubmit}>
        <h2>{editingId == null ? "\u65b0\u589e\u5206\u7c7b" : `\u7f16\u8f91\u5206\u7c7b #${editingId}`}</h2>
        <div className="admin-form__grid">
          <label>
            {"\u4e2d\u6587\u540d\u79f0"}
            <input
              required
              value={form.name_zh}
              onChange={(e) => setForm({ ...form, name_zh: e.target.value })}
            />
          </label>
          <label>
            {"\u82f1\u6587\u540d\u79f0"}
            <input
              value={form.name_en}
              onChange={(e) => setForm({ ...form, name_en: e.target.value })}
            />
          </label>
          <label>
            {"\u6392\u5e8f"}
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
          </label>
          <label className="admin-form__check">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            {"\u524d\u53f0\u663e\u793a"}
          </label>
        </div>
        <div className="admin-form__actions">
          <button type="submit">{editingId == null ? "\u6dfb\u52a0" : "\u4fdd\u5b58"}</button>
          {editingId != null ? (
            <button type="button" className="ghost" onClick={resetForm}>
              {"\u53d6\u6d88\u7f16\u8f91"}
            </button>
          ) : null}
        </div>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>{"\u540d\u79f0"}</th>
            <th>{"\u6392\u5e8f"}</th>
            <th>{"\u72b6\u6001"}</th>
            <th>{"\u64cd\u4f5c"}</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.id}</td>
              <td>
                {category.name_zh}
                {category.name_en ? ` / ${category.name_en}` : ""}
              </td>
              <td>{category.sort_order}</td>
              <td>{category.is_active ? "\u663e\u793a" : "\u9690\u85cf"}</td>
              <td className="admin-table__actions">
                <button type="button" onClick={() => startEdit(category)}>
                  {"\u7f16\u8f91"}
                </button>
                <button type="button" className="danger" onClick={() => onDelete(category.id)}>
                  {"\u5220\u9664"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
