import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { NotificationProvider } from './contexts/NotificationContext'

function App() {
  return (
    <NotificationProvider>
      <AppRoutes />
    </NotificationProvider>
  )
}

export default App
