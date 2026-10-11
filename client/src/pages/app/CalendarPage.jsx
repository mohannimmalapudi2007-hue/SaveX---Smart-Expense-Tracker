import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CalendarPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const start = new Date(year, month, 1).toISOString();
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

      const [txRes, recRes] = await Promise.all([
        api.get(`/transactions?startDate=${start}&endDate=${end}&limit=100`),
        api.get('/recurring')
      ]);

      const txEvents = (txRes.data.transactions || []).map((t) => ({
        id: t._id,
        date: new Date(t.date).toISOString().split('T')[0],
        title: t.description,
        amount: t.amount,
        type: t.type
      }));

      // Map upcoming recurring events in this month
      const recEvents = (recRes.data.recurringTransactions || []).map((r) => ({
        id: `rec-${r._id}`,
        date: new Date(r.nextDueDate).toISOString().split('T')[0],
        title: `Due: ${r.title}`,
        amount: r.amount,
        type: r.type === 'income' ? 'income' : 'expense',
        isScheduled: true
      }));

      setEvents([...txEvents, ...recEvents]);
    } catch (err) {
      showToast('Error loading calendar data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentDate, showToast]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar Grid Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    daysArray.push(d);
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const currency = user?.preferredCurrency || 'USD';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Calendar Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--deep-blue)' }}>
            Financial Calendar
          </h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Scheduled bills, recurring income, and daily transaction activities
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-outline btn-sm" onClick={jumpToToday}>
            Today
          </button>
          <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <button onClick={prevMonth} style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--deep-blue)', padding: '0 12px' }}>
              {monthName}
            </span>
            <button onClick={nextMonth} style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading financial calendar..." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Days of Week Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', textAlign: 'center', padding: '12px 0', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border-color)' }}>
            {daysArray.map((day, idx) => {
              if (day === null) {
                return (
                  <div key={`empty-${idx}`} style={{ minHeight: '110px', background: '#FAFAFA' }} />
                );
              }

              const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events.filter((e) => e.date === dayString);

              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={`day-${day}`}
                  style={{
                    minHeight: '110px',
                    background: '#FFFFFF',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: isToday ? 700 : 500,
                        color: isToday ? '#FFFFFF' : 'var(--text-primary)',
                        background: isToday ? 'var(--primary-blue)' : 'transparent',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {day}
                    </span>
                  </div>

                  {/* Day Events Pills */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', maxHeight: '78px' }}>
                    {dayEvents.map((ev, evIdx) => (
                      <div
                        key={evIdx}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 500,
                          background: ev.type === 'income' ? 'var(--mint-green)' : 'var(--soft-peach)',
                          color: ev.type === 'income' ? 'var(--success-green)' : '#c95116',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={`${ev.title}: ${formatCurrency(ev.amount, currency)}`}
                      >
                        {ev.title} ({formatCurrency(ev.amount, currency)})
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
