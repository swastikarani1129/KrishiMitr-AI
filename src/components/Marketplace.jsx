import React, { useState } from 'react';
import { getTranslation } from '../services/translations';
import { db } from '../services/db';
import { CropIcon } from './Dashboard';

export default function Marketplace({ lang, showToast }) {
  const listings = db.getMarketplaceListings().sort((a, b) => new Date(b.date) - new Date(a.date));
  const farmer = db.getFarmer();

  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'mylistings'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);

  // Form states for new listing
  const [cropName, setCropName] = useState('Wheat');
  const [quantity, setQuantity] = useState(10);
  const [price, setPrice] = useState(2000);
  const [location, setLocation] = useState('Karnal Mandi');
  const [description, setDescription] = useState('');

  const handleAdjustQty = (val) => {
    setQuantity(prev => {
      const next = prev + val;
      return next > 0 ? next : 5;
    });
  };

  const handleAdjustPrice = (val) => {
    setPrice(prev => {
      const next = prev + val;
      return next > 0 ? next : 100;
    });
  };

  const handleCreateListing = (e) => {
    e.preventDefault();
    
    db.addMarketplaceListing({
      farmer_name: farmer.name,
      crop_name: cropName,
      quantity,
      price,
      location,
      phone: farmer.phone,
      description: description.trim()
    });

    showToast(getTranslation(lang, 'successSave'));
    setIsModalOpen(false);
    setActiveTab('mylistings');

    // Reset forms
    setCropName('Wheat');
    setQuantity(10);
    setPrice(2000);
    setDescription('');
  };

  const handleDeleteListing = (id) => {
    if (window.confirm(getTranslation(lang, 'deleteConfirm'))) {
      db.deleteMarketplaceListing(id);
      showToast(getTranslation(lang, 'successDelete'));
    }
  };

  const browseListings = listings.filter(l => l.farmer_name !== farmer.name);
  const myListings = listings.filter(l => l.farmer_name === farmer.name);

  return (
    <div className="marketplace-view animate-fade-in">
      {/* Sub Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          {getTranslation(lang, 'allListings')} ({browseListings.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'mylistings' ? 'active' : ''}`}
          onClick={() => setActiveTab('mylistings')}
        >
          {getTranslation(lang, 'myListings')} ({myListings.length})
        </button>
      </div>

      {activeTab === 'browse' ? (
        /* Browse Listings Tab */
        <div className="browse-content">
          {browseListings.length === 0 ? (
            <div className="empty-state card">
              <p>No listings from other buyers yet.</p>
            </div>
          ) : (
            <div className="listings-grid">
              {browseListings.map(item => (
                <div key={item.id} className="listing-card card">
                  <div className="listing-header">
                    <div className="crop-avatar">
                      <CropIcon name={item.crop_name} size={28} />
                    </div>
                    <div>
                      <h3>{getTranslation(lang, item.crop_name)}</h3>
                      <span className="listing-date">Posted {new Date(item.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}</span>
                    </div>
                    <div className="listing-total-value">
                      ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="listing-body">
                    <div className="listing-details-row">
                      <span>{getTranslation(lang, 'quantity')}: <strong>{item.quantity} {getTranslation(lang, 'quintal')}</strong></span>
                      <span>{getTranslation(lang, 'price')}: <strong>₹{item.price}/{getTranslation(lang, 'quintal')}</strong></span>
                    </div>
                    <p className="listing-location">📍 {item.location}</p>
                    {item.description && <p className="listing-desc">"{item.description}"</p>}
                    <span className="seller-name-label">Farmer: {item.farmer_name}</span>
                  </div>

                  <button className="contact-farmer-btn" onClick={() => setSelectedSeller(item)}>
                    📞 {getTranslation(lang, 'contactSeller')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* My Listings Tab */
        <div className="mylistings-content">
          <button className="post-listing-btn" onClick={() => setIsModalOpen(true)}>
            + {getTranslation(lang, 'sellCrop')}
          </button>

          {myListings.length === 0 ? (
            <div className="empty-state card" style={{ marginTop: '16px' }}>
              <p>You haven't posted any crops for sale yet.</p>
            </div>
          ) : (
            <div className="listings-grid" style={{ marginTop: '16px' }}>
              {myListings.map(item => (
                <div key={item.id} className="listing-card card my-border">
                  <div className="listing-header">
                    <div className="crop-avatar">
                      <CropIcon name={item.crop_name} size={28} />
                    </div>
                    <div>
                      <h3>{getTranslation(lang, item.crop_name)}</h3>
                      <span className="listing-date">Posted {new Date(item.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}</span>
                    </div>
                    <button className="delete-tx-btn" onClick={() => handleDeleteListing(item.id)}>
                      ✕
                    </button>
                  </div>

                  <div className="listing-body">
                    <div className="listing-details-row">
                      <span>{getTranslation(lang, 'quantity')}: <strong>{item.quantity} {getTranslation(lang, 'quintal')}</strong></span>
                      <span>{getTranslation(lang, 'price')}: <strong>₹{item.price}/{getTranslation(lang, 'quintal')}</strong></span>
                    </div>
                    <p className="listing-location">📍 {item.location}</p>
                    {item.description && <p className="listing-desc">"{item.description}"</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post sale listing Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale-up">
            <div className="modal-header">
              <h2>{getTranslation(lang, 'sellCrop')}</h2>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreateListing} className="farmer-form">
              {/* Crop Selector */}
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'cropTypeLabel')}</label>
                <select 
                  className="select-input"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                >
                  <option value="Wheat">Wheat (गेहूं)</option>
                  <option value="Rice">Rice (धान)</option>
                  <option value="Sugarcane">Sugarcane (गन्ना)</option>
                  <option value="Mustard">Mustard (सरसों)</option>
                  <option value="Potato">Potato (आलू)</option>
                  <option value="Vegetables">Vegetables (सब्जियां)</option>
                  <option value="Other">Other Crop (अन्य)</option>
                </select>
              </div>

              {/* Quantity Stepper */}
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'qtyLabel')}</label>
                <div className="stepper-container">
                  <button type="button" className="stepper-btn minus" onClick={() => handleAdjustQty(-10)}>-10</button>
                  <button type="button" className="stepper-btn minus-small" onClick={() => handleAdjustQty(-5)}>-5</button>
                  <div className="stepper-value">
                    <span className="number">{quantity}</span>
                    <span className="unit">Quintals</span>
                  </div>
                  <button type="button" className="stepper-btn plus-small" onClick={() => handleAdjustQty(5)}>+5</button>
                  <button type="button" className="stepper-btn plus" onClick={() => handleAdjustQty(10)}>+10</button>
                </div>
              </div>

              {/* Price Stepper */}
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'priceLabel')}</label>
                <div className="stepper-container">
                  <button type="button" className="stepper-btn minus" onClick={() => handleAdjustPrice(-500)}>-500</button>
                  <button type="button" className="stepper-btn minus-small" onClick={() => handleAdjustPrice(-100)}>-100</button>
                  <div className="stepper-value">
                    <span className="number">₹{price}</span>
                    <span className="unit">/Quintal</span>
                  </div>
                  <button type="button" className="stepper-btn plus-small" onClick={() => handleAdjustPrice(100)}>+100</button>
                  <button type="button" className="stepper-btn plus" onClick={() => handleAdjustPrice(500)}>+500</button>
                </div>
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'location')}</label>
                <input
                  type="text"
                  className="text-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              {/* Quality details */}
              <div className="form-group">
                <label className="form-label">{getTranslation(lang, 'descLabel')}</label>
                <textarea
                  className="text-input"
                  rows="3"
                  placeholder="e.g. Fresh grain, organic manure used, dried to 12% moisture."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Submit */}
              <button type="submit" className="form-submit-btn">
                {getTranslation(lang, 'saveListingBtn')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Seller Contact Modal Drawer */}
      {selectedSeller && (
        <div className="modal-overlay" onClick={() => setSelectedSeller(null)}>
          <div className="modal-content animate-scale-up contact-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{getTranslation(lang, 'contactDetails')}</h2>
              <button className="close-modal-btn" onClick={() => setSelectedSeller(null)}>✕</button>
            </div>
            
            <div className="seller-contact-panel">
              <div className="seller-avatar-large">
                👤
              </div>
              <h3>{selectedSeller.farmer_name}</h3>
              <p className="seller-phone">📞 {selectedSeller.phone}</p>
              
              <div className="contact-actions-list">
                <a href={`tel:${selectedSeller.phone}`} className="contact-action-link call">
                  📞 Make Direct Call
                </a>
                <a href={`https://wa.me/91${selectedSeller.phone}?text=Hello ${selectedSeller.farmer_name}, I am interested in buying your ${selectedSeller.crop_name} listing.`} target="_blank" rel="noreferrer" className="contact-action-link whatsapp">
                  💬 Send WhatsApp Message
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
