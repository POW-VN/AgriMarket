import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'
import { RoleSelection } from '../pages/RoleCard/RoleCard'

import ViewProfile from "../pages/Profile/ViewProfile";
import EditProfile from "../pages/Profile/EditProfile";
import { FarmDetails } from "../pages/Farmer/FarmDetails/FarmDetails";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes under AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/profile" element={<ViewProfile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/farmer/farm-details" element={<FarmDetails />} />
        
        {/* Route to test RoleSelection */}
        <Route path="/role" element={<RoleSelection />} />

        {/* Redirect from root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Fallback to login for any other unknown path */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
