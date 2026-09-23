// Home page: restrained hero and product grid.
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet } from "../../shared/api/client";
import type { Category, Product, PublicSettings } from "../../shared/api/types";
import { categoryName } from "../../shared/i18n";
import { useShop } from "../../shared/shop/ShopContext";
import { SiteFooter } from "../../shared/ui/SiteFooter";
import { SiteHeader } from "../../shared/ui/SiteHeader";
import { ProductCard } from "./ProductCard";
import "./HomePage.css";

export function HomePage() {
  const { t, locale } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const selectedId = Number(searchParams.get("category")) || null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [catalog, publicSettings, categoryRows] = await Promise.all([
          apiGet<Product[]>("/api/products"),
          apiGet<PublicSettings>("/api/settings/public"),
          apiGet<Category[]>("/api/categories"),
        ]);
        if (!cancelled) {
          setProducts(catalog);
          setSettings(publicSettings);
          setCategories(categoryRows);
        }
      } catch {
        if (!cancelled) setError(t.error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t.error]);

  const visible = useMemo(() => {
    if (!selectedId) return products;
    return products.filter((product) => product.category_id === selectedId);
  }, [products, selectedId]);

  const categoryById = useMemo(() => {
    const map = new Map<number, Category>();
    for (const category of categories) map.set(category.id, category);
    return map;
  }, [categories]);

  function selectCategory(id: number | null) {
    if (id == null) setSearchParams({});
    else setSearchParams({ category: String(id) });
  }

  return (
    <div className="page">
      <SiteHeader storeName={settings?.store_name ?? ""} />
      <div className="page__main">
        <section className="hero">
          <div className="hero__content">
            {settings?.store_name?.trim() ? (
              <p className="hero__brand">{settings.store_name}</p>
            ) : null}
            <h1>{t.heroHeadline}</h1>
            <p className="hero__sub">{t.heroSub}</p>
            <a className="hero__cta" href="#catalog">
              {t.shopNow}
            </a>
          </div>
        </section>

        <main id="catalog" className="catalog">
          <div className="catalog__inner">
            <div className="catalog__head">
              <h2>{t.allProducts}</h2>
              {!loading && !error ? (
                <span className="catalog__count">{visible.length}</span>
              ) : null}
            </div>

            {!loading && !error ? (
              <div className="catalog__filters" role="tablist" aria-label={t.allProducts}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedId == null}
                  className={selectedId == null ? "is-active" : undefined}
                  onClick={() => selectCategory(null)}
                >
                  {t.categoryAll}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedId === category.id}
                    className={selectedId === category.id ? "is-active" : undefined}
                    onClick={() => selectCategory(category.id)}
                  >
                    {categoryName(category, locale)}
                  </button>
                ))}
              </div>
            ) : null}

            {loading ? <p className="catalog__status muted">{t.loading}</p> : null}
            {error ? <p className="catalog__status error">{error}</p> : null}
            {!loading && !error && visible.length === 0 ? (
              <p className="catalog__status muted">{t.emptyCatalog}</p>
            ) : null}

            <div className="catalog__grid">
              {visible.map((product) => {
                const category = product.category_id
                  ? categoryById.get(product.category_id)
                  : undefined;
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryLabel={category ? categoryName(category, locale) : undefined}
                  />
                );
              })}
            </div>
          </div>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
