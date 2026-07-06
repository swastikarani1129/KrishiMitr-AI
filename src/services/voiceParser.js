// Voice parsing service for English and Hindi speech input.
// Integrates Genkit backend flows with local keyword-matching fallbacks.

// Map Hindi numbers to digits (fallback)
const HINDI_NUMBERS = {
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'सौ': 100, 'हजार': 1000, 'लाख': 100000
};

const ENGLISH_NUMBERS = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'hundred': 100, 'thousand': 1000, 'lakh': 100000
};

function extractAmountFallback(text) {
  const digitRegex = /\b\d+\b/g;
  const digitMatches = text.match(digitRegex);
  if (digitMatches && digitMatches.length > 0) {
    return parseInt(digitMatches[0], 10);
  }

  const lowercaseText = text.toLowerCase();
  let parsedAmount = 0;
  
  if (lowercaseText.includes('हजार')) {
    const parts = lowercaseText.split('हजार');
    const prefix = parts[0].trim().split(/\s+/).pop();
    const multiplier = HINDI_NUMBERS[prefix] || parseInt(prefix, 10) || 1;
    parsedAmount += multiplier * 1000;
  }
  if (lowercaseText.includes('सौ') && !lowercaseText.includes('हजार')) {
    const parts = lowercaseText.split('सौ');
    const prefix = parts[0].trim().split(/\s+/).pop();
    const multiplier = HINDI_NUMBERS[prefix] || parseInt(prefix, 10) || 1;
    parsedAmount += multiplier * 100;
  }

  if (lowercaseText.includes('thousand')) {
    const parts = lowercaseText.split('thousand');
    const prefix = parts[0].trim().split(/\s+/).pop();
    const multiplier = ENGLISH_NUMBERS[prefix] || parseInt(prefix, 10) || 1;
    parsedAmount += multiplier * 1000;
  }
  if (lowercaseText.includes('hundred') && !lowercaseText.includes('thousand')) {
    const parts = lowercaseText.split('hundred');
    const prefix = parts[0].trim().split(/\s+/).pop();
    const multiplier = ENGLISH_NUMBERS[prefix] || parseInt(prefix, 10) || 1;
    parsedAmount += multiplier * 100;
  }

  if (parsedAmount === 0) {
    const words = lowercaseText.split(/\s+/);
    for (let word of words) {
      if (HINDI_NUMBERS[word]) parsedAmount += HINDI_NUMBERS[word];
      if (ENGLISH_NUMBERS[word]) parsedAmount += ENGLISH_NUMBERS[word];
    }
  }

  return parsedAmount > 0 ? parsedAmount : null;
}

export const parseVoiceInput = async (text, activeCrops = []) => {
  if (!text) return null;
  const lowercase = text.toLowerCase();

  // Find suggested crop season
  let suggestedCropId = activeCrops.length > 0 ? activeCrops[0].id : '';
  const cropKeywords = {
    'Wheat': ['wheat', 'gehun', 'गेहूं', 'गेंहू'],
    'Rice': ['rice', 'dhan', 'paddy', 'धान', 'चावल'],
    'Sugarcane': ['sugarcane', 'ganna', 'गन्ना'],
    'Mustard': ['mustard', 'sarso', 'सरसों'],
    'Potato': ['potato', 'aloo', 'आलू'],
    'Vegetables': ['vegetables', 'sabji', 'sabzi', 'सब्जी', 'सब्जियां'],
  };

  let matchedCropName = '';
  outerCrop:
  for (let cName in cropKeywords) {
    for (let kw of cropKeywords[cName]) {
      if (lowercase.includes(kw)) {
        matchedCropName = cName;
        break outerCrop;
      }
    }
  }

  if (matchedCropName && activeCrops.length > 0) {
    const matchedCrop = activeCrops.find(c => c.crop_name.toLowerCase() === matchedCropName.toLowerCase());
    if (matchedCrop) {
      suggestedCropId = matchedCrop.id;
    }
  }

  // 1. Try Genkit AI Flow first
  try {
    const response = await fetch('http://localhost:3400/voiceParserFlow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: { text } })
    });

    if (response.ok) {
      const json = await response.json();
      const parsed = json.result;
      if (parsed) {
        console.log("Structured transaction extracted successfully via Genkit:", parsed);
        return {
          amount: parsed.amount || 0,
          type: parsed.type || 'expense',
          category: parsed.category || 'other',
          crop_season_id: suggestedCropId,
          note: parsed.note || text,
          input_method: 'voice'
        };
      }
    }
  } catch (err) {
    console.warn("KishanMitr Genkit server offline. Using local offline keyword matcher.");
  }

  // 2. Fallback to local regex/heuristics matching
  let type = 'expense';
  const incomeKeywords = [
    'sale', 'sold', 'profit', 'income', 'earned', 'received', 'sell',
    'बेचा', 'बेची', 'बिक्री', 'कमाई', 'मिला', 'मिले', 'आया', 'प्राप्त'
  ];
  for (let kw of incomeKeywords) {
    if (lowercase.includes(kw)) {
      type = 'income';
      break;
    }
  }

  const amount = extractAmountFallback(text) || 0;
  let category = 'other';
  
  if (type === 'income') {
    category = 'sale';
  } else {
    const categoryKeywords = {
      seed: ['seed', 'seeds', 'sowing', 'बीज', 'बोने'],
      fertilizer: ['fertilizer', 'urea', 'dap', 'compost', 'manure', 'खाद', 'उर्वरक', 'यूरिया', 'गोबर'],
      labor: ['labor', 'laborer', 'laborers', 'work', 'weeding', 'watering', 'मजदूर', 'मजदूरी', 'पानी', 'निकाई', 'कटाई'],
      pesticides: ['pesticide', 'pesticides', 'spray', 'medicine', 'insecticide', 'दवाई', 'कीटनाशक', 'छिड़काव', 'स्प्रे'],
      fuel: ['fuel', 'diesel', 'diesel cost', 'tractor', 'plow', 'plowing', 'डीजल', 'तेल', 'टैक्टर', 'जुताई'],
    };

    outerLoop:
    for (let cat in categoryKeywords) {
      for (let kw of categoryKeywords[cat]) {
        if (lowercase.includes(kw)) {
          category = cat;
          break outerLoop;
        }
      }
    }
  }

  return {
    amount,
    type,
    category,
    crop_season_id: suggestedCropId,
    note: text,
    input_method: 'voice',
  };
};
