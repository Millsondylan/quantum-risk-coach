import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'

// Import the main App component
import App from './App.tsx'

// Import global styles
import './styles/theme.css'
import './index.css'

// Create React app
const root = ReactDOM.createRoot(document.getElementById('app')!)

// Render app
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        duration={5000}
        closeButton={true}
        richColors={true}
      />
    </BrowserRouter>
  </React.StrictMode>
) 