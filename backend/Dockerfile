# Production container for the FastAPI service on Render.
# 用于 Render 上 FastAPI 服务的生产容器。
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV PORT=8000
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
