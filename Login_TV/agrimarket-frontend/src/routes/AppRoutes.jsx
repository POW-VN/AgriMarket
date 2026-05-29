import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes under AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Redirect from root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Fallback to login for any other unknown path */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
