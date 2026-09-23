// Application router: storefront pages and Chinese admin area.
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./features/admin/AdminLayout";
import { AdminLoginPage } from "./features/admin/auth/AdminLoginPage";
import { AdminOrdersPage } from "./features/admin/orders/AdminOrdersPage";
import { AdminProductsPage } from "./features/admin/products/AdminProductsPage";
import { AdminSettingsPage } from "./features/admin/settings/AdminSettingsPage";
import { HomePage } from "./features/catalog/HomePage";
import { CartPage } from "./features/checkout/CartPage";
import { CheckoutPage } from "./features/checkout/CheckoutPage";
import { OrderSuccessPage } from "./features/checkout/OrderSuccessPage";
import { ShopProvider } from "./shared/shop/ShopContext";

export default function App() {
  const basename = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") || undefined;
  return (
    <ShopProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:orderId" element={<OrderSuccessPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ShopProvider>
  );
}
