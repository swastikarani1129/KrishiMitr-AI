// Database Service using localStorage (Supabase adapter template)

const KEYS = {
  FARMER: 'krishi_farmer',
  CROPS: 'krishi_crops',
  TRANSACTIONS: 'krishi_transactions',
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
    crop_name: 'Wheat', // Store english IDs/names for logic, translate in UI
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
