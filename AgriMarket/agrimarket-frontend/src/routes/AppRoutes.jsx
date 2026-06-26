import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import authService from '../services/authService'
import AuthLayout from '../layouts/AuthLayout'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword'
import ResetPassword from '../pages/ResetPassword/ResetPassword'
import ResetSuccess from '../pages/ResetSuccess/ResetSuccess'
import ChangePassword from '../pages/ChangePassword/ChangePassword'

import ViewProfile from "../pages/Profile/ViewProfile";
import EditProfile from "../pages/Profile/EditProfile";
import Wishlist from "../pages/Profile/Wishlist";
import { FarmDetails } from "../pages/Farmer/FarmDetails/FarmDetails";
import { AddProduct } from "../pages/Farmer/AddProduct/AddProduct";
import { ProductList } from "../pages/Farmer/ProductList/ProductList";
import { FarmerRegister } from "../pages/Farmer/FarmerRegister/FarmerRegister";
import FarmerLayout from "../pages/Farmer/FarmerDashboard/FarmerLayout";
import FarmerOverview from "../pages/Farmer/FarmerDashboard/FarmerOverview";
import FarmerProfile from "../pages/Farmer/FarmerProfile/FarmerProfile";
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
import CheckoutPage from "../pages/Checkout/CheckoutPage";
import PaymentPage from "../pages/Payment/PaymentPage";
import VNPayCallbackPage from "../pages/Payment/VNPayCallbackPage";
import UserAccounts from "../pages/Admin/UserAccounts";
import CreateAccount from "../pages/Admin/CreateAccount";
import ShipmentRequests from "../pages/Shipper/ShipmentRequests";
import UpdateShipmentStatus from "../pages/Shipper/UpdateShipmentStatus";
import ProductApproval from "../pages/Admin/ProductApproval";
import OrderManagement from "../pages/Admin/OrderManagement";
import ProductReview from "../pages/Orders/ProductReview";
import ProductReviewsView from "../pages/Product/ProductReviewsView";
import Notifications from "../pages/Profile/Notifications";
import AdminNotifications from "../pages/Admin/Notifications/AdminNotifications";
import SupportHub from "../pages/Profile/Support/SupportHub";
import CreateSupportRequest from "../pages/Profile/Support/CreateSupportRequest";
import SupportRequestSuccess from "../pages/Profile/Support/SupportRequestSuccess";
import MySupportRequests from "../pages/Profile/Support/MySupportRequests";
import SupportRequestDetail from "../pages/Profile/Support/SupportRequestDetail";
import AdminComplaints from "../pages/Admin/AdminComplaints";


const FarmsRoute = () => {
  const user = authService.getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'farmer') {
    return <Navigate to="/farmer/dashboard" replace />;
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
        <Route path="/profile/wishlist" element={<Wishlist />} />
        <Route path="/profile/orders/:orderId/review/:itemIndex" element={<ProductReview />} />
        <Route path="/profile/orders/:id" element={<CustomerOrderDetail />} />
        <Route path="/security" element={<ChangePassword />} />
        <Route path="/farmer/register" element={<FarmerRegister />} />
        <Route path="/farmer/farm-details" element={<FarmDetails />} />
        <Route path="/farmer-profile/:id" element={<FarmerProfile />} />

        <Route path="/farmer" element={<FarmerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<FarmerOverview />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<AddProduct />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="orders/orderdetail/:id" element={<OrderDetail />} />
          <Route path="farm-profile" element={<FarmDetails />} />
        </Route>

        <Route path="/products" element={<ProductPage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/:id/reviews" element={<ProductReviewsView />} />

        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/vnpay-callback" element={<VNPayCallbackPage />} />

        {/* Privacy Policy and Terms of Service */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Admin Routes */}
        <Route path="/admin/users" element={<UserAccounts />} />
        <Route path="/admin/users/create" element={<CreateAccount />} />
        <Route path="/admin/products" element={<ProductApproval />} />
        <Route path="/admin/orders" element={<OrderManagement />} />

        {/* Shipper Routes */}
        <Route path="/shipper/dashboard" element={<Navigate to="/shipper/requests" replace />} />
        <Route path="/shipper/requests" element={<ShipmentRequests />} />
        <Route path="/shipper/update-status" element={<UpdateShipmentStatus />} />

        {/* Fallback to Home for any other unknown path */}
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/profile/notifications" element={<Notifications />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/support" element={<SupportHub />} />
        <Route path="/support/create" element={<CreateSupportRequest />} />
        <Route path="/support/success/:id" element={<SupportRequestSuccess />} />
        <Route path="/support/detail/:id" element={<SupportRequestDetail />} />
        <Route path="/support/my-requests" element={<MySupportRequests />} />
        <Route path="/admin/complaints" element={<AdminComplaints />} />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
