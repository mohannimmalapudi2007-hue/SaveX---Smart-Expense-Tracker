import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label, currency = 'USD' }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-md)',
          fontSize: 'var(--font-size-xs)'
        }}
      >
        <p style={{ fontWeight: 600, color: 'var(--deep-blue)', marginBottom: '4px' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color, margin: '2px 0' }}>
            {entry.name}: {formatCurrency(entry.value, currency)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CashFlowChart = ({ data = [], currency = 'USD' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
        No cash flow data available for this timeframe.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '280px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F3F7" vertical={false} />
          <XAxis dataKey="month" stroke="#9AA7B8" fontSize={12} tickLine={false} />
          <YAxis stroke="#9AA7B8" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val}`} />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar dataKey="income" name="Income" fill="#27845B" radius={[4, 4, 0, 0]} maxBarSize={36} />
          <Bar dataKey="expenses" name="Expenses" fill="#3978D4" radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowChart;
