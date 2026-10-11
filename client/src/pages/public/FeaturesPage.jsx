import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Receipt,
  PieChart,
  Target,
  Repeat,
  Sparkles,
  BarChart3,
  Calendar,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

const FeaturesPage = () => {
  const featureList = [
    {
      icon: <Receipt size={24} />,
      title: 'Double-Entry Inspired Transaction Engine',
      desc: 'Track income, expenses, account transfers, and refunds. Transfers strictly debit the source and credit the destination without inflating income or expenses.'
    },
    {
      icon: <Wallet size={24} />,
      title: 'Comprehensive Account Ledger',
      desc: 'Maintain independent balances across bank accounts, savings pots, credit cards, and cash wallets. Archive accounts safely without corrupting history.'
    },
    {
      icon: <PieChart size={24} />,
      title: 'Dynamic Budgeting & Threshold Alerts',
      desc: 'Set weekly, monthly, or yearly spending caps per category or overall. Receive automatic alerts at 50%, 75%, 90%, and 100% capacity.'
    },
    {
      icon: <Target size={24} />,
      title: 'Target Savings Goals',
      desc: 'Build emergency funds or save for specific milestones. Allocate funds virtually or record transfers with real-time progress calculations.'
    },
    {
      icon: <Repeat size={24} />,
      title: 'Recurring Schedules & Bill Reminders',
      desc: 'Automate subscription and bill management with leap-year and month-end aware recurrence logic and 1-click execution.'
    },
    {
      icon: <Sparkles size={24} />,
      title: 'SaveX Smart Assistant & Insights',
      desc: 'Natural language questions or automated rule-based analysis: understand where your money went, identify anomalies, and plan ahead.'
    },
    {
      icon: <FileSpreadsheet size={24} />,
      title: 'Safe CSV Import & Formula-Protected Export',
      desc: 'Migrate transactions from bank CSV statements with automatic duplicate detection and formula-injection-protected CSV downloads.'
    },
    {
      icon: <Calendar size={24} />,
      title: 'Interactive Financial Calendar',
      desc: 'View income, daily expenses, and upcoming bills in a unified calendar timeline to plan cash flow across the month.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <div className="container" style={{ padding: '60px 20px', flex: 1 }}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 48px auto' }}>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--deep-blue)', marginBottom: '16px' }}>
            Explore SaveX Features
          </h1>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
            Every tool is designed to provide complete control over personal and household finances.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '50px' }}>
          {featureList.map((f, idx) => (
            <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'var(--soft-blue)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--deep-blue)' }}>{f.title}</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/register" className="btn btn-primary btn-lg">
            Experience All Features in SaveX Free
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
