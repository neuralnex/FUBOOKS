import { Route, Routes, Navigate } from "react-router-dom";

import IndexPage from "@/pages/index";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import BooksPage from "@/pages/books";
import BookDetailPage from "@/pages/book-detail";
import CartPage from "@/pages/cart";
import OrdersPage from "@/pages/orders";
import PaymentPage from "@/pages/payment";
import DashboardPage from "@/pages/dashboard";
import ProfilePage from "@/pages/profile";
import AdminPage from "@/pages/admin";
import AdminBookFormPage from "@/pages/admin-book-form";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/register" />
      <Route element={<BooksPage />} path="/books" />
      <Route element={<BookDetailPage />} path="/books/:id" />
      <Route element={<CartPage />} path="/cart" />
      <Route element={<OrdersPage />} path="/orders" />
      <Route element={<PaymentPage />} path="/orders/:id/payment" />
      <Route element={<DashboardPage />} path="/dashboard" />
      <Route element={<ProfilePage />} path="/profile" />
      <Route element={<AdminPage />} path="/admin" />
      <Route element={<AdminBookFormPage />} path="/admin/books/new" />
      <Route element={<AdminBookFormPage />} path="/admin/books/:id/edit" />
      <Route element={<Navigate to="/" replace />} path="*" />
    </Routes>
  );
}

export default App;
