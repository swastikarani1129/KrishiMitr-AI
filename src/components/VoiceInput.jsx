import React, { useState, useEffect, useRef } from 'react';
import { getTranslation } from '../services/translations';
import { db } from '../services/db';
import { parseVoiceInput } from '../services/voiceParser';

export default function VoiceInput({ lang, onBack, showToast }) {
  const activeCrops = db.getCropSeasons().filter(c => c.status === 'active');

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState(''); // Fallback simulation input
  const [parsedData, setParsedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'; // Set language locale

      rec.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Try typing your phrase below.');
        } else {
          setErrorMessage('Speech not recognized. Try again or type below.');
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        setTranscript(speechToText);
        handleParse(speechToText);
      };

      recognitionRef.current = rec;
    } else {
      setErrorMessage('Voice recognition not supported in this browser. Use the typing simulator below.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang]);

  // Parse text using our voice parser
  const handleParse = (text) => {
    if (!text) return;
    const parsed = parseVoiceInput(text, activeCrops);
    setParsedData(parsed);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported on this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setParsedData(null);
      recognitionRef.current.start();
    }
  };

  // Handler for text typing fallback
  const handleSimulateTextSubmit = (e) => {
    e.preventDefault();
    if (!manualText) return;
    setTranscript(manualText);
    handleParse(manualText);
    setManualText('');
  };

  // Save the confirmed transaction
  const handleConfirmSave = () => {
    if (!parsedData) return;
    if (!parsedData.crop_season_id) {
      alert('Please select a Crop Season to log this transaction.');
      return;
    }
    if (parsedData.amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    db.addTransaction({
      crop_season_id: parsedData.crop_season_id,
      type: parsedData.type,
      category: parsedData.category,
      amount: parsedData.amount,
      date: new Date().toISOString().split('T')[0],
      note: parsedData.note || 'Voice Logged',
      input_method: 'voice'
    });

    showToast(getTranslation(lang, 'successSave'));
    onBack();
  };

  const handleStartOver = () => {
    setTranscript('');
    setParsedData(null);
    setErrorMessage('');
  };

  // Form field modification handlers
  const updateParsedField = (field, value) => {
    setParsedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="voice-input-view animate-fade-in">
      <div className="form-header">
        <button className="icon-back-btn" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>{getTranslation(lang, 'backBtn')}</span>
        </button>
        <h1>{getTranslation(lang, 'voiceTitle')}</h1>
      </div>

      {activeCrops.length === 0 ? (
        <div className="empty-state card">
          <p>Please add an active Crop Season first before using voice input.</p>
        </div>
      ) : (
        <div className="voice-container">
          {!parsedData ? (
            <div className="voice-mic-panel card">
              <p className="voice-prompt-text">{getTranslation(lang, 'voicePrompt')}</p>
              
              {/* Pulsing Mic Button */}
              <div className="mic-outer-ring">
                <button 
                  type="button" 
                  className={`mic-button ${isListening ? 'listening' : ''}`}
                  onClick={toggleListening}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="22"></line>
                  </svg>
                </button>
                {isListening && (
                  <>
                    <div className="pulse-ring ring-1"></div>
                    <div className="pulse-ring ring-2"></div>
                  </>
                )}
              </div>

              <div className="voice-status-text">
                {isListening ? getTranslation(lang, 'listening') : getTranslation(lang, 'speakBtn')}
              </div>

              {errorMessage && <p className="error-text">{errorMessage}</p>}

              <div className="example-block">
                <span>{lang === 'hi' ? getTranslation(lang, 'voiceExampleHi') : getTranslation(lang, 'voiceExampleEn')}</span>
              </div>

              {/* Text simulation fallback */}
              <form onSubmit={handleSimulateTextSubmit} className="text-simulator-form">
                <div className="divider">
                  <span>OR SIMULATE SPEECH</span>
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    className="text-input text-sim"
                    placeholder={lang === 'hi' ? 'जैसे: गेहूँ खाद 800 रुपया' : 'e.g. 500 rupees fertilizer for wheat'}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                  />
                  <button type="submit" className="simulate-btn">
                    Parse
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Parsed results confirmation view */
            <div className="voice-review-panel card animate-scale-up">
              <h2>{getTranslation(lang, 'parsedTitle')}</h2>
              
              <div className="transcription-bubble">
                <span className="quote-mark">“</span>
                <p>{transcript}</p>
                <span className="quote-mark">”</span>
              </div>

              <div className="parsed-form-grid">
                {/* Amount Field */}
                <div className="parsed-field">
                  <span className="field-label">Amount (रुपये)</span>
                  <div className="field-value-wrapper">
                    <span className="field-currency">₹</span>
                    <input
                      type="number"
                      className="parsed-input-amount"
                      value={parsedData.amount}
                      onChange={(e) => updateParsedField('amount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Transaction Type */}
                <div className="parsed-field">
                  <span className="field-label">Type (प्रकार)</span>
                  <div className="parsed-toggle-row">
                    <button
                      type="button"
                      className={`parsed-toggle-btn expense ${parsedData.type === 'expense' ? 'selected' : ''}`}
                      onClick={() => updateParsedField('type', 'expense')}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      className={`parsed-toggle-btn income ${parsedData.type === 'income' ? 'selected' : ''}`}
                      onClick={() => {
                        updateParsedField('type', 'income');
                        updateParsedField('category', 'sale');
                      }}
                    >
                      Income
                    </button>
                  </div>
                </div>

                {/* Crop Season Selector */}
                <div className="parsed-field">
                  <span className="field-label">Crop Season (फसल)</span>
                  <select
                    className="parsed-select"
                    value={parsedData.crop_season_id}
                    onChange={(e) => updateParsedField('crop_season_id', e.target.value)}
                  >
                    {activeCrops.map(c => (
                      <option key={c.id} value={c.id}>
                        {getTranslation(lang, c.crop_name)} ({c.land_size} Acres)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Selector */}
                <div className="parsed-field">
                  <span className="field-label">Category (श्रेणी)</span>
                  <select
                    className="parsed-select"
                    value={parsedData.category}
                    onChange={(e) => updateParsedField('category', e.target.value)}
                  >
                    {parsedData.type === 'expense' ? (
                      <>
                        <option value="seed">Seeds (बीज)</option>
                        <option value="fertilizer">Fertilizer (खाद)</option>
                        <option value="labor">Labor (मजदूर)</option>
                        <option value="pesticides">Pesticides (दवाई)</option>
                        <option value="fuel">Fuel/Tractor (डीजल)</option>
                        <option value="other">Other Expense (अन्य)</option>
                      </>
                    ) : (
                      <>
                        <option value="sale">Sale of Crop (बिक्री)</option>
                        <option value="other">Other Income (अन्य)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Note Description */}
                <div className="parsed-field span-2">
                  <span className="field-label">Note Description (विवरण)</span>
                  <input
                    type="text"
                    className="parsed-text-input"
                    value={parsedData.note}
                    onChange={(e) => updateParsedField('note', e.target.value)}
                  />
                </div>
              </div>

              {/* Confirm Actions */}
              <div className="parsed-actions">
                <button type="button" className="cancel-btn" onClick={handleStartOver}>
                  {getTranslation(lang, 'cancelBtn')}
                </button>
                <button type="button" className="confirm-btn" onClick={handleConfirmSave}>
                  {getTranslation(lang, 'confirmBtn')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
