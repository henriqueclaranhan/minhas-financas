import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Wallet, CalendarClock, PieChart, CreditCard } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import './Layout.css';

export function Layout() {
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={22} />, label: 'Dashboard' },
    { to: '/transactions', icon: <Wallet size={22} />, label: 'Transações' },
    { to: '/planned', icon: <CalendarClock size={22} />, label: 'Planejamento' },
    { to: '/credit', icon: <CreditCard size={22} />, label: 'Faturas' },
  ];

  return (
    <div className="layout-container">
      {/* Mobile Header */}
      <div className="mobile-header" style={{ display: 'none', padding: 'var(--spacing-md)', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--clr-border)', background: 'var(--clr-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--clr-primary)' }}>
          <PieChart size={24} /> Minhas Finanças
        </div>
        <ThemeToggle />
      </div>

      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <PieChart size={28} />
          Minhas Finanças
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
        <div style={{ marginTop: 'auto', padding: 'var(--spacing-md) var(--spacing-xl)' }}>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
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
    </div>
  );
}
