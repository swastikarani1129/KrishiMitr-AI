import React from 'react';
import { getTranslation } from '../services/translations';
import { db } from '../services/db';
import { CropIcon } from './Dashboard';

// SVG Icons for categories
const CategoryIcon = ({ category, size = 20 }) => {
  switch (category) {
    case 'seed':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" />
        </svg>
      );
    case 'fertilizer':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2v20M18 2v20M6 12h12M6 7h12M6 17h12" />
        </svg>
      );
    case 'labor':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'pesticides':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" />
          <path d="M12 11v6M9 14h6" />
        </svg>
      );
    case 'fuel':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 22h18M5 22V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v18" />
          <circle cx="12" cy="9" r="2" />
        </svg>
      );
    case 'sale':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
};

export default function CropDetail({ cropId, lang, onBack, onNavigate, showToast }) {
  const crop = db.getCropSeasons().find(c => c.id === cropId);
  
  if (!crop) {
    return (
      <div className="crop-detail-view card">
        <p>Crop Season not found.</p>
        <button onClick={onBack}>{getTranslation(lang, 'backBtn')}</button>
      </div>
    );
  }

  const transactions = db.getTransactions(cropId).sort((a, b) => new Date(b.date) - new Date(a.date));
  const stats = db.getCropStats(cropId);

  // Toggle status between active and harvested
  const handleToggleStatus = () => {
    const nextStatus = crop.status === 'active' ? 'harvested' : 'active';
    const updatedFields = {
      status: nextStatus,
      end_date: nextStatus === 'harvested' ? new Date().toISOString().split('T')[0] : '',
    };
    db.updateCropSeason(cropId, updatedFields);
    showToast(getTranslation(lang, 'successSave'));
  };

  const handleDeleteCrop = () => {
    if (window.confirm(getTranslation(lang, 'deleteConfirm'))) {
      db.deleteCropSeason(cropId);
      showToast(getTranslation(lang, 'successDelete'));
      onBack();
    }
  };

  const handleDeleteTx = (txId) => {
    if (window.confirm(getTranslation(lang, 'deleteConfirm'))) {
      db.deleteTransaction(txId);
      showToast(getTranslation(lang, 'successDelete'));
    }
  };

  // Cost vs Revenue balance visual bar
  const totalFinancial = stats.income + stats.expense;
  const incomePercent = totalFinancial > 0 ? (stats.income / totalFinancial) * 100 : 0;
  const expensePercent = totalFinancial > 0 ? (stats.expense / totalFinancial) * 100 : 100;

  return (
    <div className="crop-detail-view animate-fade-in">
      {/* Header Navigation */}
      <div className="detail-header-nav">
        <button className="icon-back-btn" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>{getTranslation(lang, 'backBtn')}</span>
        </button>
        <button className="delete-crop-btn" onClick={handleDeleteCrop}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>

      {/* Main Info Block */}
      <div className="crop-detail-hero">
        <div className="crop-avatar-large">
          <CropIcon name={crop.crop_name} size={48} />
        </div>
        <div className="crop-hero-info">
          <h1>{getTranslation(lang, crop.crop_name)}</h1>
          <div className="crop-meta-row">
            <span className="badge-large">{crop.land_size} {getTranslation(lang, 'acres')}</span>
            <span className={`status-badge-large ${crop.status}`}>
              {crop.status === 'active' ? getTranslation(lang, 'active') : getTranslation(lang, 'harvested')}
            </span>
          </div>
          <div className="crop-dates">
            Sown: {new Date(crop.start_date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            {crop.end_date && `  •  Harvested: ${new Date(crop.end_date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          </div>
        </div>
      </div>

      {/* Profit Ledger Summary */}
      <div className={`card profit-summary-card ${stats.profit >= 0 ? 'profit-border' : 'loss-border'}`}>
        <div className="summary-profit-text">
          <div className="label">{stats.profit >= 0 ? getTranslation(lang, 'netProfit') : getTranslation(lang, 'netLoss')}</div>
          <div className={`value ${stats.profit >= 0 ? 'text-green' : 'text-red'}`}>
            {getTranslation(lang, 'rupeeSymbol')}{stats.profit.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Visual Balance Bar */}
        <div className="balance-bar-container">
          <div className="balance-bar">
            <div className="bar-expense" style={{ width: `${expensePercent}%` }}></div>
            <div className="bar-income" style={{ width: `${incomePercent}%` }}></div>
          </div>
          <div className="balance-labels">
            <span className="text-red">Cost: {getTranslation(lang, 'rupeeSymbol')}{stats.expense.toLocaleString('en-IN')}</span>
            <span className="text-green">Revenue: {getTranslation(lang, 'rupeeSymbol')}{stats.income.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Action Toggles */}
      <div className="detail-action-buttons">
        <button 
          className={`status-toggle-btn ${crop.status === 'active' ? 'harvest-btn' : 'reopen-btn'}`}
          onClick={handleToggleStatus}
        >
          {crop.status === 'active' ? getTranslation(lang, 'markAsHarvested') : getTranslation(lang, 'markAsActive')}
        </button>

        {crop.status === 'active' && (
          <button 
            className="add-tx-btn-primary" 
            onClick={() => onNavigate('add-tx', { defaultCropId: cropId })}
          >
            + {getTranslation(lang, 'addTransaction')}
          </button>
        )}
      </div>

      {/* Ledger History */}
      <div className="ledger-section">
        <h2>{getTranslation(lang, 'historyTitle')} ({transactions.length})</h2>

        {transactions.length === 0 ? (
          <div className="empty-ledger">
            <p>{getTranslation(lang, 'noTransactions')}</p>
          </div>
        ) : (
          <div className="ledger-list">
            {transactions.map(tx => (
              <div key={tx.id} className={`ledger-item ${tx.type}-item`}>
                <div className={`category-circle ${tx.type}-circle`}>
                  <CategoryIcon category={tx.category} />
                </div>
                <div className="ledger-info">
                  <div className="ledger-header-row">
                    <span className="ledger-category">
                      {getTranslation(lang, tx.category)}
                    </span>
                    <span className="ledger-date">
                      {new Date(tx.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="ledger-note-row">
                    <span className="ledger-note">{tx.note || getTranslation(lang, tx.category)}</span>
                    <span className={`ledger-input-badge ${tx.input_method}`}>
                      {tx.input_method === 'voice' ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                      )}
                      {tx.input_method}
                    </span>
                  </div>
                </div>
                <div className="ledger-right">
                  <span className={`ledger-amount ${tx.type === 'income' ? 'text-green' : 'text-red'}`}>
                    {tx.type === 'income' ? '+' : '-'}{getTranslation(lang, 'rupeeSymbol')}{tx.amount.toLocaleString('en-IN')}
                  </span>
                  <button className="delete-tx-btn" onClick={() => handleDeleteTx(tx.id)}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
