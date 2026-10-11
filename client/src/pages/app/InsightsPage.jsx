import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Sparkles,
  Send,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle,
  HelpCircle,
  Bot
} from 'lucide-react';

const InsightsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [insights, setInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  // AI Assistant Chat State
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hello ${user?.name || 'there'}! I am **SaveX Smart Assistant**. I analyze your accounts, budgets, and spending habits using your authentic financial records. What would you like to know today?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const fetchInsights = useCallback(async () => {
    setLoadingInsights(true);
    try {
      const res = await api.get('/ai/insights');
      setInsights(res.data.insights || []);
    } catch (err) {
      showToast('Error loading financial insights.', 'error');
    } finally {
      setLoadingInsights(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || chatLoading) return;

    const userMsg = { sender: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setChatLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: text.trim() });
      const assistantMsg = { sender: 'assistant', text: res.data.answer };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I encountered an issue analyzing that request. Please try again or rephrase your question.'
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const samplePrompts = [
    'Where did most of my money go this month?',
    'How much did I spend on food and dining?',
    'Compare this month with last month',
    'Which budgets are close to their limits?',
    'Summarise my recurring payments'
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }} className="insights-container">
      {/* Left Column: Explainable Financial Insights Engine */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--deep-blue)' }}>
            Financial Insights & Anomalies
          </h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Automated, explainable calculations based on your genuine transaction history
          </span>
        </div>

        {loadingInsights ? (
          <LoadingSpinner message="Scanning financial patterns..." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {insights.map((ins) => {
              let icon = <Info size={20} color="var(--primary-blue)" />;
              let border = 'var(--primary-blue)';
              if (ins.type === 'warning') {
                icon = <AlertTriangle size={20} color="#D97706" />;
                border = '#D97706';
              } else if (ins.type === 'error') {
                icon = <AlertTriangle size={20} color="var(--error-text)" />;
                border = 'var(--error-text)';
              } else if (ins.type === 'positive') {
                icon = <CheckCircle size={20} color="var(--success-green)" />;
                border = 'var(--success-green)';
              }

              return (
                <div
                  key={ins.id}
                  className="card"
                  style={{
                    padding: '16px 20px',
                    borderLeft: `4px solid ${border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {icon}
                    <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--deep-blue)' }}>
                      {ins.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', lineHeight: 1.5, marginTop: '2px' }}>
                    {ins.message}
                  </p>
                  <div
                    style={{
                      background: 'var(--bg-main)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      marginTop: '6px'
                    }}
                  >
                    <strong>Why this was generated:</strong> {ins.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: SaveX Smart Assistant Interactive Chat */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '620px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '14px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--pale-lavender)', color: '#6b46c1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--deep-blue)' }}>SaveX Smart Assistant</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified data grounded queries</span>
          </div>
        </div>

        {/* Chat Messages Log */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '6px' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.sender === 'user' ? 'var(--primary-blue)' : 'var(--bg-main)',
                color: m.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                lineHeight: 1.6,
                boxShadow: 'var(--shadow-sm)',
                whiteSpace: 'pre-wrap'
              }}
            >
              {m.text}
            </div>
          ))}

          {chatLoading && (
            <div style={{ alignSelf: 'flex-start', background: 'var(--bg-main)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Analyzing financial database...
            </div>
          )}
        </div>

        {/* Quick Sample Prompts */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '10px 0', borderTop: '1px solid var(--border-color)', marginTop: '10px' }}>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              style={{
                whiteSpace: 'nowrap',
                background: 'var(--soft-blue)',
                color: 'var(--primary-blue)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ask about spending, budgets, trends..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            style={{ fontSize: 'var(--font-size-xs)' }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleSendMessage()}
            disabled={chatLoading || !inputValue.trim()}
            style={{ padding: '8px 14px' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .insights-container { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default InsightsPage;
