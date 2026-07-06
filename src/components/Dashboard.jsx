import React from 'react';
import { getTranslation } from '../services/translations';
import { db } from '../services/db';

export const CropIcon = ({ name, size = 32 }) => {
  switch (name) {
    case 'Wheat':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="crop-svg wheat-svg">
          <path d="M12 2v20M8 5l4-2 4 2M8 9l4-2 4 2M8 13l4-2 4 2M8 17l4-2 4 2" />
        </svg>
      );
    case 'Rice':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="crop-svg rice-svg">
          <path d="M12 22s-4-6-4-10 4-8 4-8 4 4 4 8-4 10-4 10z" />
          <path d="M8 12c-2-1-3-3-3-5" />
          <path d="M16 12c2-1 3-3 3-5" />
        </svg>
      );
    case 'Sugarcane':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="crop-svg sugarcane-svg">
          <path d="M8 22V2M16 22V2M8 6h8M8 12h8M8 18h8" />
          <path d="M8 9c-3 0-5-2-5-4M16 15c3 0 5-2 5-4" />
        </svg>
      );
    case 'Mustard':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="crop-svg mustard-svg">
          <circle cx="12" cy="12" r="3" fill="#FFD700" stroke="#B8860B" strokeWidth="1" />
          <circle cx="8" cy="8" r="2" fill="#FFD700" stroke="#B8860B" strokeWidth="1" />
          <circle cx="16" cy="8" r="2" fill="#FFD700" stroke="#B8860B" strokeWidth="1" />
          <circle cx="8" cy="16" r="2" fill="#FFD700" stroke="#B8860B" strokeWidth="1" />
          <circle cx="16" cy="16" r="2" fill="#FFD700" stroke="#B8860B" strokeWidth="1" />
          <path d="M12 15v7M12 2v7" />
        </svg>
      );
    case 'Potato':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="crop-svg potato-svg">
          <path d="M12 3c-4.4 0-8 3.6-8 8s2.5 8 6 8.8c.7.2 1.3-.3 1.3-1v-2.3c0-.6.4-1.1 1-1.1h2.3c.7 0 1.2-.6 1-1.3C18.8 8.5 16.4 6 13 6V3.5c0-.3-.2-.5-.5-.5h-.5z" />
          <ellipse cx="7.5" cy="10.5" rx="1" ry="1" fill="currentColor" />
          <ellipse cx="14.5" cy="13.5" rx="1" ry="1" fill="currentColor" />
          <ellipse cx="11.5" cy="8.5" rx="1" ry="1" fill="currentColor" />
        </svg>
      );
    case 'Vegetables':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="crop-svg vegetables-svg">
          <path d="M12 2a5 5 0 0 0-5 5v1a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
          <path d="M9 12c-2 2-3 5-3 8h12c0-3-1-6-3-8" />
          <path d="M12 2v2" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="crop-svg default-crop-svg">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      );
  }
};

