import React, { useState } from 'react';
import { getTranslation } from '../services/translations';
import { db } from '../services/db';

// Preset samples to test AI Vision
const PRESETS = [
  {
    id: 'preset_healthy',
    nameKey: 'healthyLeafName',
    diseaseName: 'Healthy Leaf',
    crop: 'Wheat',
    confidence: 99,
    symptoms: 'Leaf is vibrant green, no lesions, spots, or discoloration observed. Nutrient absorption appears normal.',
    treatment: 'No disease treatment required. Continue standard irrigation and fertilizer schedule.',
    prevention: 'Maintain soil organic carbon, water at early crop growth stages, and do regular monitoring.',
    color: '#15803d',
    bgClass: 'healthy-leaf-preset'
  },
  {
    id: 'preset_rust',
    nameKey: 'yellowRustName',
    diseaseName: 'Yellow Rust',
    crop: 'Wheat',
    confidence: 94,
    symptoms: 'Linear rows of bright yellow-orange pustules (uredinia) on the leaf surface. Affected leaves turn brown and dry prematurely.',
    treatment: 'Spray Tilt 25 EC (Propiconazole) at 200 ml in 200 liters of water per acre, or apply garlic extract solution organically.',
    prevention: 'Use certified rust-resistant seed varieties (e.g., HD-3086, DBW-187). Avoid excessive nitrogen top dressing.',
    color: '#d97706',
    bgClass: 'rust-leaf-preset'
  },
  {
    id: 'preset_blast',
    nameKey: 'riceBlastName',
    diseaseName: 'Rice Blast',
    crop: 'Rice',
    confidence: 89,
    symptoms: 'Spindle-shaped or eye-shaped lesions with gray centers and dark brown borders on leaves. Lesions can merge, causing leaves to wither.',
    treatment: 'Apply Tricyclazole 75 WP at 120 grams per acre in 200 liters of water, or apply cow dung slurry filtrate organically.',
    prevention: 'Avoid excessive nitrogen fertilizer. Keep water level consistent in fields. Burn crop residue of infected crops.',
    color: '#dc3545',
    bgClass: 'blast-leaf-preset'
  },
  {
    id: 'preset_blight',
    nameKey: 'tomatoBlightName',
    diseaseName: 'Tomato Late Blight',
    crop: 'Vegetables',
    confidence: 87,
    symptoms: 'Dark water-soaked spots on leaves that turn brown/black, accompanied by a white fuzzy mold on the leaf undersides in humid weather.',
    treatment: 'Apply Copper Oxychloride at 3g/litre of water or spray Mancozeb at 2g/litre. Prune lower leaves to increase aeration.',
    prevention: 'Follow crop rotation. Avoid overhead watering (use drip irrigation). Space plants properly to ensure foliage dries quickly.',
    color: '#991b1b',
    bgClass: 'blight-leaf-preset'
  }
];

