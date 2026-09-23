# Beauty shop for Korean/Japanese cosmetics — static GitHub Pages + optional Render API.
# 日韩美妆购物站：GitHub Pages 静态站，可选 Render API。

## Live site

- GitHub Pages: https://samwu429.github.io/meizhuang/
- Admin: https://samwu429.github.io/meizhuang/admin/login

With `VITE_API_BASE_URL` set, the shop and admin share one Neon database through the Render API. Everyone sees the same products, categories, and orders.
Local Pages mode (empty `VITE_API_BASE_URL`) still keeps data in that browser only. Its admin password defaults to `admin123`.
The live admin password is the API `ADMIN_PASSWORD`, not the Pages variable.

## Stack

- Frontend: Vite + React + TypeScript (zh/en storefront, Chinese admin)
- Backend (optional): FastAPI + SQLAlchemy + Neon Postgres
- Pages mode: no backend; LocalStorage for products, orders, payment settings

## Local development

### Frontend only (Pages mode)

```bash
cd frontend
npm install
npm run dev
```

Leave `VITE_API_BASE_URL` empty to use LocalStorage.

### Full stack with API

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
# copy backend/.env.example to backend/.env and set DATABASE_URL / ADMIN_PASSWORD
uvicorn app.main:app --reload --port 8000

cd ../frontend
# set VITE_API_BASE_URL=http://localhost:8000 in frontend/.env
npm run dev
```

## GitHub Pages deploy

Push to `main` runs `.github/workflows/deploy-pages.yml`.

Optional repository Variables:

- `VITE_API_BASE_URL` — Render/API origin when you attach a backend
- `VITE_ADMIN_PASSWORD` — admin password for Pages LocalStorage mode

Enable Pages: Settings → Pages → Source = GitHub Actions.

## Shared backend

The API is a free Render web service (`render.yaml`, Docker, `backend/`). Data lives in a free Neon Postgres project. Product categories are edited in the admin and shown as filters on the storefront.

## Authorship

Published commits attribute work to Yihang (Sam) Wu.
