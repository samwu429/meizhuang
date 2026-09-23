// Admin payment settings.
import { useEffect, useState, type FormEvent } from "react";
import { apiGet, apiPut } from "../../../shared/api/client";
import type { AdminSettings } from "../../../shared/api/types";
import { fileToDataUrl } from "../../../shared/utils/image";
import { getAdminToken } from "../auth/token";
import "../admin.css";

export function AdminSettingsPage() {
  const token = getAdminToken() ?? "";
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiGet<AdminSettings>("/api/admin/settings", token)
      .then((data) => {
        setStoreName(data.store_name);
        setEmail(data.etransfer_email);
        setNote(data.etransfer_note);
        setQr(data.wechat_qr_image);
      })
      .catch(() => setError("加载设置失败，请重新登录"));
  }, [token]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await apiPut(
        "/api/admin/settings",
        {
          store_name: storeName,
          etransfer_email: email,
          etransfer_note: note,
          wechat_qr_image: qr,
        },
        token,
      );
      setMessage("设置已保存");
    } catch {
      setError("保存失败");
    }
  }

  return (
    <div className="admin-section">
      <h1>收款与店铺设置</h1>
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok">{message}</p> : null}
      <form className="admin-form" onSubmit={onSubmit}>
        <label>
          店名（可留空）
          <input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </label>
        <label>
          Interac e-Transfer 邮箱
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="payment@example.com"
          />
        </label>
        <label>
          e-Transfer 说明（中文）
          <textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <label>
          微信收款码图片
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const dataUrl = await fileToDataUrl(file, 700, 0.85);
              setQr(dataUrl);
            }}
          />
        </label>
        {qr ? <img className="admin-qr" src={qr} alt="WeChat QR preview" /> : null}
        <div className="admin-form__actions">
          <button type="submit">保存设置</button>
          {qr ? (
            <button type="button" className="ghost" onClick={() => setQr(null)}>
              清除收款码
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
