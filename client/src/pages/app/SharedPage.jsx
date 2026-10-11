import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Users, UserPlus, Shield, Plus, Lock } from 'lucide-react';
import Modal from '../../components/common/Modal';

const SharedPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  const [members, setMembers] = useState([
    {
      id: '1',
      name: user?.name || 'You',
      email: user?.email || 'owner@savex.dev',
      role: 'Owner',
      status: 'Active'
    }
  ]);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setMembers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail.trim(),
        role: inviteRole === 'admin' ? 'Co-Manager' : 'Viewer',
        status: 'Invited'
      }
    ]);

    showToast(`Invitation sent to ${inviteEmail}.`, 'success');
    setInviteEmail('');
    setInviteModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)' }}>
            Shared & Family Finances
          </h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Collaborate on household budgets and shared goals while keeping personal accounts isolated
          </span>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setInviteModalOpen(true)}>
          <UserPlus size={16} /> Invite Household Member
        </button>
      </div>

      {/* Household Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Users size={20} color="var(--primary-blue)" />
            <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)' }}>Household Members</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {members.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)'
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--deep-blue)' }}>
                    {m.name}
                  </span>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.email}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-transfer">{m.role}</span>
                  <span className="badge badge-income">{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={20} color="var(--success-green)" />
            <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)' }}>Privacy & Permissions</h3>
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            In SaveX, private personal accounts remain strictly hidden from household members unless explicitly tagged as a shared account. Each member maintains their own encrypted credentials and authentication tokens.
          </p>

          <div style={{ marginTop: 'auto', padding: '12px', background: 'var(--soft-blue)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--deep-blue)' }}>
            <strong>Tip:</strong> You can assign household tags to transactions so both members can track grocery and rent splits easily.
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite Household Member">
        <form onSubmit={handleInvite}>
          <div className="form-group">
            <label className="form-label">Member Email *</label>
            <input
              type="email"
              required
              placeholder="spouse@example.com, roommate@example.com"
              className="form-input"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Permission Role</label>
            <select className="form-select" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              <option value="member">Viewer (Can view shared budgets and reports)</option>
              <option value="admin">Co-Manager (Can record shared expenses and contribute to goals)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SharedPage;
