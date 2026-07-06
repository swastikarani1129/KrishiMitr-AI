import React, { useState } from 'react';
import { getTranslation } from '../services/translations';
import { db } from '../services/db';
import { CropIcon } from './Dashboard';

const AVAILABLE_CROPS = ['Wheat', 'Rice', 'Sugarcane', 'Mustard', 'Potato', 'Vegetables', 'Other'];

export default function AddCrop({ lang, onBack, showToast }) {
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [landSize, setLandSize] = useState(1.0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAdjustLand = (amount) => {
    setLandSize(prev => {
      const next = prev + amount;
      return next > 0 ? parseFloat(next.toFixed(2)) : 0.5;
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedCrop) return;

    db.addCropSeason({
      crop_name: selectedCrop,
      land_size: landSize,
      start_date: startDate,
      status: 'active'
    });

    showToast(getTranslation(lang, 'successSave'));
    onBack();
  };

  return (
    <div className="add-crop-view animate-fade-in">
      <div className="form-header">
        <button className="icon-back-btn" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>{getTranslation(lang, 'backBtn')}</span>
        </button>
        <h1>{getTranslation(lang, 'cropFormTitle')}</h1>
      </div>

      <form onSubmit={handleSave} className="farmer-form">
        {/* Crop Selection Grid */}
        <div className="form-group">
          <label className="form-label">{getTranslation(lang, 'cropNameLabel')}</label>
          <div className="crop-selector-grid">
            {AVAILABLE_CROPS.map(cropKey => (
              <button
                key={cropKey}
                type="button"
                className={`crop-select-tile ${selectedCrop === cropKey ? 'selected' : ''}`}
                onClick={() => setSelectedCrop(cropKey)}
              >
                <div className="tile-icon">
                  <CropIcon name={cropKey} size={36} />
                </div>
                <span className="tile-label">{getTranslation(lang, cropKey)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Land Size Stepper */}
        <div className="form-group">
          <label className="form-label">{getTranslation(lang, 'landSizeLabel')}</label>
          <div className="stepper-container">
            <button
              type="button"
              className="stepper-btn minus"
              onClick={() => handleAdjustLand(-1)}
            >
              -1
            </button>
            <button
              type="button"
              className="stepper-btn minus-small"
              onClick={() => handleAdjustLand(-0.5)}
            >
              -0.5
            </button>
            
            <div className="stepper-value">
              <span className="number">{landSize}</span>
              <span className="unit">{getTranslation(lang, 'acres')}</span>
            </div>

            <button
              type="button"
              className="stepper-btn plus-small"
              onClick={() => handleAdjustLand(0.5)}
            >
              +0.5
            </button>
            <button
              type="button"
              className="stepper-btn plus"
              onClick={() => handleAdjustLand(1)}
            >
              +1
            </button>
          </div>
        </div>

        {/* Date Selector */}
        <div className="form-group">
          <label className="form-label">{getTranslation(lang, 'startDateLabel')}</label>
          <input
            type="date"
            className="date-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        {/* Submit */}
        <button type="submit" className="form-submit-btn">
          {getTranslation(lang, 'saveCropBtn')}
        </button>
      </form>
    </div>
  );
}
