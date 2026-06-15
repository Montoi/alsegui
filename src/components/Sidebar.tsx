import { IconChart, IconGrid } from '../icons/Icons'
import type { Page } from '../types'

interface SidebarProps {
  activePage: Page
  onNavigate: (page: Page) => void
  isOpen?: boolean
  onClose?: () => void
}

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',      label: 'Dashboard',      icon: <IconChart /> },
  { id: 'finanzas',       label: 'Finanzas',       icon: <span style={{ fontSize: '1.2em' }}>💰</span> },
  { id: 'administracion', label: 'Administración',  icon: <IconGrid /> },
]

export default function Sidebar({ activePage, onNavigate, isOpen, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <span className="brand-name">Alsegui</span>
        <span className="brand-tier">Gestión de Alquileres</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <a
            key={item.id}
            href="#"
            id={`nav-${item.id}`}
            className={`nav-item${activePage === item.id ? ' active' : ''}`}
            onClick={e => { 
              e.preventDefault(); 
              onNavigate(item.id);
              if (onClose) onClose();
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-version">v1.0.0</div>
      </div>
    </aside>
  )
}
