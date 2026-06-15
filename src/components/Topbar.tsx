import { IconSearch, IconBell, IconHelp } from '../icons/Icons'

interface TopbarProps {
  onMenuClick?: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="topbar">
      {onMenuClick && (
        <button className="icon-btn btn-menu-mobile" onClick={onMenuClick} title="Menu">
          <span style={{ fontSize: '20px' }}>☰</span>
        </button>
      )}
      <div className="search-bar">
        <IconSearch />
        <input id="search-input" type="text" placeholder="Search analytics..." />
      </div>

      <div className="topbar-actions">
        <button id="btn-bell" className="icon-btn" title="Notifications">
          <IconBell />
        </button>
        <button id="btn-help" className="icon-btn" title="Help">
          <IconHelp />
        </button>
        <div className="user-avatar" title="Profile">CG</div>
      </div>
    </header>
  )
}
