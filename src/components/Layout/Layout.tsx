import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, CalendarClock, CreditCard, User, PieChart, TrendingUp, Tags } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useLocale } from '../../store/LocaleContext';
import { PullToRefresh } from '../shared/PullToRefresh';
import { AppSidebar, type SidebarNavItem } from './AppSidebar';
import './Layout.css';

export function Layout() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(
    () => window.localStorage.getItem('desktop-sidebar-collapsed') === 'true',
  );
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

  useEffect(() => {
    window.localStorage.setItem('desktop-sidebar-collapsed', String(isDesktopSidebarCollapsed));
  }, [isDesktopSidebarCollapsed]);
  
  const navItems: SidebarNavItem[] = [
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
      <PullToRefresh />
      {/* Mobile Header */}
      {isMainTab && (
        <div className="mobile-header hide-on-desktop">
          <button onClick={() => setIsMobileDrawerOpen(true)} className="mobile-header-btn">
            <div className="avatar-icon-small">
              <User size={20} />
            </div>
          </button>
          <div className="mobile-header-brand">
            <PieChart size={21} aria-hidden="true" />
            <div className="mobile-header-title">{t('app.name')}</div>
          </div>
          <div className="mobile-header-placeholder" /> {/* Placeholder to center title */}
        </div>
      )}

      <AppSidebar
        variant="mobile"
        navItems={navItems}
        userName={userName}
        userEmail={user?.email}
        appName={t('app.name')}
        settingsLabel={t('nav.settings')}
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        collapseLabel={t('nav.collapseSidebar')}
        expandLabel={t('nav.expandSidebar')}
        closeLabel={t('nav.closeMenu')}
      />

      <AppSidebar
        variant="desktop"
        navItems={navItems}
        userName={userName}
        userEmail={user?.email}
        appName={t('app.name')}
        settingsLabel={t('nav.settings')}
        isCollapsed={isDesktopSidebarCollapsed}
        onToggleCollapsed={() => setIsDesktopSidebarCollapsed(collapsed => !collapsed)}
        collapseLabel={t('nav.collapseSidebar')}
        expandLabel={t('nav.expandSidebar')}
        closeLabel={t('nav.closeMenu')}
      />

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
