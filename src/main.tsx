import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.tsx'
import { SettingsProvider } from './store/SettingsContext'
import { CLStoreProvider } from './store/CLStore'
import { ClientStoreProvider } from './store/ClientStore'
import { ActivityLogProvider } from './store/ActivityLogContext'
import { AssignmentStoreProvider } from './store/AssignmentStore'
import { DisputeStoreProvider } from './store/DisputeStore'
import { MessageStoreProvider } from './store/MessageStore'
import { FinanceStoreProvider } from './store/FinanceStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ActivityLogProvider>
        <SettingsProvider>
          <CLStoreProvider>
            <ClientStoreProvider>
              <AssignmentStoreProvider>
                <DisputeStoreProvider>
                  <MessageStoreProvider>
                    <FinanceStoreProvider>
                      <App />
                    </FinanceStoreProvider>
                  </MessageStoreProvider>
                </DisputeStoreProvider>
              </AssignmentStoreProvider>
            </ClientStoreProvider>
          </CLStoreProvider>
        </SettingsProvider>
      </ActivityLogProvider>
    </BrowserRouter>
  </StrictMode>,
)
