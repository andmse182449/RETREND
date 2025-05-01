import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";
import HomePage from "./pages/customer/HomePage";
import ProductsPage from "./pages/customer/ProductsPage";
import ProductDetailPage from "./pages/customer/ProductDetailPage";
import CartPage from "./pages/customer/CartPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import LoginPage from "./pages/customer/LoginPage";
import SignUpPage from "./pages/customer/SignupPage";
import ProfilePage from "./pages/customer/ProfilePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import ContactPage from "./pages/Contact";
import ShippingPolicyPage from "./pages/Shipping";
import ReturnsPage from "./pages/Returns";
import SellNow from "./pages/customer/SellNow";
import SellerDashboard from "./pages/seller/SellerDashboard";
import CustomerProductsPage from "./pages/customer/CustomerProductsPage";
import BlindboxPage from "./pages/customer/BlindboxPage";
import AdminCustomerDetails from "./pages/admin/AdminCustomerDetails";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          {/* Customer routes */}
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignUpPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="shipping" element={<ShippingPolicyPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="sell" element={<SellNow />} />
            <Route path="test" element={<CustomerProductsPage />} />
            <Route path="dashboard" element={<SellerDashboard />} />
            <Route path="blindbox" element={<BlindboxPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="admindashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:userId" element={<AdminCustomerDetails />} />
          </Route>

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;
