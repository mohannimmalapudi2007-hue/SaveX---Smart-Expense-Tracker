import React from 'react';

const StatCard = ({ title, value, subtitle, icon, trend, trendValue, badgeColor, color = 'var(--primary-blue)' }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {title}
        </span>
        {icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: badgeColor || 'var(--soft-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--deep-blue)' }}>
        {value}
      </div>

      {(subtitle || trendValue) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)' }}>
          {trendValue && (
            <span
              style={{
                fontWeight: 600,
                color: trend === 'up' ? 'var(--success-green)' : trend === 'down' ? 'var(--error-text)' : 'var(--text-secondary)'
              }}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
            </span>
          )}
          {subtitle && <span style={{ color: 'var(--text-muted)' }}>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
