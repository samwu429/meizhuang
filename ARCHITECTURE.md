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

On GitHub Pages (no `VITE_API_BASE_URL`), products/orders/settings live in browser LocalStorage.
With the FastAPI backend, product and QR images are stored as data URLs in Postgres so free Render disks do not need to be durable.
