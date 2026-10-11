import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PiggyBank,
  Tags,
  Target,
  Repeat,
  BellRing,
  Sparkles,
  BarChart3,
  Calendar,
  Users,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/transactions', label: 'Transactions', icon: Receipt },
  { path: '/app/accounts', label: 'Accounts', icon: Wallet },
  { path: '/app/budgets', label: 'Budgets', icon: PiggyBank },
  { path: '/app/categories', label: 'Categories', icon: Tags },
  { path: '/app/goals', label: 'Savings Goals', icon: Target },
  { path: '/app/recurring', label: 'Recurring Payments', icon: Repeat },
  { path: '/app/bills', label: 'Bills & Reminders', icon: BellRing },
  { path: '/app/insights', label: 'Financial Insights', icon: Sparkles },
  { path: '/app/reports', label: 'Reports', icon: BarChart3 },
  { path: '/app/calendar', label: 'Financial Calendar', icon: Calendar },
  { path: '/app/shared', label: 'Shared Finances', icon: Users },
  { path: '/app/import-export', label: 'Import & Export', icon: FileSpreadsheet },
  { path: '/app/settings', label: 'Settings', icon: Settings },
  { path: '/app/help', label: 'Help & Support', icon: HelpCircle }
];

const Sidebar = ({ isMobile, onClose }) => {
  const { logout, user } = useAuth();

  return (
    <aside
      style={{
        width: '260px',
        background: '#FFFFFF',
        borderRight: '1px solid var(--border-color)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: isMobile ? 1100 : 90
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <img src="/logo.svg" alt="SaveX" width="32" height="32" />
        <div>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--deep-blue)', lineHeight: 1 }}>
            SaveX
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Smart Finance
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--soft-blue)' : 'transparent',
                transition: 'all var(--transition-fast)'
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Footer / Logout */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-main)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--primary-blue)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: 'var(--font-size-sm)',
              flexShrink: 0
            }}
          >
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--deep-blue)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {user?.preferredCurrency || 'USD'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Log out"
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
