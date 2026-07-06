// Database Service using localStorage (Supabase adapter template)

const KEYS = {
  FARMER: 'krishi_farmer',
  CROPS: 'krishi_crops',
  TRANSACTIONS: 'krishi_transactions',
  DISEASE_HISTORY: 'krishi_disease',
  SOIL_TESTS: 'krishi_soil',
  REMINDERS: 'krishi_reminders',
  MARKETPLACE: 'krishi_marketplace'
};

// Seed Data
const DEFAULT_FARMER = {
  id: 'farmer_1',
  name: 'Ramesh Kumar',
  phone: '9876543210',
  language_preference: 'hi', // default to Hindi
};

const DEFAULT_CROPS = [
  {
    id: 'crop_season_1',
    farmer_id: 'farmer_1',
    crop_name: 'Wheat', // English crop name used as ID, translated dynamically
    land_size: 2.5,
    start_date: '2026-04-10',
    end_date: '',
    status: 'active',
  },
  {
    id: 'crop_season_2',
    farmer_id: 'farmer_1',
    crop_name: 'Rice',
    land_size: 1.5,
    start_date: '2025-11-01',
    end_date: '2026-03-15',
    status: 'harvested',
  },
];

const DEFAULT_TRANSACTIONS = [
  // Wheat crop (active) - Expenses
  {
    id: 't_1',
    crop_season_id: 'crop_season_1',
    type: 'expense',
    category: 'seed',
    amount: 3500,
    date: '2026-04-12',
    note: 'Sonalika wheat seeds bought from cooperative',
    input_method: 'tap',
  },
  {
    id: 't_2',
    crop_season_id: 'crop_season_1',
    type: 'expense',
    category: 'fertilizer',
    amount: 4200,
    date: '2026-05-01',
    note: 'Urea and DAP bags',
    input_method: 'voice',
  },
  {
    id: 't_3',
    crop_season_id: 'crop_season_1',
    type: 'expense',
    category: 'labor',
    amount: 2000,
    date: '2026-06-15',
    note: 'Field watering and weeding',
    input_method: 'tap',
  },
  // Rice crop (harvested) - Expenses & Income
  {
    id: 't_4',
    crop_season_id: 'crop_season_2',
    type: 'expense',
    category: 'seed',
    amount: 2500,
    date: '2025-11-05',
    note: 'Basmati rice seed',
    input_method: 'tap',
  },
  {
    id: 't_5',
    crop_season_id: 'crop_season_2',
    type: 'expense',
    category: 'fertilizer',
    amount: 3000,
    date: '2025-12-10',
    note: 'Organic compost and spraying',
    input_method: 'voice',
  },
  {
    id: 't_6',
    crop_season_id: 'crop_season_2',
    type: 'expense',
    category: 'fuel',
    amount: 1800,
    date: '2026-01-05',
    note: 'Tractor diesel for plowing',
    input_method: 'tap',
  },
  {
    id: 't_7',
    crop_season_id: 'crop_season_2',
    type: 'expense',
    category: 'labor',
    amount: 4000,
    date: '2026-03-10',
    note: 'Harvesting laborers',
    input_method: 'tap',
  },
  {
    id: 't_8',
    crop_season_id: 'crop_season_2',
    type: 'income',
    category: 'sale',
    amount: 34500,
    date: '2026-03-20',
    note: 'Sold 15 quintals of Basmati at Mandi',
    input_method: 'voice',
  },
];

const DEFAULT_DISEASE_HISTORY = [
  {
    id: 'd_1',
    crop_season_id: 'crop_season_1',
    disease_name: 'Yellow Rust', // पीला रतुआ
    confidence: 92,
    symptoms: 'Orange-yellow pustules running in rows along leaf veins. Chlorotic streaks appear on leaves.',
    treatment: 'Spray Propiconazole 25 EC (Tilt) at 1 ml/litre of water, or apply organic neem seed kernel extract.',
    prevention: 'Cultivate rust-resistant seeds like DBW-187 or HD-3226. Avoid excessive Nitrogen fertilizer.',
    created_at: '2026-06-25',
    image_name: 'wheat_rust'
  }
];

