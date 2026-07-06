import React, { useState, useEffect } from 'react';
import { getTranslation } from '../services/translations';
import { db } from '../services/db';

const CATEGORIES_EXPENSE = ['seed', 'fertilizer', 'labor', 'pesticides', 'fuel', 'other'];
const CATEGORIES_INCOME = ['sale', 'other'];

export default function AddTransaction({ defaultCropId, lang, onBack, showToast }) {
  const activeCrops = db.getCropSeasons().filter(c => c.status === 'active');

  const [cropId, setCropId] = useState(defaultCropId || (activeCrops[0]?.id || ''));
  const [type, setType] = useState('expense'); // 'expense' or 'income'
  const [category, setCategory] = useState('seed');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  // Update category when type changes
  useEffect(() => {
    if (type === 'income') {
      setCategory('sale');
    } else {
      setCategory('fertilizer'); // default expense
    }
  }, [type]);

  const handleKeypadPress = (val) => {
    if (val === 'C') {
      setAmountStr('');
    } else if (val === '⌫') {
      setAmountStr(prev => prev.slice(0, -1));
    } else {
      // Limit to 7 digits
      if (amountStr.length < 7) {
        setAmountStr(prev => prev + val);
      }
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const amountVal = parseFloat(amountStr);
    if (!cropId) {
      alert('Please create an active crop season first.');
      return;
    }
    if (!amountVal || amountVal <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    db.addTransaction({
      crop_season_id: cropId,
      type,
      category,
      amount: amountVal,
      date,
      note: note.trim(),
      input_method: 'tap'
    });

    showToast(getTranslation(lang, 'successSave'));
    onBack();
  };

  const categories = type === 'expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME;

  return (
    <div className="add-tx-view animate-fade-in">
      <div className="form-header">
        <button className="icon-back-btn" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>{getTranslation(lang, 'backBtn')}</span>
        </button>
        <h1>{getTranslation(lang, 'txFormTitle')}</h1>
      </div>

      {activeCrops.length === 0 ? (
        <div className="empty-state card">
          <p>You must add an active Crop Season before logging transactions.</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="farmer-form">
          {/* Crop Selector Dropdown */}
          <div className="form-group">
            <label className="form-label">{getTranslation(lang, 'cropNameLabel')}</label>
            <select
              className="select-input"
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
            >
              {activeCrops.map(c => (
                <option key={c.id} value={c.id}>
                  {getTranslation(lang, c.crop_name)} ({c.land_size} {getTranslation(lang, 'acres')})
                </option>
              ))}
            </select>
          </div>

          {/* Income vs Expense Toggle */}
          <div className="tx-type-toggle">
            <button
              type="button"
              className={`toggle-btn expense-btn ${type === 'expense' ? 'selected' : ''}`}
              onClick={() => setType('expense')}
            >
              {getTranslation(lang, 'expenseBtn')}
            </button>
            <button
              type="button"
              className={`toggle-btn income-btn ${type === 'income' ? 'selected' : ''}`}
              onClick={() => setType('income')}
            >
              {getTranslation(lang, 'incomeBtn')}
            </button>
          </div>

          {/* Numeric Display */}
          <div className="amount-display-container">
            <span className="currency-prefix">{getTranslation(lang, 'rupeeSymbol')}</span>
            <div className="amount-value-display">
              {amountStr || <span className="placeholder">0</span>}
            </div>
          </div>

          {/* Virtual Keypad */}
          <div className="keypad-grid">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(key => (
              <button
                key={key}
                type="button"
                className={`keypad-btn ${key === 'C' ? 'clear-btn' : key === '⌫' ? 'backspace-btn' : ''}`}
                onClick={() => handleKeypadPress(key)}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Category Selector Grid */}
          <div className="form-group">
            <label className="form-label">{getTranslation(lang, 'categoryLabel')}</label>
            <div className="category-select-grid">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`category-select-tile ${category === cat ? 'selected' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  <span className="tile-label">{getTranslation(lang, cat)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div className="form-group">
            <label className="form-label">{getTranslation(lang, 'startDateLabel')}</label>
            <input
              type="date"
              className="date-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Note Input */}
          <div className="form-group">
            <label className="form-label">{getTranslation(lang, 'noteLabel')}</label>
            <input
              type="text"
              className="text-input"
              placeholder="e.g. Urea bags from cooperative"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Save Button */}
          <button type="submit" className="form-submit-btn">
            {getTranslation(lang, 'saveTxBtn')}
          </button>
        </form>
      )}
    </div>
  );
}
