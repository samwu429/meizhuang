# Architecture notes

## Layers

- `backend/app/api/routes`: HTTP adapters (public vs admin)
- `backend/app/domain`: entities, schemas, small domain services
- `backend/app/infrastructure`: config, database, JWT auth
- `frontend/src/features`: storefront catalog/checkout and Chinese admin UI
- `frontend/src/shared`: API client, i18n, cart context, shared UI

## Payment model

Orders are recorded first; the storefront then shows operator-managed WeChat QR and Interac e-Transfer instructions. There is no card/WeChat gateway integration in v1.

## Persistence

On GitHub Pages with `VITE_API_BASE_URL`, the browser calls the Render API and Neon Postgres, so every visitor shares one catalog, category list, and order inbox.
Without that variable, products/orders/settings stay in browser LocalStorage.
Product and QR images are stored as data URLs in Postgres so the free Render disk does not need to be durable.
Categories are a separate table; products reference `category_id`. Deleting a category clears that link and keeps the products.