const DEFAULT_SOIL_TESTS = [
  {
    id: 's_1',
    field_name: 'Main Field A',
    ph: 6.4,
    nitrogen: 'low',
    phosphorus: 'medium',
    potassium: 'high',
    organic_carbon: 'medium',
    test_date: '2026-01-12',
    next_test_date: '2027-01-12',
    recommendation: 'Nitrogen deficiency detected. Add Urea fertilizer (approx. 40kg/acre) in 3 split doses. Plant Nitrogen-fixing legume crops next season.'
  }
];

const DEFAULT_REMINDERS = [
  {
    id: 'r_1',
    crop_season_id: 'crop_season_1',
    type: 'irrigation', // irrigation, fertilizer, spraying, soil_retest, harvest, sale
    title: 'Crown Root Irrigation (First watering)',
    date: '2026-07-09',
    status: 'pending'
  },
  {
    id: 'r_2',
    crop_season_id: 'crop_season_1',
    type: 'fertilizer',
    title: 'Apply Second Dose of Urea',
    date: '2026-07-20',
    status: 'pending'
  },
  {
    id: 'r_3',
    crop_season_id: 'crop_season_1',
    type: 'soil_retest',
    title: 'Schedule Soil Health Retest (Field A)',
    date: '2027-01-12',
    status: 'pending'
  }
];

const DEFAULT_MARKETPLACE = [
  {
    id: 'm_1',
    farmer_name: 'Ramesh Kumar',
    crop_name: 'Rice',
    quantity: 45, // quintals
    price: 2950,  // ₹ per quintal
    location: 'Karnal Mandi, Haryana',
    phone: '9876543210',
    description: 'High-quality organic Basmati rice, freshly harvested, moisture content checked (<14%).',
    date: '2026-06-30'
  },
  {
    id: 'm_2',
    farmer_name: 'Satish Singh',
    crop_name: 'Mustard',
    quantity: 20,
    price: 5400,
    location: 'Alwar Market, Rajasthan',
    phone: '9812345678',
    description: 'High oil-content black mustard seeds, cleaned and ready for oil pressing.',
    date: '2026-07-02'
  }
];

// Helper to initialize local storage
const initLocalStorage = () => {
  if (!localStorage.getItem(KEYS.FARMER)) {
    localStorage.setItem(KEYS.FARMER, JSON.stringify(DEFAULT_FARMER));
  }
  if (!localStorage.getItem(KEYS.CROPS)) {
    localStorage.setItem(KEYS.CROPS, JSON.stringify(DEFAULT_CROPS));
  }
  if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
  }
  if (!localStorage.getItem(KEYS.DISEASE_HISTORY)) {
    localStorage.setItem(KEYS.DISEASE_HISTORY, JSON.stringify(DEFAULT_DISEASE_HISTORY));
  }
  if (!localStorage.getItem(KEYS.SOIL_TESTS)) {
    localStorage.setItem(KEYS.SOIL_TESTS, JSON.stringify(DEFAULT_SOIL_TESTS));
  }
  if (!localStorage.getItem(KEYS.REMINDERS)) {
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(DEFAULT_REMINDERS));
  }
  if (!localStorage.getItem(KEYS.MARKETPLACE)) {
    localStorage.setItem(KEYS.MARKETPLACE, JSON.stringify(DEFAULT_MARKETPLACE));
  }
};

// Call init immediately
initLocalStorage();