export default function Dashboard({ lang, onViewCrop, onNavigate }) {
  const [weather, setWeather] = React.useState('sunny'); // Simulated weather state
  const [location, setLocation] = React.useState('Karnal, Haryana'); // Geolocation state

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Request reverse-geocoding from OpenStreetMap's Nominatim (CORS-friendly, free)
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12`, {
            headers: {
              'Accept-Language': lang === 'hi' ? 'hi' : 'en'
            }
          })
            .then(res => res.json())
            .then(data => {
              if (data && data.address) {
                const address = data.address;
                const city = address.city || address.town || address.village || address.suburb || address.county || 'Local Area';
                const state = address.state || '';
                setLocation(state ? `${city}, ${state}` : city);
              } else {
                setLocation(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
              }
            })
            .catch(() => {
              // Fallback to coordinates
              setLocation(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
            });
        },
        (error) => {
          console.warn("Geolocation permission denied or error:", error);
          // Keep default 'Karnal, Haryana'
        }
      );
    }
  }, [lang]);

  const crops = db.getCropSeasons();
  const reminders = db.getReminders();
  const soilTests = db.getSoilTests();
  const diseases = db.getAllDiseaseHistory();

  // Financial Stats
  let totalIncome = 0;
  let totalExpenses = 0;
  crops.forEach(crop => {
    const stats = db.getCropStats(crop.id);
    totalIncome += stats.income;
    totalExpenses += stats.expense;
  });
  const netProfit = totalIncome - totalExpenses;

  // Active vs Harvested
  const activeCrops = crops.filter(c => c.status === 'active');
  const harvestedCrops = crops.filter(c => c.status === 'harvested');

  // Reminders Filter
  const pendingReminders = reminders.filter(r => r.status === 'pending');
  const criticalRemindersCount = pendingReminders.filter(r => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(r.date);
    due.setHours(0,0,0,0);
    return due <= today; // Overdue or today
  }).length;

  // Soil health
  const activeSoilReport = soilTests[0] || null;

  // Recent diseases (last 15 days)
  const activeDiseaseAlerts = diseases.filter(d => {
    const diff = (new Date() - new Date(d.created_at)) / (1000 * 60 * 60 * 24);
    return diff <= 15;
  });

  // Calculate crop profits for comparison charts
  const cropProfits = crops.map(crop => {
    const stats = db.getCropStats(crop.id);
    return {
      id: crop.id,
      name: crop.crop_name,
      profit: stats.profit
    };
  });

  // Find max profit for bar scaling
  const maxProfit = Math.max(...cropProfits.map(c => Math.abs(c.profit)), 1000);

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Weather Update Card */}
      <div className="weather-widget-card" onClick={() => setWeather(prev => prev === 'sunny' ? 'rainy' : 'sunny')} title="Tap to Toggle weather simulator" style={{ cursor: 'pointer' }}>
        <div className="weather-left">
          <div className="weather-loc">📍 {location} (Tap to Switch)</div>
          <div className="weather-temp-row">
            <span className="weather-temp">{weather === 'sunny' ? '32°C' : '24°C'}</span>
            <span className="weather-cond">{weather === 'sunny' ? getTranslation(lang, 'sunny') : getTranslation(lang, 'rainy')}</span>
          </div>
          <div className="weather-stats">
            <span>💧 {getTranslation(lang, 'humidity')}: {weather === 'sunny' ? '45%' : '88%'}</span>
            <span>💨 {getTranslation(lang, 'wind')}: {weather === 'sunny' ? '12 km/h' : '25 km/h'}</span>
          </div>
        </div>
        <div className="weather-right-icon">
          {weather === 'sunny' ? '☀️' : '🌧️'}
        </div>
        
        {/* 3-day forecast details */}
        <div className="weather-forecast-row">
          <div className="forecast-item">
            <span className="forecast-day">Today</span>
            <span>{weather === 'sunny' ? '☀️' : '🌧️'} {weather === 'sunny' ? '32°' : '24°'}</span>
          </div>
          <div className="forecast-item">
            <span className="forecast-day">Tomorrow</span>
            <span>{weather === 'sunny' ? '⛅' : '🌦️'} {weather === 'sunny' ? '29°' : '26°'}</span>
          </div>
          <div className="forecast-item">
            <span className="forecast-day">Day After</span>
            <span>☀️ {weather === 'sunny' ? '31°' : '30°'}</span>
          </div>
        </div>
      </div>

      {/* Agricultural Advice banner based on weather */}
      <div className="weather-advice-banner">
        <span>💡</span>
        <span>{weather === 'sunny' ? getTranslation(lang, 'weatherTipSunny') : getTranslation(lang, 'weatherTipRainy')}</span>
      </div>

      {/* 1. Active Reminders Ticker alert */}
      {pendingReminders.length > 0 && (
        <div 
          className={`reminders-ticker-banner ${criticalRemindersCount > 0 ? 'critical-bg' : 'normal-bg'}`}
          onClick={() => onNavigate('reminders')}
        >
          <div className="ticker-icon">🔔</div>
          <div className="ticker-text">
            {criticalRemindersCount > 0 ? (
              <strong>{criticalRemindersCount} {getTranslation(lang, 'overdue')} task(s) need attention!</strong>
            ) : (
              <span>You have {pendingReminders.length} upcoming farm tasks.</span>
            )}
          </div>
          <span className="ticker-arrow">→</span>
        </div>
      )}

      {/* 2. Visual Disease Infection Warning Banner */}
      {activeDiseaseAlerts.length > 0 && (
        <div 
          className="disease-ticker-banner"
          onClick={() => onNavigate('disease')}
        >
          <div className="ticker-icon">🦠</div>
          <div className="ticker-text">
            <strong>{activeDiseaseAlerts[0].disease_name}</strong> detected on wheat! View treatment tips.
          </div>
          <span className="ticker-arrow">→</span>
        </div>
      )}

      {/* Financial Summary Card */}
      <div className="summary-cards">
        <div className={`card net-card ${netProfit >= 0 ? 'profit-bg' : 'loss-bg'}`}>
          <div className="card-label">
            {netProfit >= 0 ? getTranslation(lang, 'netProfit') : getTranslation(lang, 'netLoss')}
          </div>
          <div className="card-amount">
            {getTranslation(lang, 'rupeeSymbol')}{Math.abs(netProfit).toLocaleString('en-IN')}
          </div>
          <div className="card-indicator-icon">
            {netProfit >= 0 ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            )}
          </div>
        </div>

        <div className="split-cards">
          <div className="card income-card">
            <span className="card-small-label">{getTranslation(lang, 'totalIncome')}</span>
            <div className="amount text-green">
              +{getTranslation(lang, 'rupeeSymbol')}{totalIncome.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="card expense-card">
            <span className="card-small-label">{getTranslation(lang, 'totalExpenses')}</span>
            <div className="amount text-red">
              -{getTranslation(lang, 'rupeeSymbol')}{totalExpenses.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Soil Health Summary panel */}
      {activeSoilReport && (
        <div className="soil-quick-status card" onClick={() => onNavigate('soil')}>
          <div className="quick-soil-header">
            <span>🔬 {getTranslation(lang, 'soilStatus')} ({activeSoilReport.field_name})</span>
            <span className={`soil-dot-indicator ${activeSoilReport.nitrogen === 'low' ? 'deficit' : 'healthy'}`}></span>
          </div>
          <p className="soil-quick-recommendation">
            {activeSoilReport.nitrogen === 'low' 
              ? "Nitrogen levels are low. Advisory: Top dress Urea fertilizer."
              : "Soil pH and nutrient cycles are optimal."}
          </p>
        </div>
      )}

      {/* Main Action Shortcuts */}
      <div className="dashboard-actions">
        <button className="primary-action-btn pulse-btn" onClick={() => onNavigate('voice')}>
          <div className="btn-icon-wrapper">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
          </div>
          <span>{getTranslation(lang, 'voiceInput')}</span>
        </button>

        <button className="secondary-action-btn" onClick={() => onNavigate('add-tx')}>
          <div className="btn-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span>{getTranslation(lang, 'addTransaction')}</span>
        </button>
      </div>

      {/* 4. Crop Profit Comparison Chart (Analytics) */}
      {crops.length > 0 && (
        <div className="analytics-comparison-card card">
          <h3>📊 Crop Profit Comparison</h3>
          <div className="profit-bar-chart">
            {cropProfits.map(cp => {
              const percentage = (Math.abs(cp.profit) / maxProfit) * 100;
              const isProfit = cp.profit >= 0;
              return (
                <div key={cp.id} className="chart-row">
                  <span className="chart-crop-name">{getTranslation(lang, cp.name)}</span>
                  <div className="chart-bar-wrapper">
                    <div 
                      className={`chart-bar-fill ${isProfit ? 'profit-bar' : 'loss-bar'}`}
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="bar-value">₹{cp.profit.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Crop Seasons List */}
      <div className="crops-section">
        <div className="section-header">
          <h2>{getTranslation(lang, 'activeCrops')}</h2>
          <button className="add-crop-inline-btn" onClick={() => onNavigate('add-crop')}>
            + {getTranslation(lang, 'addCrop')}
          </button>
        </div>

        {activeCrops.length === 0 ? (
          <div className="empty-state">
            <p>No active crops. Tap 'Add Crop' to begin.</p>
          </div>
        ) : (
          <div className="crops-grid">
            {activeCrops.map(crop => {
              const stats = db.getCropStats(crop.id);
              return (
                <div key={crop.id} className="crop-card active-border" onClick={() => onViewCrop(crop.id)}>
                  <div className="crop-card-header">
                    <div className="crop-avatar">
                      <CropIcon name={crop.crop_name} />
                    </div>
                    <div className="crop-info">
                      <h3>{getTranslation(lang, crop.crop_name)}</h3>
                      <span className="badge acres-badge">
                        {crop.land_size} {getTranslation(lang, 'acres')}
                      </span>
                    </div>
                    <div className="crop-status-badge growing">
                      {getTranslation(lang, 'active')}
                    </div>
                  </div>

                  <div className="crop-card-footer">
                    <div className="footer-label">Net Return</div>
                    <div className={`footer-profit ${stats.profit >= 0 ? 'text-green' : 'text-red'}`}>
                      {stats.profit >= 0 ? '+' : ''}{getTranslation(lang, 'rupeeSymbol')}{stats.profit.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Harvested Crop Seasons List */}
      {harvestedCrops.length > 0 && (
        <div className="crops-section harvested-section">
          <div className="section-header">
            <h2>{getTranslation(lang, 'harvestedCrops')}</h2>
          </div>

          <div className="crops-grid">
            {harvestedCrops.map(crop => {
              const stats = db.getCropStats(crop.id);
              return (
                <div key={crop.id} className="crop-card harvested-card" onClick={() => onViewCrop(crop.id)}>
                  <div className="crop-card-header">
                    <div className="crop-avatar greyed">
                      <CropIcon name={crop.crop_name} />
                    </div>
                    <div className="crop-info">
                      <h3>{getTranslation(lang, crop.crop_name)}</h3>
                      <span className="badge secondary-badge">
                        {crop.land_size} {getTranslation(lang, 'acres')}
                      </span>
                    </div>
                    <div className="crop-status-badge harvested">
                      {getTranslation(lang, 'harvested')}
                    </div>
                  </div>

                  <div className="crop-card-footer">
                    <div className="footer-label">Final Profit</div>
                    <div className={`footer-profit ${stats.profit >= 0 ? 'text-green' : 'text-red'}`}>
                      {stats.profit >= 0 ? '+' : ''}{getTranslation(lang, 'rupeeSymbol')}{stats.profit.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
