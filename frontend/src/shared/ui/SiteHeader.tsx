// Site header with optional store name, language toggle, and cart link.
import { Link, NavLink } from "react-router-dom";
import { useShop } from "../shop/ShopContext";
import "./SiteHeader.css";

interface SiteHeaderProps {
  storeName: string;
}

export function SiteHeader({ storeName }: SiteHeaderProps) {
  const { locale, setLocale, t, cartCount } = useShop();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__brand">
          {storeName.trim() ? storeName : " "}
        </Link>
        <nav className="site-header__nav" aria-label="main">
          <NavLink to="/" end>
            {t.shop}
          </NavLink>
          <NavLink to="/cart">
            {t.cart}
            {cartCount > 0 ? <span className="site-header__badge">{cartCount}</span> : null}
          </NavLink>
          <button
            type="button"
            className="site-header__lang"
            onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
          >
            {t.language}
          </button>
        </nav>
      </div>
    </header>
  );
}
