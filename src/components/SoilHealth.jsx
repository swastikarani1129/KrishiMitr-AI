import React, { useState } from 'react';
import { getTranslation } from '../services/translations';
import { db } from '../services/db';
import soilTextureImg from '../assets/soil_texture.png';

export default function SoilHealth({ lang, showToast }) {
  const tests = db.getSoilTests().sort((a, b) => new Date(b.test_date) - new Date(a.test_date));
  const activeTest = tests[0] || null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fieldName, setFieldName] = useState('Field A');
  const [ph, setPh] = useState(6.5);
  const [nitrogen, setNitrogen] = useState('medium');
  const [phosphorus, setPhosphorus] = useState('medium');
  const [potassium, setPotassium] = useState('medium');
  const [organicCarbon, setOrganicCarbon] = useState('medium');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);

  // Adjust pH value with steppers
  const handleAdjustPh = (val) => {
    setPh(prev => {
      const next = prev + val;
      return next >= 4.0 && next <= 10.0 ? parseFloat(next.toFixed(1)) : prev;
    });
  };

  // Advice generator based on nutrient values
  const generateSoilAdvice = (soilPh, n, p, k, oc) => {
    let recommendations = [];
    
    // pH Advice
    if (soilPh < 6.0) {
      recommendations.push("Acidic soil detected. Apply agricultural lime (dolomite) at 400kg per acre to balance pH. Avoid acid-forming fertilizers.");
    } else if (soilPh > 7.5) {
      recommendations.push("Alkaline soil detected. Apply agricultural gypsum at 500kg per acre, or add organic manure/sphagnum peat moss to reduce pH.");
    } else {
      recommendations.push("Soil pH is neutral and optimal for major crops (Wheat, Rice).");
    }

    // NPK Advice
    if (n === 'low') {
      recommendations.push("Nitrogen is low. Top-dress Urea (approx 45kg/acre) in 3 split doses at watering stages. Practice green manuring with leguminous crops.");
    }
    if (p === 'low') {
      recommendations.push("Phosphorus is low. Apply Single Super Phosphate (SSP) or DAP (Diammonium Phosphate) before sowing.");
    }
    if (k === 'low') {
      recommendations.push("Potassium is low. Apply Muriate of Potash (MOP) to improve disease resistance and grain size.");
    }
    if (oc === 'low') {
      recommendations.push("Organic Carbon is deficient. Incorporate farmyard manure (FYM), compost, or crop residues to enhance soil microbial activity.");
    }

    if (recommendations.length <= 1) {
      recommendations.push("All macro-nutrients are at optimal levels. Maintain regular organic composting.");
    }

    return recommendations.join(" ");
  };

  const handleSaveReport = (e) => {
    e.preventDefault();

    const recommendation = generateSoilAdvice(ph, nitrogen, phosphorus, potassium, organicCarbon);

    // Date logic: retest in 1 year
    const nextTestDate = new Date(new Date(testDate).setFullYear(new Date(testDate).getFullYear() + 1)).toISOString().split('T')[0];

    db.addSoilTest({
      field_name: fieldName,
      ph,
      nitrogen,
      phosphorus,
      potassium,
      organic_carbon: organicCarbon,
      test_date: testDate,
      next_test_date: nextTestDate,
      recommendation
    });

    showToast(getTranslation(lang, 'successSave'));
    setIsModalOpen(false);
    
    // Reset form states
    setFieldName('Field A');
    setPh(6.5);
    setNitrogen('medium');
    setPhosphorus('medium');
    setPotassium('medium');
    setOrganicCarbon('medium');
  };

  const handleDeleteTest = (id) => {
    if (window.confirm(getTranslation(lang, 'deleteConfirm'))) {
      db.deleteSoilTest(id);
      showToast(getTranslation(lang, 'successDelete'));
    }
  };

  const getNutrientBadgeClass = (val) => {
    if (val === 'low') return 'nutrient-badge low-color';
    if (val === 'medium') return 'nutrient-badge med-color';
    return 'nutrient-badge high-color';
  };

  return (
    <div className="soil-view animate-fade-in">
      {/* Top Banner and Quick Add */}
      <div className="section-header">
        <h2>{getTranslation(lang, 'soilHealth')}</h2>
        <button className="add-crop-inline-btn" onClick={() => setIsModalOpen(true)}>
          + {getTranslation(lang, 'addSoilReport')}
        </button>
      </div>

      {/* Main Soil Report Card */}
      {!activeTest ? (
        <div className="empty-state card">
          <p>No soil test records registered. Tap 'Log Soil Report' to add.</p>
        </div>
      ) : (
        <div className="soil-dashboard">
          {/* Active Field Name Header */}
          <div className="soil-header-panel card">
            <div className="soil-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                <path d="M12 6V18M6 12H18" />
              </svg>
            </div>
            <div>
              <h3>{activeTest.field_name}</h3>
              <span className="soil-date-stamp">
                Tested: {new Date(activeTest.test_date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
              </span>
            </div>
            <div className="retest-status-badge">
              Next: {new Date(activeTest.next_test_date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
            </div>
          </div>

          {/* Soil Image Banner */}
          <div className="soil-image-banner-card card">
            <img src={soilTextureImg} alt="Soil Texture" className="soil-texture-img" />
          </div>

          {/* pH and Nutrients Dials */}
          <div className="card soil-metrics-card">
            <div className="ph-meter-block">
              <div className="ph-gauge-label">{getTranslation(lang, 'phLabel')}</div>
              <div className="ph-gauge-value">{activeTest.ph}</div>
              
              {/* Custom visual pH scale */}
              <div className="ph-visual-slider">
                <div className="ph-line"></div>
                <div 
                  className="ph-indicator-pin" 
                  style={{ left: `${((activeTest.ph - 4) / 6) * 100}%` }}
                ></div>
              </div>
              <div className="ph-endpoints">
                <span className="acid text-red">4.0 (Acid)</span>
                <span className="neutral text-green">7.0</span>
                <span className="alkali text-blue">10.0 (Alkali)</span>
              </div>
            </div>

            <div className="divider-line"></div>

            {/* Nutrients Grid */}
            <div className="nutrients-grid-panel">
              <div className="nutrient-item">
                <span className="nutrient-label">{getTranslation(lang, 'nitrogenLabel')}</span>
                <span className={getNutrientBadgeClass(activeTest.nitrogen)}>
                  {getTranslation(lang, activeTest.nitrogen)}
                </span>
              </div>
              <div className="nutrient-item">
                <span className="nutrient-label">{getTranslation(lang, 'phosphorusLabel')}</span>
                <span className={getNutrientBadgeClass(activeTest.phosphorus)}>
                  {getTranslation(lang, activeTest.phosphorus)}
                </span>
              </div>
              <div className="nutrient-item">
                <span className="nutrient-label">{getTranslation(lang, 'potassiumLabel')}</span>
                <span className={getNutrientBadgeClass(activeTest.potassium)}>
                  {getTranslation(lang, activeTest.potassium)}
                </span>
              </div>
              <div className="nutrient-item">
                <span className="nutrient-label">{getTranslation(lang, 'organicCarbonLabel')}</span>
                <span className={getNutrientBadgeClass(activeTest.organic_carbon)}>
                  {getTranslation(lang, activeTest.organic_carbon)}
                </span>
              </div>
            </div>
          </div>

          {/* AI Advisor Recommendations */}
          <div className="card advice-card">
            <h3>💡 {getTranslation(lang, 'soilRecommendation')}</h3>
            <p className="soil-advice-text">{activeTest.recommendation}</p>
          </div>
        </div>
      )}

      {/* History Ledger List */}
      {tests.length > 1 && (
        <div className="soil-history-section">
          <h2>{getTranslation(lang, 'recentSoilTests')}</h2>
          <div className="soil-tests-list">
            {tests.slice(1).map(test => (
              <div key={test.id} className="soil-test-itemcard card">
                <div className="test-header">
                  <div>
                    <h4>{test.field_name}</h4>
                    <span className="test-date">
                      Tested: {new Date(test.test_date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
                    </span>
                  </div>
                  <button className="delete-tx-btn" onClick={() => handleDeleteTest(test.id)}>
                    ✕
                  </button>
                </div>
                <div className="test-brief-stats">
                  <span>pH: <strong>{test.ph}</strong></span>
                  <span>N: <strong>{test.nitrogen}</strong></span>
                  <span>P: <strong>{test.phosphorus}</strong></span>
                  <span>K: <strong>{test.potassium}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Soil Report Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale-up">
            <div className="modal-header">
              <h2>{getTranslation(lang, 'addSoilReport')}</h2>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSaveReport} className="farmer-form">
              {/* Field Name */}
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'fieldLabel')}</label>
                <input
                  type="text"
                  className="text-input"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  required
                />
              </div>

              {/* pH Stepper */}
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'phLabel')} (4.0 - 10.0)</label>
                <div className="ph-stepper-container">
                  <button type="button" className="ph-step-btn minus" onClick={() => handleAdjustPh(-0.1)}>-0.1</button>
                  <div className="ph-stepper-value">{ph}</div>
                  <button type="button" className="ph-step-btn plus" onClick={() => handleAdjustPh(0.1)}>+0.1</button>
                </div>
              </div>

              {/* Nitrogen Selector */}
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'nitrogenLabel')}</label>
                <div className="nutrient-select-row">
                  {['low', 'medium', 'high'].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`nutrient-select-btn ${nitrogen === val ? 'selected ' + val : ''}`}
                      onClick={() => setNitrogen(val)}
                    >
                      {getTranslation(lang, val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phosphorus Selector */}
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'phosphorusLabel')}</label>
                <div className="nutrient-select-row">
                  {['low', 'medium', 'high'].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`nutrient-select-btn ${phosphorus === val ? 'selected ' + val : ''}`}
                      onClick={() => setPhosphorus(val)}
                    >
                      {getTranslation(lang, val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Potassium Selector */}
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'potassiumLabel')}</label>
                <div className="nutrient-select-row">
                  {['low', 'medium', 'high'].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`nutrient-select-btn ${potassium === val ? 'selected ' + val : ''}`}
                      onClick={() => setPotassium(val)}
                    >
                      {getTranslation(lang, val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Organic Carbon Selector */}
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'organicCarbonLabel')}</label>
                <div className="nutrient-select-row">
                  {['low', 'medium', 'high'].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`nutrient-select-btn ${organicCarbon === val ? 'selected ' + val : ''}`}
                      onClick={() => setOrganicCarbon(val)}
                    >
                      {getTranslation(lang, val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selector */}
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'reportDate')}</label>
                <input
                  type="date"
                  className="date-input"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  required
                />
              </div>

              {/* Submit */}
              <button type="submit" className="form-submit-btn">
                {getTranslation(lang, 'saveSoilBtn')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
