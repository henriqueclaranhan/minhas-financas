import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, CalendarClock, CreditCard, User, Settings, X, PieChart, TrendingUp, Tags } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useLocale } from '../../store/LocaleContext';
import './Layout.css';

export function Layout() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);
  const { user } = useAuth();
  const { t } = useLocale();
  const userName = user?.displayName || user?.email?.split('@')[0] || t('app.name');
  const location = useLocation();

  useEffect(() => {
    const isMobile = typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 768px)').matches
      : window.innerWidth <= 768;
    if (!isMobile) return;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
  }, [location.pathname]);
  
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={22} />, label: t('nav.dashboard'), isMain: true },
    { to: '/transactions', icon: <Wallet size={22} />, label: t('nav.transactions'), isMain: true },
    { to: '/planned', icon: <CalendarClock size={22} />, label: t('nav.planning'), isMain: true },
    { to: '/credit', icon: <CreditCard size={22} />, label: t('nav.invoices'), isMain: true },
    { to: '/forecast', icon: <TrendingUp size={22} />, label: t('nav.forecast'), isMain: false },
    { to: '/categories', icon: <Tags size={22} />, label: t('nav.categories'), isMain: false },
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
            {t('app.name')}
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
              <Settings size={22} /> {t('nav.settings')}
            </NavLink>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header flex-col gap-lg items-start">
          
          {/* App Logo */}
          <div className="sidebar-logo">
            <PieChart size={28} /> {t('app.name')}
          </div>
        </div>

        {/* User Profile Card */}
        <div className="sidebar-user-card">
          <div className="avatar-wrapper">
            <User size={20} className="avatar-icon-svg" />
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name" title={userName}>{userName}</div>
            <div className="sidebar-user-email" title={user?.email || ''}>{user?.email || 'Bem-vindo(a)'}</div>
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
            <Settings size={22} /> {t('nav.settings')}
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" ref={mainContentRef}>
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
