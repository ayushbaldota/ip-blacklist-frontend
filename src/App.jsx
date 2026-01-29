import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/common/ErrorBoundary'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import IPList from './pages/IPList'
import IPDetail from './pages/IPDetail'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'
import Documentation from './pages/Documentation'

function App() {
  return (
    <ErrorBoundary>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="ips" element={<IPList />} />
        <Route path="ips/:ipAddress" element={<IPDetail />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="docs" element={<Documentation />} />
      </Route>
    </Routes>
    </ErrorBoundary>
  )
}

export default App
