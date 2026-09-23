// Admin product CRUD.
import { useEffect, useState, type FormEvent } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../../../shared/api/client";
import type { Product } from "../../../shared/api/types";
import { fileToDataUrl } from "../../../shared/utils/image";
import { getAdminToken } from "../auth/token";
import "../admin.css";

const emptyForm = {
  name_zh: "",
  name_en: "",
  description_zh: "",
  description_en: "",
  price_cad: "0",
  image_data: null as string | null,
  is_active: true,
  sort_order: "0",
};

export function AdminProductsPage() {
  const token = getAdminToken() ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const data = await apiGet<Product[]>("/api/admin/products", token);
      setProducts(data);
    } catch {
      setError("加载商品失败，请重新登录");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name_zh: product.name_zh,
      name_en: product.name_en,
      description_zh: product.description_zh,
      description_en: product.description_en,
      price_cad: (product.price_cents / 100).toFixed(2),
      image_data: product.image_data,
      is_active: product.is_active,
      sort_order: String(product.sort_order),
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
    const price_cents = Math.round(Number(form.price_cad) * 100);
    if (Number.isNaN(price_cents) || price_cents < 0) {
      setError("价格无效");
      return;
    }
    const payload = {
      name_zh: form.name_zh,
      name_en: form.name_en,
      description_zh: form.description_zh,
      description_en: form.description_en,
      price_cents,
      currency: "CAD",
      image_data: form.image_data,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    };
    try {
      if (editingId == null) {
        await apiPost("/api/admin/products", payload, token);
        setMessage("商品已添加");
      } else {
        await apiPut(`/api/admin/products/${editingId}`, payload, token);
        setMessage("商品已更新");
      }
      resetForm();
      await load();
    } catch {
      setError("保存失败");
    }
  }

  async function onDelete(id: number) {
    if (!confirm("确定删除该商品？")) return;
    try {
      await apiDelete(`/api/admin/products/${id}`, token);
      await load();
    } catch {
      setError("删除失败");
    }
  }

  return (
    <div className="admin-section">
      <h1>商品管理</h1>
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok">{message}</p> : null}

      <form className="admin-form" onSubmit={onSubmit}>
        <h2>{editingId == null ? "新增商品" : `编辑商品 #${editingId}`}</h2>
        <div className="admin-form__grid">
          <label>
            中文名称
            <input
              required
              value={form.name_zh}
              onChange={(e) => setForm({ ...form, name_zh: e.target.value })}
            />
          </label>
          <label>
            英文名称
            <input
              value={form.name_en}
              onChange={(e) => setForm({ ...form, name_en: e.target.value })}
            />
          </label>
          <label>
            价格（CAD）
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price_cad}
              onChange={(e) => setForm({ ...form, price_cad: e.target.value })}
            />
          </label>
          <label>
            排序
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
          </label>
          <label className="span-2">
            中文描述
            <textarea
              value={form.description_zh}
              onChange={(e) => setForm({ ...form, description_zh: e.target.value })}
            />
          </label>
          <label className="span-2">
            英文描述
            <textarea
              value={form.description_en}
              onChange={(e) => setForm({ ...form, description_en: e.target.value })}
            />
          </label>
          <label>
            商品图片
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const dataUrl = await fileToDataUrl(file);
                setForm((prev) => ({ ...prev, image_data: dataUrl }));
              }}
            />
          </label>
          <label className="admin-form__check">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            上架销售
          </label>
        </div>
        {form.image_data ? (
          <img className="admin-thumb" src={form.image_data} alt="preview" />
        ) : null}
        <div className="admin-form__actions">
          <button type="submit">{editingId == null ? "添加" : "保存"}</button>
          {editingId != null ? (
            <button type="button" className="ghost" onClick={resetForm}>
              取消编辑
            </button>
          ) : null}
        </div>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>价格</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>
                {p.name_zh}
                {p.name_en ? ` / ${p.name_en}` : ""}
              </td>
              <td>${(p.price_cents / 100).toFixed(2)}</td>
              <td>{p.is_active ? "上架" : "下架"}</td>
              <td className="admin-table__actions">
                <button type="button" onClick={() => startEdit(p)}>
                  编辑
                </button>
                <button type="button" className="danger" onClick={() => onDelete(p.id)}>
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
