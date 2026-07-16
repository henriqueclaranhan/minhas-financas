import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, CalendarClock, CreditCard, User, Settings, X, PieChart } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import './Layout.css';

export function Layout() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const { user } = useAuth();
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const location = useLocation();
  
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={22} />, label: 'Dashboard' },
    { to: '/transactions', icon: <Wallet size={22} />, label: 'Transações' },
    { to: '/planned', icon: <CalendarClock size={22} />, label: 'Planejamento' },
    { to: '/credit', icon: <CreditCard size={22} />, label: 'Faturas' },
  ];

  const isMainTab = navItems.some(item => item.to === location.pathname) || location.pathname === '/';

  return (
    <div className="layout-container">
      {/* Mobile Header */}
      {isMainTab && (
        <div className="mobile-header" style={{ display: 'none', padding: 'var(--spacing-md)', alignItems: 'center', justifyContent: 'space-between', background: 'var(--clr-background)' }}>
          <button onClick={() => setIsMobileDrawerOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--clr-primary)', display: 'flex', cursor: 'pointer' }}>
            <div style={{ background: 'var(--clr-surface-alt)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0 }}>
              <User size={20} />
            </div>
          </button>
          <div style={{ fontWeight: 600, color: 'var(--clr-primary)', fontSize: '1.1rem' }}>
            Minhas Finanças
          </div>
          <div style={{ width: 32 }} /> {/* Placeholder to center title */}
        </div>
      )}

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isMobileDrawerOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileDrawerOpen(false)} />
        <div className="mobile-drawer-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--clr-primary-glow)', color: 'var(--clr-primary)', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0 }}>
                <User size={24} />
              </div>
              <div style={{ fontWeight: 600, fontSize: '1.2rem', color: 'var(--clr-text-primary)' }}>{userName}</div>
            </div>
            <button onClick={() => setIsMobileDrawerOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--clr-text-secondary)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>
          
          <div style={{ flex: 1 }}></div>

          <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 'var(--spacing-md)' }}>
            <NavLink to="/settings" className="nav-item" onClick={() => setIsMobileDrawerOpen(false)}>
              <Settings size={22} /> Ajustes
            </NavLink>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0 var(--spacing-xl)', marginBottom: 'var(--spacing-xl)', gap: '24px' }}>
          
          {/* App Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--clr-primary)', fontWeight: 700, fontSize: '1.25rem' }}>
            <PieChart size={28} /> Minhas Finanças
          </div>

          {/* User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--clr-primary-glow)', color: 'var(--clr-primary)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0 }}>
              <User size={20} />
            </div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--clr-text-primary)', wordBreak: 'break-word', lineHeight: 1.2 }}>
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
        
        <div style={{ marginTop: 'auto', padding: 'var(--spacing-md) var(--spacing-md)' }}>
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
            {navItems.map((item) => (
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
