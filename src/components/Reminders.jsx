import React, { useState } from 'react';
import { getTranslation } from '../services/translations';
import { db } from '../services/db';

export const ReminderIcon = ({ type, size = 20 }) => {
  switch (type) {
    case 'irrigation':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="irrigation-icon">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" style={{ display: 'none' }} />
          <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" fill="skyblue" stroke="deepskyblue" strokeWidth="1" />
        </svg>
      );
    case 'fertilizer':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="fertilizer-icon">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#d1e7dd" stroke="#198754" strokeWidth="1.5" />
          <path d="M9 9h6M9 13h6M9 17h4" />
        </svg>
      );
    case 'spraying':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spraying-icon">
          <path d="M12 3v18M3 12h18" stroke="#a21caf" strokeWidth="2" />
          <circle cx="12" cy="12" r="6" fill="#fae8ff" stroke="#a21caf" strokeWidth="1.5" />
        </svg>
      );
    case 'soil_retest':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="retest-icon">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case 'harvest':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="harvest-icon">
          <path d="M12 2v20M8 5l4-2 4 2M8 12l4-2 4 2" stroke="#d97706" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
  }
};

export default function Reminders({ lang, showToast }) {
  const allReminders = db.getReminders();
  const activeCrops = db.getCropSeasons().filter(c => c.status === 'active');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('irrigation');
  const [cropId, setCropId] = useState(activeCrops[0]?.id || '');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  const handleMarkDone = (id) => {
    db.updateReminder(id, { status: 'completed' });
    showToast(getTranslation(lang, 'successSave'));
  };

  const handleDeleteReminder = (id) => {
    if (window.confirm(getTranslation(lang, 'deleteConfirm'))) {
      db.deleteReminder(id);
      showToast(getTranslation(lang, 'successDelete'));
    }
  };

  const handleCreateReminder = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    db.addReminder({
      crop_season_id: cropId,
      type,
      title: title.trim(),
      date: dueDate,
      status: 'pending'
    });

    showToast(getTranslation(lang, 'successSave'));
    setIsModalOpen(false);
    setTitle('');
    setType('irrigation');
  };

  // Helper to calculate days remaining
  const getDaysRemainingText = (dateStr) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dateStr);
    due.setHours(0,0,0,0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: getTranslation(lang, 'overdue'), class: 'overdue-badge' };
    }
    if (diffDays === 0) {
      return { text: getTranslation(lang, 'today'), class: 'today-badge' };
    }
    return { 
      text: `${getTranslation(lang, 'dueIn')} ${diffDays} ${getTranslation(lang, 'days')}`, 
      class: 'upcoming-badge' 
    };
  };

  const pendingReminders = allReminders.filter(r => r.status === 'pending').sort((a, b) => new Date(a.date) - new Date(b.date));
  const completedReminders = allReminders.filter(r => r.status === 'completed').sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="reminders-view animate-fade-in">
      <div className="section-header">
        <h2>{getTranslation(lang, 'reminderTitle')}</h2>
        <button className="add-crop-inline-btn" onClick={() => setIsModalOpen(true)}>
          + {getTranslation(lang, 'addReminder')}
        </button>
      </div>

      {/* Active Reminders List */}
      <div className="reminders-section">
        <h3>{getTranslation(lang, 'activeReminders')} ({pendingReminders.length})</h3>
        {pendingReminders.length === 0 ? (
          <div className="empty-state card">
            <p>No pending agricultural tasks. Everything is clean!</p>
          </div>
        ) : (
          <div className="reminders-list">
            {pendingReminders.map(rem => {
              const countdown = getDaysRemainingText(rem.date);
              const linkedCrop = db.getCropSeasons().find(c => c.id === rem.crop_season_id);
              return (
                <div key={rem.id} className="reminder-item-card card">
                  <div className="reminder-left">
                    <button className="reminder-check-btn" onClick={() => handleMarkDone(rem.id)}>
                      <div className="checkbox-ring"></div>
                    </button>
                    <div className="reminder-icon-circle">
                      <ReminderIcon type={rem.type} />
                    </div>
                  </div>
                  
                  <div className="reminder-content">
                    <span className="reminder-task-title">{rem.title}</span>
                    <div className="reminder-meta-row">
                      {linkedCrop && (
                        <span className="reminder-crop-tag">
                          {getTranslation(lang, linkedCrop.crop_name)}
                        </span>
                      )}
                      <span className="reminder-date-tag">
                        {new Date(rem.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="reminder-right">
                    <span className={`countdown-badge ${countdown.class}`}>
                      {countdown.text}
                    </span>
                    <button className="delete-tx-btn" onClick={() => handleDeleteReminder(rem.id)}>
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Reminders List */}
      {completedReminders.length > 0 && (
        <div className="reminders-section completed-section">
          <h3>{getTranslation(lang, 'completedReminders')} ({completedReminders.length})</h3>
          <div className="reminders-list opacity-70">
            {completedReminders.map(rem => (
              <div key={rem.id} className="reminder-item-card card completed-bg">
                <div className="reminder-left">
                  <div className="completed-check-icon">
                    ✓
                  </div>
                  <div className="reminder-icon-circle greyed">
                    <ReminderIcon type={rem.type} />
                  </div>
                </div>
                
                <div className="reminder-content">
                  <span className="reminder-task-title line-through">{rem.title}</span>
                  <span className="completed-date-stamp">Completed successfully</span>
                </div>

                <div className="reminder-right">
                  <button className="delete-tx-btn" onClick={() => handleDeleteReminder(rem.id)}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Reminder Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale-up">
            <div className="modal-header">
              <h2>{getTranslation(lang, 'addReminder')}</h2>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreateReminder} className="farmer-form">
              {/* Category */}
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'reminderTypeLabel')}</label>
                <select 
                  className="select-input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="irrigation">{getTranslation(lang, 'irrigation')}</option>
                  <option value="fertilizer">{getTranslation(lang, 'fertilizer')}</option>
                  <option value="spraying">{getTranslation(lang, 'spraying')}</option>
                  <option value="harvest">{getTranslation(lang, 'harvest')}</option>
                  <option value="soil_retest">{getTranslation(lang, 'soil_retest')}</option>
                </select>
              </div>

              {/* Crop Link */}
              {activeCrops.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Link to Crop (Optional)</label>
                  <select 
                    className="select-input"
                    value={cropId}
                    onChange={(e) => setCropId(e.target.value)}
                  >
                    <option value="">-- General Reminder --</option>
                    {activeCrops.map(c => (
                      <option key={c.id} value={c.id}>
                        {getTranslation(lang, c.crop_name)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title Input */}
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'reminderTitleLabel')}</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g. Turn on water pump"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Due Date */}
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="date-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>

              {/* Submit */}
              <button type="submit" className="form-submit-btn">
                {getTranslation(lang, 'saveReminderBtn')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
