import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Server, Globe, BarChart3, Settings, Shield, BookOpen, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'IP Addresses', href: '/ips', icon: Server },
  { name: 'Hostnames', href: '/hostnames', icon: Globe },
  { name: 'Statistics', href: '/statistics', icon: BarChart3 },
  { name: 'Documentation', href: '/docs', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
]

function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-800">
        <Shield className="h-8 w-8 text-primary-500" />
        <span className="text-lg font-semibold">IP Blacklist</span>
      </div>

      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors mb-3"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
        <div className="text-xs text-gray-500">
          IP Blacklist Monitor v1.0
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
