import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon,
  title = 'No records found',
  description = 'Get started by creating your first record.',
  actionLabel,
  onAction
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border-color)',
        margin: '16px 0'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--soft-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-blue)',
          marginBottom: '16px'
        }}
      >
        {icon || <Inbox size={28} />}
      </div>
      <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '8px', color: 'var(--deep-blue)' }}>
        {title}
      </h3>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '20px' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
