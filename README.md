# Beauty shop for Korean/Japanese cosmetics — static GitHub Pages + optional Render API.
# 日韩美妆购物站：GitHub Pages 静态站，可选 Render API。

## Live site

- GitHub Pages: https://samwu429.github.io/meizhuang/
- Admin: https://samwu429.github.io/meizhuang/admin/login

Default Pages admin password is `admin123` (override with repo variable `VITE_ADMIN_PASSWORD`).
Store data on Pages is stored in the browser LocalStorage until `VITE_API_BASE_URL` points at a live API.

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

## Neon / Render (optional backend)

1. Create Neon DB and set `DATABASE_URL` on Render.
2. Deploy `backend` (Docker) with `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `CORS_ORIGINS=https://samwu429.github.io`.
3. Set Pages variable `VITE_API_BASE_URL` to the API URL and redeploy Pages.

## Authorship

Published commits attribute work to Yihang (Sam) Wu.
