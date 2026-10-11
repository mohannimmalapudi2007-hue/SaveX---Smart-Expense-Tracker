import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  PieChart,
  Wallet,
  Target,
  Repeat,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Users,
  Briefcase,
  GraduationCap
} from 'lucide-react';

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does SaveX ensure mathematical accuracy in my transactions?',
      a: 'SaveX uses an integer minor unit calculation engine on the backend. This eliminates classic binary floating-point discrepancies (like 0.1 + 0.2 != 0.3) and ensures every cent and paise is accounted for accurately.'
    },
    {
      q: 'Can I track accounts in different currencies?',
      a: 'Yes. SaveX allows you to set your primary preferred currency while tracking multiple distinct bank accounts, savings accounts, credit cards, and digital wallets.'
    },
    {
      q: 'Are transfers between my accounts counted as expenses?',
      a: 'Never. SaveX enforces strict financial accounting: a transfer debits one account and credits another without altering your net income or expense totals.'
    },
    {
      q: 'Can I import and export my transactions?',
      a: 'Yes, SaveX features a full CSV import tool with column mapping, duplicate detection, and formula-injection-protected CSV exports.'
    },
    {
      q: 'Is my financial data secure?',
      a: 'Yes. We enforce robust bcrypt password hashing, secure token authentication, strict cross-user data isolation, and rate-limiting.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ padding: '80px 0 60px 0', textAlign: 'center', background: 'linear-gradient(180deg, #FFFFFF 0%, var(--bg-main) 100%)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'var(--soft-blue)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--primary-blue)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              marginBottom: '24px'
            }}
          >
            <Sparkles size={15} /> Your Money. Your Goals. Your Future.
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              color: 'var(--deep-blue)',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '20px'
            }}
          >
            Take Control of Your Money, One Smart Decision at a Time.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '720px',
              margin: '0 auto 36px auto'
            }}
          >
            Track spending, plan your budget, grow your savings, and understand your financial habits with one simple, intelligent platform.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ boxShadow: 'var(--shadow-md)' }}>
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/features" className="btn btn-outline btn-lg">
              Explore Features
            </Link>
          </div>

          {/* Interactive Live Preview Mockup Card */}
          <div
            style={{
              marginTop: '56px',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              padding: '24px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F56' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27C93F' }} />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginLeft: '8px' }}>savex.app/dashboard</span>
              </div>
              <span className="badge badge-income">Demo Preview</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>AVAILABLE BALANCE</span>
                <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--deep-blue)', marginTop: '4px' }}>$12,450.00</p>
                <span style={{ fontSize: '11px', color: 'var(--success-green)' }}>Across 3 active accounts</span>
              </div>
              <div style={{ padding: '16px', background: 'var(--mint-green)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '11px', color: 'var(--success-green)', fontWeight: 600 }}>MONTHLY INCOME</span>
                <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--success-green)', marginTop: '4px' }}>$5,200.00</p>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Salary & freelance</span>
              </div>
              <div style={{ padding: '16px', background: 'var(--soft-peach)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '11px', color: '#c95116', fontWeight: 600 }}>MONTHLY EXPENSES</span>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#c95116', marginTop: '4px' }}>$2,840.50</p>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Under monthly budget</span>
              </div>
              <div style={{ padding: '16px', background: 'var(--soft-blue)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '11px', color: 'var(--primary-blue)', fontWeight: 600 }}>SAVINGS RATE</span>
                <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary-blue)', marginTop: '4px' }}>45.4%</p>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>+$2,359.50 Net cash flow</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Feature Cards */}
      <section style={{ padding: '80px 0', background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 50px auto' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)', marginBottom: '12px' }}>
              Built for Complete Financial Clarity
            </h2>
            <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
              Everything you need to track spending, build budgets, hit savings goals, and manage your money with confidence.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {[
              {
                icon: <Wallet size={24} />,
                title: 'Multi-Account Management',
                desc: 'Organise checking, savings, credit cards, digital wallets, and cash in one unified ledger with accurate net worth tracking.'
              },
              {
                icon: <PieChart size={24} />,
                title: 'Smart Budget Utilisation',
                desc: 'Set weekly, monthly, and category spending caps with dynamic threshold alerts at 50%, 75%, 90%, and 100%.'
              },
              {
                icon: <Target size={24} />,
                title: 'Goal Milestones',
                desc: 'Set savings goals for emergency funds, vacations, or equipment with dedicated contribution ledgers and visual progress rings.'
              },
              {
                icon: <Repeat size={24} />,
                title: 'Recurring Payments & Bills',
                desc: 'Never miss a due date. Track subscriptions and bills with idempotent 1-click execution and leap-year-safe scheduling.'
              },
              {
                icon: <Sparkles size={24} />,
                title: 'Explainable Financial Insights',
                desc: 'Get rule-based anomaly detection, category concentration warnings, and actionable advice grounded in your genuine transaction history.'
              },
              {
                icon: <ShieldCheck size={24} />,
                title: 'Enterprise Security & Privacy',
                desc: 'Bank-level password encryption, multi-user isolation, CSV formula-injection defense, and complete data export capabilities.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--soft-blue)',
                    color: 'var(--primary-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--deep-blue)' }}>{feature.title}</h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits for Different User Groups */}
      <section style={{ padding: '80px 0', background: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 50px auto' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)', marginBottom: '12px' }}>
              Designed for Every Stage of Life
            </h2>
            <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
              Simple enough for a student, powerful enough for a busy professional or household.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              {
                icon: <GraduationCap size={22} />,
                group: 'Students & Young Adults',
                benefit: 'Track allowances, student loans, food, and daily essentials with clean visual budgets and zero clutter.'
              },
              {
                icon: <Briefcase size={22} />,
                group: 'Professionals & Freelancers',
                benefit: 'Separate client income from living expenses, track invoices, and analyze monthly cash flow trends.'
              },
              {
                icon: <Users size={22} />,
                group: 'Families & Households',
                benefit: 'Manage multiple bank accounts, utility bills, school fees, and long-term emergency funds collaboratively.'
              },
              {
                icon: <TrendingUp size={22} />,
                group: 'Goal-Driven Savers',
                benefit: 'Stay motivated with visual milestone cards, automated savings rate analytics, and debt payoff tracking.'
              }
            ].map((item, idx) => (
              <div key={idx} className="card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--primary-blue)', marginBottom: '12px' }}>{item.icon}</div>
                <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--deep-blue)', marginBottom: '8px' }}>
                  {item.group}
                </h4>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {item.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section style={{ padding: '80px 0', background: '#FFFFFF' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)', marginBottom: '8px' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              Clear answers to common questions about SaveX.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: openFaq === idx ? 'var(--soft-blue)' : '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--deep-blue)'
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: openFaq === idx ? 'rotate(180deg)' : 'none',
                      transition: 'transform var(--transition-fast)'
                    }}
                  />
                </button>
                {openFaq === idx && (
                  <div style={{ padding: '16px 20px', background: '#FFFFFF', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border-color)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section style={{ padding: '64px 0', background: 'var(--deep-blue)', color: '#FFFFFF', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: 'var(--font-size-2xl)', marginBottom: '16px' }}>
            Start Building Your Financial Future Today
          </h2>
          <p style={{ color: '#DCE8F7', fontSize: 'var(--font-size-base)', marginBottom: '28px', lineHeight: 1.6 }}>
            Join SaveX to gain total clarity over your income, expenses, and savings goals.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ background: '#FFFFFF', color: 'var(--primary-blue)', fontWeight: 600 }}>
            Create Your Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