export default function DiseaseIdentifier({ lang, showToast }) {
  const activeCrops = db.getCropSeasons().filter(c => c.status === 'active');
  const pastScans = db.getAllDiseaseHistory().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [linkCropId, setLinkCropId] = useState(activeCrops[0]?.id || '');
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' or 'history'
  
  // Handle custom file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(URL.createObjectURL(file));
      setSelectedPreset(null);
      setDiagnosisResult(null);
    }
  };

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setSelectedFile(null);
    setDiagnosisResult(null);
  };

  // Run mock scanner animation
  const handleStartScan = () => {
    if (!selectedPreset && !selectedFile) {
      alert('Please upload a leaf photo or select a test leaf first.');
      return;
    }
    
    setIsScanning(true);
    
    setTimeout(() => {
      setIsScanning(false);
      // If a preset was selected, show its diagnostic data
      if (selectedPreset) {
        setDiagnosisResult(selectedPreset);
      } else {
        // Fallback for custom file upload: simulate random disease
        const randomIndex = 1 + Math.floor(Math.random() * (PRESETS.length - 1));
        const result = { ...PRESETS[randomIndex], diseaseName: PRESETS[randomIndex].diseaseName + ' (Simulated)' };
        setDiagnosisResult(result);
      }
    }, 3000);
  };

  const handleSaveToHistory = () => {
    if (!diagnosisResult) return;
    if (!linkCropId) {
      alert('Please select an active crop season first.');
      return;
    }

    db.addDiseaseHistory({
      crop_season_id: linkCropId,
      disease_name: diagnosisResult.diseaseName,
      confidence: diagnosisResult.confidence,
      symptoms: diagnosisResult.symptoms,
      treatment: diagnosisResult.treatment,
      prevention: diagnosisResult.prevention,
      image_name: diagnosisResult.id || 'leaf_custom'
    });

    // Create a spraying reminder automatically if a disease is diagnosed
    if (diagnosisResult.diseaseName !== 'Healthy Leaf') {
      db.addReminder({
        crop_season_id: linkCropId,
        type: 'spraying',
        title: `Spray Treatment for ${diagnosisResult.diseaseName}`,
        date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], // in 2 days
        status: 'pending'
      });
    }

    showToast(getTranslation(lang, 'savedToHistory'));
    setDiagnosisResult(null);
    setSelectedPreset(null);
    setSelectedFile(null);
    setActiveTab('history');
  };

  const handleDeleteScan = (id) => {
    if (window.confirm(getTranslation(lang, 'deleteConfirm'))) {
      db.deleteDiseaseHistory(id);
      showToast(getTranslation(lang, 'successDelete'));
    }
  };

  return (
    <div className="disease-view animate-fade-in">
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`}
          onClick={() => setActiveTab('scan')}
        >
          {getTranslation(lang, 'diseaseIdentifier')}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          {getTranslation(lang, 'recentDiseases')} ({pastScans.length})
        </button>
      </div>

      {activeTab === 'scan' ? (
        <div className="scan-content">
          <div className="disease-card card">
            <h2>{getTranslation(lang, 'diseaseScanTitle')}</h2>
            
            {/* Visual Leaf display container */}
            <div className="leaf-display-viewport">
              {isScanning && (
                <div className="laser-scanner-overlay">
                  <div className="laser-bar"></div>
                  <span className="scanner-text">{getTranslation(lang, 'scanning')}</span>
                </div>
              )}

              {selectedFile ? (
                <img src={selectedFile} alt="Uploaded leaf" className="uploaded-leaf-preview" />
              ) : selectedPreset ? (
                <div className={`leaf-preset-graphic ${selectedPreset.bgClass}`}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2C6.5 2 2 6.5 2 12c0 3 .5 4 2 6.5s5 3.5 8 3.5 6.5-1 8-3.5 .5-3.5 2-6.5S17.5 2 12 2z" />
                    <path d="M12 2v20" />
                    <path d="M12 7c2 1 4 0 4-2" />
                    <path d="M12 11c3 1.5 5 0 5-3" />
                    <path d="M12 15c4 2 6 0 6-4" />
                    <path d="M12 9c-2 1-4 0-4-2" />
                    <path d="M12 13c-3 1.5-5 0-5-3" />
                    <path d="M12 17c-4 2-6 0-6-4" />
                  </svg>
                  <span>{getTranslation(lang, selectedPreset.nameKey)}</span>
                </div>
              ) : (
                <div className="empty-leaf-placeholder">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>{getTranslation(lang, 'uploadLeafPhoto')}</span>
                </div>
              )}
            </div>

            {/* Custom file upload triggers */}
            <div className="upload-actions-row">
              <label className="upload-file-btn">
                <input type="file" accept="image/*" onChange={handleFileChange} />
                📸 Camera / File
              </label>
              
              {(selectedPreset || selectedFile) && !isScanning && !diagnosisResult && (
                <button className="scan-action-btn" onClick={handleStartScan}>
                  ⚡ {getTranslation(lang, 'scanLeaf')}
                </button>
              )}
            </div>

            {/* Quick preset selector */}
            {!diagnosisResult && !isScanning && (
              <div className="presets-block">
                <p className="preset-label">{getTranslation(lang, 'selectDemoLeaf')}</p>
                <div className="presets-grid">
                  {PRESETS.map(preset => (
                    <button 
                      key={preset.id}
                      className={`preset-btn-tile ${selectedPreset?.id === preset.id ? 'active' : ''}`}
                      onClick={() => handleSelectPreset(preset)}
                      style={{ borderLeftColor: preset.color }}
                    >
                      {getTranslation(lang, preset.nameKey)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI diagnosis report */}
          {diagnosisResult && !isScanning && (
            <div className="diagnosis-report card animate-scale-up">
              <div className="report-header" style={{ borderLeftColor: diagnosisResult.color }}>
                <div>
                  <span className="field-label">{getTranslation(lang, 'leafDiagnosed')}</span>
                  <h3>
                    {lang === 'hi' && diagnosisResult.nameKey 
                      ? getTranslation(lang, diagnosisResult.nameKey) 
                      : diagnosisResult.diseaseName}
                  </h3>
                </div>
                <div className="confidence-badge" style={{ backgroundColor: diagnosisResult.color }}>
                  {diagnosisResult.confidence}% match
                </div>
              </div>

              <div className="report-body">
                <div className="report-field">
                  <span className="field-label">{getTranslation(lang, 'symptomsLabel')}</span>
                  <p>{diagnosisResult.symptoms}</p>
                </div>
                
                <div className="report-field">
                  <span className="field-label">{getTranslation(lang, 'treatmentLabel')}</span>
                  <p className="treatment-text">{diagnosisResult.treatment}</p>
                </div>

                <div className="report-field">
                  <span className="field-label">{getTranslation(lang, 'preventionLabel')}</span>
                  <p>{diagnosisResult.prevention}</p>
                </div>

                <div className="alert-box-warning">
                  ⚠️ {getTranslation(lang, 'expertWarning')}
                </div>

                {activeCrops.length > 0 ? (
                  <div className="save-to-crop-section">
                    <div className="form-group">
                      <label className="form-label">Link to active crop:</label>
                      <select 
                        className="select-input" 
                        value={linkCropId}
                        onChange={(e) => setLinkCropId(e.target.value)}
                      >
                        {activeCrops.map(c => (
                          <option key={c.id} value={c.id}>
                            {getTranslation(lang, c.crop_name)} ({c.land_size} Acres)
                          </option>
                        ))}
                      </select>
                    </div>
                    <button className="confirm-btn-full" onClick={handleSaveToHistory}>
                      💾 {getTranslation(lang, 'saveHistoryBtn')}
                    </button>
                  </div>
                ) : (
                  <p className="error-text">Please create an active crop season first to save this scan.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Scanned Log list */
        <div className="history-content">
          {pastScans.length === 0 ? (
            <div className="empty-state">
              <p>No disease logs stored. Perform leaf scans first.</p>
            </div>
          ) : (
            <div className="disease-log-list">
              {pastScans.map(log => {
                const linkedCrop = db.getCropSeasons().find(c => c.id === log.crop_season_id);
                const presetTemplate = PRESETS.find(p => p.id === log.image_name) || PRESETS[1];
                return (
                  <div key={log.id} className="disease-log-card card" style={{ borderLeftColor: presetTemplate.color }}>
                    <div className="log-header">
                      <div>
                        <h3>{log.disease_name}</h3>
                        <span className="log-meta">
                          Crop: {linkedCrop ? getTranslation(lang, linkedCrop.crop_name) : 'General'}  •  
                          Date: {new Date(log.created_at).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
                        </span>
                      </div>
                      <button className="delete-tx-btn" onClick={() => handleDeleteScan(log.id)}>
                        ✕
                      </button>
                    </div>
                    
                    <div className="log-body">
                      <p><strong>{getTranslation(lang, 'symptomsLabel')}:</strong> {log.symptoms}</p>
                      <p className="treatment-box"><strong>{getTranslation(lang, 'treatmentLabel')}:</strong> {log.treatment}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
