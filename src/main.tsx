import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Wajib dibungkus HelmetProvider agar SEO & GA jalan mulus */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)