export const db = {
  // Farmer Operations
  getFarmer() {
    return JSON.parse(localStorage.getItem(KEYS.FARMER)) || DEFAULT_FARMER;
  },
  saveFarmer(farmer) {
    localStorage.setItem(KEYS.FARMER, JSON.stringify(farmer));
    return farmer;
  },

  // Crop Season Operations
  getCropSeasons() {
    return JSON.parse(localStorage.getItem(KEYS.CROPS)) || [];
  },
  addCropSeason(crop) {
    const crops = this.getCropSeasons();
    const newCrop = {
      id: 'crop_season_' + Date.now(),
      farmer_id: 'farmer_1',
      crop_name: crop.crop_name,
      land_size: parseFloat(crop.land_size) || 0,
      start_date: crop.start_date || new Date().toISOString().split('T')[0],
      end_date: crop.end_date || '',
      status: crop.status || 'active',
    };
    crops.push(newCrop);
    localStorage.setItem(KEYS.CROPS, JSON.stringify(crops));
    return newCrop;
  },
  updateCropSeason(id, updatedFields) {
    const crops = this.getCropSeasons();
    const index = crops.findIndex(c => c.id === id);
    if (index !== -1) {
      crops[index] = { ...crops[index], ...updatedFields };
      localStorage.setItem(KEYS.CROPS, JSON.stringify(crops));
      return crops[index];
    }
    return null;
  },
  deleteCropSeason(id) {
    let crops = this.getCropSeasons();
    crops = crops.filter(c => c.id !== id);
    localStorage.setItem(KEYS.CROPS, JSON.stringify(crops));

    // Cascade delete transactions
    let transactions = this.getAllTransactions();
    transactions = transactions.filter(t => t.crop_season_id !== id);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));

    // Cascade delete disease history
    let diseases = this.getAllDiseaseHistory();
    diseases = diseases.filter(d => d.crop_season_id !== id);
    localStorage.setItem(KEYS.DISEASE_HISTORY, JSON.stringify(diseases));

    // Cascade delete reminders
    let reminders = this.getReminders();
    reminders = reminders.filter(r => r.crop_season_id !== id);
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
  },

  // Transaction Operations
  getAllTransactions() {
    return JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS)) || [];
  },
  getTransactions(cropSeasonId) {
    const txs = this.getAllTransactions();
    return txs.filter(t => t.crop_season_id === cropSeasonId);
  },
  addTransaction(tx) {
    const transactions = this.getAllTransactions();
    const newTx = {
      id: 't_' + Date.now(),
      crop_season_id: tx.crop_season_id,
      type: tx.type, // 'expense' or 'income'
      category: tx.category, // 'seed'/'fertilizer'/'labor'/'fuel'/'sale'/'other'
      amount: parseFloat(tx.amount) || 0,
      date: tx.date || new Date().toISOString().split('T')[0],
      note: tx.note || '',
      input_method: tx.input_method || 'tap',
    };
    transactions.push(newTx);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return newTx;
  },
  deleteTransaction(id) {
    let transactions = this.getAllTransactions();
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  // Disease History Operations
  getAllDiseaseHistory() {
    return JSON.parse(localStorage.getItem(KEYS.DISEASE_HISTORY)) || [];
  },
  getDiseaseHistory(cropSeasonId) {
    const records = this.getAllDiseaseHistory();
    return records.filter(r => r.crop_season_id === cropSeasonId);
  },
  addDiseaseHistory(record) {
    const records = this.getAllDiseaseHistory();
    const newRecord = {
      id: 'd_' + Date.now(),
      crop_season_id: record.crop_season_id,
      disease_name: record.disease_name,
      confidence: record.confidence || 90,
      symptoms: record.symptoms || '',
      treatment: record.treatment || '',
      prevention: record.prevention || '',
      created_at: record.created_at || new Date().toISOString().split('T')[0],
      image_name: record.image_name || 'leaf_placeholder'
    };
    records.push(newRecord);
    localStorage.setItem(KEYS.DISEASE_HISTORY, JSON.stringify(records));
    return newRecord;
  },
  deleteDiseaseHistory(id) {
    let records = this.getAllDiseaseHistory();
    records = records.filter(r => r.id !== id);
    localStorage.setItem(KEYS.DISEASE_HISTORY, JSON.stringify(records));
  },

  // Soil Test Operations
  getSoilTests() {
    return JSON.parse(localStorage.getItem(KEYS.SOIL_TESTS)) || [];
  },
  addSoilTest(test) {
    const tests = this.getSoilTests();
    const newTest = {
      id: 's_' + Date.now(),
      field_name: test.field_name || 'Field A',
      ph: parseFloat(test.ph) || 7.0,
      nitrogen: test.nitrogen || 'medium',
      phosphorus: test.phosphorus || 'medium',
      potassium: test.potassium || 'medium',
      organic_carbon: test.organic_carbon || 'medium',
      test_date: test.test_date || new Date().toISOString().split('T')[0],
      next_test_date: test.next_test_date || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      recommendation: test.recommendation || 'Soil levels are normal.'
    };
    tests.push(newTest);
    localStorage.setItem(KEYS.SOIL_TESTS, JSON.stringify(tests));

    // Automatically create a reminder for retest in 1 year
    this.addReminder({
      crop_season_id: '',
      type: 'soil_retest',
      title: `Schedule Soil Health Retest (${newTest.field_name})`,
      date: newTest.next_test_date,
      status: 'pending'
    });

    return newTest;
  },
  deleteSoilTest(id) {
    let tests = this.getSoilTests();
    tests = tests.filter(t => t.id !== id);
    localStorage.setItem(KEYS.SOIL_TESTS, JSON.stringify(tests));
  },

  // Reminder Operations
  getReminders() {
    return JSON.parse(localStorage.getItem(KEYS.REMINDERS)) || [];
  },
  addReminder(reminder) {
    const reminders = this.getReminders();
    const newReminder = {
      id: 'r_' + Date.now(),
      crop_season_id: reminder.crop_season_id || '',
      type: reminder.type || 'irrigation', // irrigation, fertilizer, spraying, soil_retest, harvest, sale, market
      title: reminder.title || 'Farming Alert',
      date: reminder.date || new Date().toISOString().split('T')[0],
      status: reminder.status || 'pending'
    };
    reminders.push(newReminder);
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
    return newReminder;
  },
  updateReminder(id, updatedFields) {
    const reminders = this.getReminders();
    const index = reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      reminders[index] = { ...reminders[index], ...updatedFields };
      localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
      return reminders[index];
    }
    return null;
  },
  deleteReminder(id) {
    let reminders = this.getReminders();
    reminders = reminders.filter(r => r.id !== id);
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
  },

  // Marketplace Operations
  getMarketplaceListings() {
    return JSON.parse(localStorage.getItem(KEYS.MARKETPLACE)) || [];
  },
  addMarketplaceListing(listing) {
    const listings = this.getMarketplaceListings();
    const newListing = {
      id: 'm_' + Date.now(),
      farmer_name: listing.farmer_name || 'Ramesh Kumar',
      crop_name: listing.crop_name || 'Wheat',
      quantity: parseFloat(listing.quantity) || 0,
      price: parseFloat(listing.price) || 0,
      location: listing.location || 'Karnal Mandi',
      phone: listing.phone || '9876543210',
      description: listing.description || '',
      date: new Date().toISOString().split('T')[0]
    };
    listings.push(newListing);
    localStorage.setItem(KEYS.MARKETPLACE, JSON.stringify(listings));
    return newListing;
  },
  deleteMarketplaceListing(id) {
    let listings = this.getMarketplaceListings();
    listings = listings.filter(m => m.id !== id);
    localStorage.setItem(KEYS.MARKETPLACE, JSON.stringify(listings));
  },

  // Calculation utilities
  getCropStats(cropSeasonId) {
    const txs = this.getTransactions(cropSeasonId);
    let totalIncome = 0;
    let totalExpense = 0;
    txs.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    });
    return {
      income: totalIncome,
      expense: totalExpense,
      profit: totalIncome - totalExpense,
      transactionsCount: txs.length,
    };
  },
};
