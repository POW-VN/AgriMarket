import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import Home from '../pages/Home/Home'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main route (Home page) */}
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />

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
        <Route path="/security" element={<ChangePassword />} />
        <Route path="/farmer/farm-details" element={<FarmDetails />} />

        {/* Route to test RoleSelection */}
        <Route path="/role" element={<RoleSelection />} />

        {/* Fallback to Home for any other unknown path */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
