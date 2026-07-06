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
import DiseaseIdentifier from './components/DiseaseIdentifier';
import SoilHealth from './components/SoilHealth';
import Reminders from './components/Reminders';
import Marketplace from './components/Marketplace';

export default function App() {
  const [lang, setLang] = useState('hi'); // Default language (Hindi)
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'crop-detail', 'add-crop', 'add-tx', 'voice', 'disease', 'soil', 'reminders', 'marketplace'
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
      case 'disease':
        return (
          <DiseaseIdentifier
            lang={lang}
            showToast={showToast}
          />
        );
      case 'soil':
        return (
          <SoilHealth
            lang={lang}
            showToast={showToast}
          />
        );
      case 'reminders':
        return (
          <Reminders
            lang={lang}
            showToast={showToast}
          />
        );
      case 'marketplace':
        return (
          <Marketplace
            lang={lang}
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

      {/* Bottom Sticky Navigation (5-Tab Smart Layout) */}
      <nav className="bottom-nav">
        {/* Tab 1: Dashboard (Home) */}
        <button 
          className={`nav-tab ${currentView === 'dashboard' || currentView === 'crop-detail' ? 'active' : ''}`}
          onClick={handleBackToDashboard}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>{getTranslation(lang, 'dashboard')}</span>
        </button>

        {/* Tab 2: Crop Disease (Leaf Scanner) */}
        <button 
          className={`nav-tab ${currentView === 'disease' ? 'active' : ''}`}
          onClick={() => navigateTo('disease')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C6.5 2 2 6.5 2 12c0 3 .5 4 2 6.5s5 3.5 8 3.5 6.5-1 8-3.5 .5-3.5 2-6.5S17.5 2 12 2z" />
            <path d="M12 2v20M12 12h10" />
          </svg>
          <span>{getTranslation(lang, 'diseaseIdentifier')}</span>
        </button>

        {/* Tab 3: Center Microphone Button for Voice Entry */}
        <button 
          className={`nav-tab nav-center-tab ${currentView === 'voice' ? 'active' : ''}`}
          onClick={() => navigateTo('voice')}
        >
          <div className="center-btn-mic">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
          </div>
        </button>

        {/* Tab 4: Soil Health / Reminders */}
        <button 
          className={`nav-tab ${currentView === 'soil' || currentView === 'reminders' ? 'active' : ''}`}
          onClick={() => navigateTo('soil')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span>{getTranslation(lang, 'soilHealth')}</span>
        </button>

        {/* Tab 5: Marketplace */}
        <button 
          className={`nav-tab ${currentView === 'marketplace' ? 'active' : ''}`}
          onClick={() => navigateTo('marketplace')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span>{getTranslation(lang, 'marketplace')}</span>
        </button>
      </nav>
    </div>
  );
}
