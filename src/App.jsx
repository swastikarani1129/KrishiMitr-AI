import React, { useState, useEffect } from 'react';
import './App.css';
import { db } from './services/db';
import { getTranslation } from './services/translations';

// Import Views
import Dashboard from './components/Dashboard';
import CropDetail from './components/CropDetail';
import AddCrop from './components/AddCrop';
import AddTransaction from './components/AddTransaction';
import VoiceInput from './components/VoiceInput';

export default function App() {
  const [lang, setLang] = useState('hi'); // Default language (Hindi)
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'crop-detail', 'add-crop', 'add-tx', 'voice'
  const [selectedCropId, setSelectedCropId] = useState(null);
  const [navigationParams, setNavigationParams] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  // Sync initial language preference from DB
  useEffect(() => {
    const farmer = db.getFarmer();
    if (farmer && farmer.language_preference) {
      setLang(farmer.language_preference);
    }
  }, []);

  const handleToggleLanguage = () => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    setLang(newLang);
    const farmer = db.getFarmer();
    db.saveFarmer({ ...farmer, language_preference: newLang });
  };

  // Toast Utility
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  // Navigation Helper
  const navigateTo = (view, params = {}) => {
    setNavigationParams(params);
    if (view === 'crop-detail' && params.cropId) {
      setSelectedCropId(params.cropId);
    }
    setCurrentView(view);
  };

  const handleBackToDashboard = () => {
    setSelectedCropId(null);
    setNavigationParams({});
    setCurrentView('dashboard');
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            lang={lang}
            onViewCrop={(cropId) => navigateTo('crop-detail', { cropId })}
            onNavigate={(view) => navigateTo(view)}
          />
        );
      case 'crop-detail':
        return (
          <CropDetail
            cropId={selectedCropId}
            lang={lang}
            onBack={handleBackToDashboard}
            onNavigate={(view, params) => navigateTo(view, params)}
            showToast={showToast}
          />
        );
      case 'add-crop':
        return (
          <AddCrop
            lang={lang}
            onBack={handleBackToDashboard}
            showToast={showToast}
          />
        );
      case 'add-tx':
        return (
          <AddTransaction
            defaultCropId={navigationParams.defaultCropId}
            lang={lang}
            onBack={
              selectedCropId 
                ? () => navigateTo('crop-detail', { cropId: selectedCropId }) 
                : handleBackToDashboard
            }
            showToast={showToast}
          />
        );
      case 'voice':
        return (
          <VoiceInput
            lang={lang}
            onBack={handleBackToDashboard}
            showToast={showToast}
          />
        );
      default:
        return <Dashboard lang={lang} onViewCrop={(cropId) => navigateTo('crop-detail', { cropId })} onNavigate={(view) => navigateTo(view)} />;
    }
  };

  return (
    <div className="app-container">
      {/* Top Banner Navigation Header */}
      <header className="app-header">
        <div className="header-top-row">
          <div className="brand-section">
            <h1>{getTranslation(lang, 'appName')}</h1>
            <p>{getTranslation(lang, 'subtitle')}</p>
          </div>
          <button className="lang-toggle-btn" onClick={handleToggleLanguage}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>{getTranslation(lang, 'languageLabel')}</span>
          </button>
        </div>
      </header>

      {/* Main Container Viewport */}
      <main className="app-main">
        {renderActiveView()}
      </main>

      {/* Floating toast notification */}
      {toastMessage && (
        <div className="toast-container animate-fade-in">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bottom Sticky Navigation */}
      <nav className="bottom-nav">
        {/* Dashboard Tab */}
        <button 
          className={`nav-tab ${currentView === 'dashboard' || currentView === 'crop-detail' ? 'active' : ''}`}
          onClick={handleBackToDashboard}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>{getTranslation(lang, 'dashboard')}</span>
        </button>

        {/* Center Microphone Button for Voice Entry */}
        <button 
          className={`nav-tab nav-center-tab ${currentView === 'voice' ? 'active' : ''}`}
          onClick={() => navigateTo('voice')}
        >
          <div className="center-btn-mic">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
          </div>
        </button>

        {/* Add Record / Manual Tab */}
        <button 
          className={`nav-tab ${currentView === 'add-tx' ? 'active' : ''}`}
          onClick={() => navigateTo('add-tx')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>{getTranslation(lang, 'addTransaction')}</span>
        </button>
      </nav>
    </div>
  );
}
