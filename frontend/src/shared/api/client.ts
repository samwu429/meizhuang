// Fetch client with LocalStorage fallback when VITE_API_BASE_URL is empty (GitHub Pages).
import { isLocalMode, localApi } from "./local/store";
import type { AdminSettings, Order, Product, PublicSettings } from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

function requireToken(token?: string): void {
  if (!token) throw new Error("Unauthorized");
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  if (isLocalMode()) {
    if (path === "/api/products") return localApi.listPublicProducts() as T;
    if (path === "/api/settings/public") return localApi.getPublicSettings() as T;
    if (path === "/api/admin/products") {
      requireToken(token);
      return localApi.listAdminProducts() as T;
    }
    if (path === "/api/admin/orders") {
      requireToken(token);
      return localApi.listOrders() as T;
    }
    if (path === "/api/admin/settings") {
      requireToken(token);
      return localApi.getAdminSettings() as T;
    }
    throw new Error(`Unsupported local GET ${path}`);
  }
  return request<T>(path, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  if (isLocalMode()) {
    if (path === "/api/admin/login") {
      const password = (body as { password: string }).password;
      return { access_token: localApi.login(password), token_type: "bearer" } as T;
    }
    if (path === "/api/orders") {
      return localApi.createOrder(body as Parameters<typeof localApi.createOrder>[0]) as T;
    }
    if (path === "/api/admin/products") {
      requireToken(token);
      return localApi.createProduct(body as Omit<Product, "id">) as T;
    }
    throw new Error(`Unsupported local POST ${path}`);
  }
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function apiPut<T>(path: string, body: unknown, token?: string): Promise<T> {
  if (isLocalMode()) {
    requireToken(token);
    const productMatch = path.match(/^\/api\/admin\/products\/(\d+)$/);
    if (productMatch) {
      return localApi.updateProduct(Number(productMatch[1]), body as Partial<Product>) as T;
    }
    if (path === "/api/admin/settings") {
      return localApi.updateSettings(body as Partial<PublicSettings>) as T;
    }
    throw new Error(`Unsupported local PUT ${path}`);
  }
  return request<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function apiPatch<T>(path: string, body: unknown, token?: string): Promise<T> {
  if (isLocalMode()) {
    requireToken(token);
    const orderMatch = path.match(/^\/api\/admin\/orders\/(\d+)$/);
    if (orderMatch) {
      return localApi.updateOrder(
        Number(orderMatch[1]),
        body as { status?: string; archived?: boolean },
      ) as T;
    }
    throw new Error(`Unsupported local PATCH ${path}`);
  }
  return request<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function apiDelete(path: string, token?: string): Promise<void> {
  if (isLocalMode()) {
    requireToken(token);
    const productMatch = path.match(/^\/api\/admin\/products\/(\d+)$/);
    if (productMatch) {
      localApi.deleteProduct(Number(productMatch[1]));
      return;
    }
    throw new Error(`Unsupported local DELETE ${path}`);
  }
  return request<void>(path, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function fetchProduct(id: number): Promise<Product | null> {
  if (isLocalMode()) {
    return localApi.getProduct(id);
  }
  try {
    return await request<Product>(`/api/products/${id}`);
  } catch {
    return null;
  }
}

export type { AdminSettings, Order, Product, PublicSettings };
