// Catalog tile: image, name, and price; opens the product detail page.
import { Link } from "react-router-dom";
import type { Product } from "../../shared/api/types";
import { formatMoney, productName } from "../../shared/i18n";
import { useShop } from "../../shared/shop/ShopContext";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { locale } = useShop();
  const title = productName(product, locale);

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card__media">
        {product.image_data ? (
          <img src={product.image_data} alt={title} loading="lazy" />
        ) : (
          <div className="product-card__placeholder" aria-hidden />
        )}
      </div>
      <div className="product-card__body">
        <h3>{title}</h3>
        <p className="product-card__price">
          {formatMoney(product.price_cents, product.currency, locale)}
        </p>
      </div>
    </Link>
  );
}
