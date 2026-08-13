import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { SettingsProvider } from './store/SettingsContext'
import { CLStoreProvider } from './store/CLStore'
import { ClientStoreProvider } from './store/ClientStore'
import { ActivityLogProvider } from './store/ActivityLogContext'
import { AssignmentStoreProvider } from './store/AssignmentStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ActivityLogProvider>
        <SettingsProvider>
          <CLStoreProvider>
            <ClientStoreProvider>
              <AssignmentStoreProvider>
                <App />
              </AssignmentStoreProvider>
            </ClientStoreProvider>
          </CLStoreProvider>
        </SettingsProvider>
      </ActivityLogProvider>
    </BrowserRouter>
  </StrictMode>,
)
