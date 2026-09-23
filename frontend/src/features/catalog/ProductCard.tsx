// Product card for the storefront catalog grid.
import type { Product } from "../../shared/api/types";
import { formatMoney, productDescription, productName } from "../../shared/i18n";
import { useShop } from "../../shared/shop/ShopContext";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { locale, t, addToCart } = useShop();

  return (
    <article className="product-card">
      <div className="product-card__media">
        {product.image_data ? (
          <img src={product.image_data} alt={productName(product, locale)} />
        ) : (
          <div className="product-card__placeholder" aria-hidden />
        )}
      </div>
      <div className="product-card__body">
        <h3>{productName(product, locale)}</h3>
        <p>{productDescription(product, locale)}</p>
        <div className="product-card__footer">
          <span className="product-card__price">
            {formatMoney(product.price_cents, product.currency, locale)}
          </span>
          <button type="button" onClick={() => addToCart(product)}>
            {t.addToCart}
          </button>
        </div>
      </div>
    </article>
  );
}
