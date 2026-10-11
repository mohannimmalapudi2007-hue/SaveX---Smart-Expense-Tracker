import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import TransactionModal from '../transactions/TransactionModal';

const AppLayout = ({ title = 'Dashboard' }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTransactionSuccess = () => {
    // Notify child components to refresh data
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Desktop Sidebar */}
      <div className="desktop-sidebar" style={{ display: 'block' }}>
        <Sidebar isMobile={false} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(36, 71, 107, 0.4)',
            zIndex: 1050
          }}
          onClick={() => setMobileNavOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Sidebar isMobile={true} onClose={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          title={title}
          onOpenQuickAdd={() => setQuickAddOpen(true)}
          onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
        />

        <main style={{ flex: 1, padding: '24px 28px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          <Outlet context={{ refreshTrigger, onRefresh: handleTransactionSuccess }} />
        </main>
      </div>

      {/* Global Quick-Add Transaction Modal */}
      <TransactionModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSuccess={handleTransactionSuccess}
      />

      <style>{`
        @media (max-width: 900px) {
          .desktop-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
