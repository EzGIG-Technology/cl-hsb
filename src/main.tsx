import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { SettingsProvider } from './store/SettingsContext'
import { CLStoreProvider } from './store/CLStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <CLStoreProvider>
          <App />
        </CLStoreProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
)
