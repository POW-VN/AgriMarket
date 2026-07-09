import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import authService from '../services/authService'
import AuthLayout from '../layouts/AuthLayout'
import ChatPopup from '../components/common/ChatPopup/ChatPopup'
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
import { FarmerChat } from "../pages/Farmer/FarmerChat/FarmerChat";
import { FarmerLivestream } from "../pages/Farmer/FarmerLivestream/FarmerLivestream";
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
import PreorderCheckout from "../pages/Product/PreorderCheckout";
import PreorderList from "../pages/Product/PreorderList";
import PaymentPage from "../pages/Payment/PaymentPage";
import VNPayCallbackPage from "../pages/Payment/VNPayCallbackPage";
import UserAccounts from "../pages/Admin/UserAccounts";
import CreateAccount from "../pages/Admin/CreateAccount";
import ProductApproval from "../pages/Admin/ProductApproval";
import OrderManagement from "../pages/Admin/OrderManagement";
import ProductReview from "../pages/Orders/ProductReview";
import ProductReviewsView from "../pages/Product/ProductReviewsView";
import Notifications from "../pages/Profile/Notifications";
import AdminNotifications from "../pages/Admin/Notifications/AdminNotifications";
import SupportHub from "../pages/Profile/Support/SupportHub";
import CreateSupportRequest from "../pages/Profile/Support/CreateSupportRequest";
import ReportViolation from "../pages/Profile/Support/ReportViolation";
import SupportRequestSuccess from "../pages/Profile/Support/SupportRequestSuccess";
import MySupportRequests from "../pages/Profile/Support/MySupportRequests";
import SupportRequestDetail from "../pages/Profile/Support/SupportRequestDetail";
import AdminComplaints from "../pages/Admin/AdminComplaints";
import LiveChat from "../pages/Profile/Support/LiveChat";
import AdminChat from "../pages/Admin/AdminChat";
import LivestreamPage from "../pages/Livestream/LivestreamPage";
import LivestreamListPage from "../pages/Livestream/LivestreamListPage";
import ViolationReports from "../pages/Admin/ViolationReports";
import ProductListing from "../pages/Product/ProductListing";
import LiveManagement from "../pages/Admin/LiveManagement";
import CategoryManagement from "../pages/Admin/CategoryManagement";
import FarmerPromotions from "../pages/Farmer/FarmerPromotions/FarmerPromotions";
import AdminPromotions from "../pages/Admin/Promotions/AdminPromotions";
import AdminTransactions from "../pages/Admin/Transactions/AdminTransactions";


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

const NonAdminRoute = () => {
  const user = authService.getCurrentUser();
  if (user && user.role?.toLowerCase() === 'admin') {
    return <Navigate to="/admin/users" replace />;
  }
  return <Outlet />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Non-Admin Layout Guard */}
        <Route element={<NonAdminRoute />}>
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
            <Route path="chat" element={<FarmerChat />} />
            <Route path="livestream" element={<FarmerLivestream />} />
            <Route path="promotions" element={<FarmerPromotions />} />
          </Route>

          <Route path="/products" element={<ProductPage />} />
          <Route path="/products/listing" element={<ProductListing />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/:id/reviews" element={<ProductReviewsView />} />

          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/preorders" element={<PreorderList />} />
          <Route path="/preorder-checkout" element={<PreorderCheckout />} />
          <Route path="/livestream" element={<LivestreamListPage />} />
          <Route path="/livestream/:id" element={<LivestreamPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/vnpay-callback" element={<VNPayCallbackPage />} />

          {/* Privacy Policy and Terms of Service */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />



          <Route path="/profile/notifications" element={<Notifications />} />
          <Route path="/support" element={<SupportHub />} />
          <Route path="/support/create" element={<CreateSupportRequest />} />
          <Route path="/support/report" element={<ReportViolation />} />
          <Route path="/support/success/:id" element={<SupportRequestSuccess />} />
          <Route path="/support/detail/:id" element={<SupportRequestDetail />} />
          <Route path="/support/my-requests" element={<MySupportRequests />} />
          <Route path="/support/chat" element={<LiveChat />} />
          <Route path="/support/chat/:requestId" element={<LiveChat />} />
          <Route path="/support/report" element={<ReportViolation />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/users" element={<UserAccounts />} />
        <Route path="/admin/users/create" element={<CreateAccount />} />
        <Route path="/admin/products" element={<ProductApproval />} />
        <Route path="/admin/orders" element={<OrderManagement />} />
        <Route path="/admin/categories" element={<CategoryManagement />} />
        <Route path="/admin/livestreams" element={<LiveManagement />} />
        <Route path="/admin/promotions" element={<AdminPromotions />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/complaints" element={<AdminComplaints />} />
        <Route path="/admin/chat" element={<AdminChat />} />
        <Route path="/admin/chat/:requestId" element={<AdminChat />} />
        <Route path="/admin/reports" element={<ViolationReports />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />

        {/* Fallback to Home for any other unknown path */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
      <ChatPopup />
    </BrowserRouter>
  )
}

export default AppRoutes
