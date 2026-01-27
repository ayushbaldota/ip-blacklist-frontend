import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const pageTitles = {
  '/': 'Dashboard',
  '/ips': 'IP Addresses',
  '/statistics': 'Statistics',
  '/settings': 'Settings',
}

function Layout() {
  const location = useLocation()

  // Get title based on route, handling dynamic routes
  const getTitle = () => {
    if (location.pathname.startsWith('/ips/')) {
      return 'IP Details'
    }
    return pageTitles[location.pathname] || 'IP Blacklist Monitor'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <Header title={getTitle()} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
