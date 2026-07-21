import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, PieChart, Settings, User, X } from 'lucide-react';

export interface SidebarNavItem {
  to: string;
  icon: ReactNode;
  label: string;
  isMain: boolean;
}

interface AppSidebarProps {
  variant: 'desktop' | 'mobile';
  navItems: SidebarNavItem[];
  userName: string;
  userEmail?: string | null;
  appName: string;
  settingsLabel: string;
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggleCollapsed?: () => void;
  collapseLabel: string;
  expandLabel: string;
  closeLabel: string;
}

interface NavigationLinksProps {
  items: SidebarNavItem[];
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

function NavigationLinks({ items, isCollapsed = false, onNavigate }: NavigationLinksProps) {
  return items.map(item => (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      title={isCollapsed ? item.label : undefined}
      onClick={onNavigate}
    >
      {item.icon}
      <span className="nav-label">{item.label}</span>
    </NavLink>
  ));
}

export function AppSidebar(props: AppSidebarProps) {
  const {
    variant,
    navItems,
    userName,
    userEmail,
    appName,
    settingsLabel,
    isOpen = false,
    isCollapsed = false,
    onClose,
    onToggleCollapsed,
    collapseLabel,
    expandLabel,
    closeLabel,
  } = props;

  if (variant === 'mobile') {
    return (
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-overlay" onClick={onClose} />
        <div className="mobile-drawer-content">
          <div className="drawer-header">
            <div className="flex items-center gap-sm">
              <div className="avatar-icon-large"><User size={24} /></div>
              <div className="drawer-user-name" title={userName}>{userName}</div>
            </div>
            <button onClick={onClose} className="drawer-close-btn" aria-label={closeLabel}>
              <X size={24} />
            </button>
          </div>

          <div className="flex-1">
            <div className="drawer-nav-group">
              <NavigationLinks items={navItems.filter(item => !item.isMain)} onNavigate={onClose} />
            </div>
          </div>

          <div className="drawer-footer">
            <NavLink to="/settings" className="nav-item" onClick={onClose}>
              <Settings size={22} /> <span className="nav-label">{settingsLabel}</span>
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  const toggleLabel = isCollapsed ? expandLabel : collapseLabel;
  return (
    <aside className={`sidebar${isCollapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand-lockup">
          <div className="sidebar-logo">
            <span className="sidebar-logo-mark"><PieChart size={28} /></span>
            <span className="sidebar-logo-label">{appName}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-user-card" title={isCollapsed ? userName : undefined}>
        <div className="avatar-wrapper"><User size={20} className="avatar-icon-svg" /></div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name" title={userName}>{userName}</div>
          <div className="sidebar-user-email" title={userEmail || ''}>{userEmail || ''}</div>
        </div>
      </div>

      <nav className="nav-links">
        <NavigationLinks items={navItems} isCollapsed={isCollapsed} />
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? settingsLabel : undefined}>
          <Settings size={22} /> <span className="nav-label">{settingsLabel}</span>
        </NavLink>
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapsed}
          aria-label={toggleLabel}
          title={toggleLabel}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          <span className="nav-label">{toggleLabel}</span>
        </button>
      </div>
    </aside>
  );
}
