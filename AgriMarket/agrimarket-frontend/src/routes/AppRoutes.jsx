import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import authService from '../services/authService'
import AuthLayout from '../layouts/AuthLayout'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'
import { RoleSelection } from '../pages/RoleCard/RoleCard'
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword'
import ResetPassword from '../pages/ResetPassword/ResetPassword'
import ResetSuccess from '../pages/ResetSuccess/ResetSuccess'
import ChangePassword from '../pages/ChangePassword/ChangePassword'

import ViewProfile from "../pages/Profile/ViewProfile";
import EditProfile from "../pages/Profile/EditProfile";
import { FarmDetails } from "../pages/Farmer/FarmDetails/FarmDetails";
import { AddProduct } from "../pages/Farmer/AddProduct/AddProduct";
import { ProductList } from "../pages/Farmer/ProductList/ProductList";
import { FarmerRegister } from "../pages/Farmer/FarmerRegister/FarmerRegister";
import Home from '../pages/Home/Home'
import ProductPage from "../pages/Product/ProductPage";
import ProductDetail from "../pages/Product/ProductDetail";
import PrivacyPolicy from "../pages/Privacy/PrivacyPolicy";
import TermsOfService from "../pages/Terms/TermsOfService";
import { OrderHistory } from "../pages/Farmer/Orders/OrderHistory";
import { OrderDetail } from "../pages/Farmer/Orders/OrderDetail";
import MyOrders from "../pages/Orders/MyOrders";
import CustomerOrderDetail from "../pages/Orders/CustomerOrderDetail";
import CartPage from "../pages/Cart/CartPage";
import PaymentPage from "../pages/Payment/PaymentPage";

const FarmsRoute = () => {
  const user = authService.getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'farmer') {
    return <Navigate to="/farmer/products" replace />;
  }
  return <Navigate to="/farmer/register" replace />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main route (Home page) */}
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/farms" element={<FarmsRoute />} />

        {/* Auth routes under AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-success" element={<ResetSuccess />} />
        </Route>

        <Route path="/profile" element={<ViewProfile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/profile/orders" element={<MyOrders />} />
        <Route path="/profile/orders/:id" element={<CustomerOrderDetail />} />
        <Route path="/security" element={<ChangePassword />} />
        <Route path="/farmer/farm-details" element={<FarmDetails />} />
        <Route path="/farmer/register" element={<FarmerRegister />} />
        <Route path="/farmer/products/add" element={<AddProduct />} />
        <Route path="/farmer/products" element={<ProductList />} />
        <Route path="/farmer/orders" element={<OrderHistory />} />
        <Route path="/farmer/orders/:id" element={<OrderDetail />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* Route to test RoleSelection */}
        <Route path="/role" element={<RoleSelection />} />

        {/* Privacy Policy and Terms of Service */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Fallback to Home for any other unknown path */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
