// Compact site footer for storefront pages.
import { useShop } from "../shop/ShopContext";
import "./SiteFooter.css";

export function SiteFooter() {
  const { t } = useShop();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p>{t.footerNote}</p>
      </div>
    </footer>
  );
}
