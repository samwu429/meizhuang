// Post-order payment instructions: WeChat QR and e-Transfer email.
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { apiGet } from "../../shared/api/client";
import type { Order, PublicSettings } from "../../shared/api/types";
import { formatMoney } from "../../shared/i18n";
import { useShop } from "../../shared/shop/ShopContext";
import { SiteFooter } from "../../shared/ui/SiteFooter";
import { SiteHeader } from "../../shared/ui/SiteHeader";
import "./checkout.css";

function readCachedOrder(orderId: string | undefined): Order | null {
  if (!orderId) return null;
  const raw = sessionStorage.getItem(`order:${orderId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Order;
  } catch {
    return null;
  }
}

export function OrderSuccessPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const { t, locale } = useShop();
  const stateOrder = (location.state as { order?: Order } | null)?.order;
  const [order, setOrder] = useState<Order | null>(
    stateOrder ?? readCachedOrder(orderId),
  );
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    apiGet<PublicSettings>("/api/settings/public")
      .then(setSettings)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!order && orderId) {
      setOrder(readCachedOrder(orderId));
    }
  }, [order, orderId]);

  return (
    <div className="page">
      <SiteHeader storeName={settings?.store_name ?? ""} />
      <main className="page__main success-page">
        <h1>{t.orderSuccess}</h1>
        <p>
          {t.orderId}: <strong>{order?.id ?? orderId}</strong>
        </p>
        {order && order.total_cents > 0 ? (
          <p>
            {t.amountDue}: {formatMoney(order.total_cents, order.currency, locale)}
          </p>
        ) : null}
        <p className="muted">{t.payInstructions}</p>

        <div className="success-page__grid">
          <section className="success-page__panel">
            <h2>{t.wechatPay}</h2>
            {settings?.wechat_qr_image ? (
              <img
                className="success-page__qr"
                src={settings.wechat_qr_image}
                alt={t.wechatPay}
              />
            ) : (
              <p className="muted">{t.noQr}</p>
            )}
          </section>
          <section className="success-page__panel">
            <h2>{t.etransfer}</h2>
            {settings?.etransfer_email ? (
              <p className="success-page__email">{settings.etransfer_email}</p>
            ) : (
              <p className="muted">{t.noEmail}</p>
            )}
            {settings?.etransfer_note ? <p>{settings.etransfer_note}</p> : null}
          </section>
        </div>

        <p style={{ marginTop: "2rem" }}>
          <Link to="/">{t.backHome}</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
