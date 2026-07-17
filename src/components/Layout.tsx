import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, CalendarClock, CreditCard, User, Settings, X, PieChart, TrendingUp } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import './Layout.css';

export function Layout() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const { user } = useAuth();
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const location = useLocation();
  
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={22} />, label: 'Dashboard', isMain: true },
    { to: '/transactions', icon: <Wallet size={22} />, label: 'Transações', isMain: true },
    { to: '/planned', icon: <CalendarClock size={22} />, label: 'Planejamento', isMain: true },
    { to: '/credit', icon: <CreditCard size={22} />, label: 'Faturas', isMain: true },
    { to: '/forecast', icon: <TrendingUp size={22} />, label: 'Previsões', isMain: false },
  ];

  const mainNavItems = navItems.filter(i => i.isMain);
  const isMainTab = mainNavItems.some(item => item.to === location.pathname) || location.pathname === '/';

  return (
    <div className="layout-container">
      {/* Mobile Header */}
      {isMainTab && (
        <div className="mobile-header hide-on-desktop">
          <button onClick={() => setIsMobileDrawerOpen(true)} className="mobile-header-btn">
            <div className="avatar-icon-small">
              <User size={20} />
            </div>
          </button>
          <div className="mobile-header-title">
            Minhas Finanças
          </div>
          <div className="mobile-header-placeholder" /> {/* Placeholder to center title */}
        </div>
      )}

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isMobileDrawerOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileDrawerOpen(false)} />
        <div className="mobile-drawer-content">
          <div className="drawer-header">
            <div className="flex items-center gap-sm">
              <div className="avatar-icon-large">
                <User size={24} />
              </div>
              <div className="drawer-user-name">{userName}</div>
            </div>
            <button onClick={() => setIsMobileDrawerOpen(false)} className="drawer-close-btn">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1">
            {/* Mobile-only secondary nav links in drawer */}
            <div className="hide-on-desktop drawer-nav-group">
              {navItems.filter(i => !i.isMain).map(item => (
                <NavLink 
                  key={item.to} 
                  to={item.to} 
                  className="nav-item" 
                  onClick={() => setIsMobileDrawerOpen(false)}
                >
                  {item.icon} {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="drawer-footer">
            <NavLink to="/settings" className="nav-item" onClick={() => setIsMobileDrawerOpen(false)}>
              <Settings size={22} /> Ajustes
            </NavLink>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header flex-col gap-lg items-start">
          
          {/* App Logo */}
          <div className="sidebar-logo">
            <PieChart size={28} /> Minhas Finanças
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-sm">
            <div className="avatar-icon-sidebar">
              <User size={20} />
            </div>
            <div className="sidebar-user-name">
              {userName}
            </div>
          </div>
        </div>
        
        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={22} /> Ajustes
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      {isMainTab && (
        <nav className="bottom-nav">
          <div className="bottom-nav-inner">
            {mainNavItems.map((item) => (
              <NavLink 
                key={item.to} 
                to={item.to} 
                className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
