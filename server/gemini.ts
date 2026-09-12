import { GoogleGenAI } from '@google/genai';
import { ImageAnalysisResult } from './db.js';

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn('Could not initialize GoogleGenAI client:', err);
    }
  }
  return aiClient;
}

export interface ParsedNLReport {
  category?: string;
  itemType?: string;
  brand?: string;
  model?: string;
  colour?: string;
  hasCase?: boolean;
  caseColour?: string;
  location?: string;
  approxTime?: string;
  physicalMarks?: string;
  isTheftSuspicious?: boolean;
  theftNotes?: string;
  conversationalReply?: string;
  attributes?: Record<string, any>;
}

// Fallback rule-based extractor for English, Tamil, and Tanglish phrases
export function fallbackRuleParser(text: string): ParsedNLReport {
  const t = text.toLowerCase();
  const res: ParsedNLReport = {
    attributes: {},
  };

  // Check theft indicators
  if (
    t.includes('stolen') || 
    t.includes('thief') || 
    t.includes('someone took') || 
    t.includes('theft') || 
    t.includes('suspicious') ||
    t.includes('thiruditaanga') ||
    t.includes('thirudan') ||
    t.includes('eduthutaanga')
  ) {
    res.isTheftSuspicious = true;
    res.theftNotes = 'User flagged item as suspected stolen or missing under suspicious circumstances';
  }

  // Brands
  if (t.includes('apple') || t.includes('iphone') || t.includes('ipad') || t.includes('macbook') || t.includes('airpods') || t.includes('iwatch')) {
    res.brand = 'Apple';
  } else if (t.includes('samsung') || t.includes('galaxy')) {
    res.brand = 'Samsung';
  } else if (t.includes('oneplus') || t.includes('nord')) {
    res.brand = 'OnePlus';
  } else if (t.includes('dell')) {
    res.brand = 'Dell';
  } else if (t.includes('hp') || t.includes('victus') || t.includes('pavilion')) {
    res.brand = 'HP';
  } else if (t.includes('lenovo') || t.includes('thinkpad') || t.includes('ideapad')) {
    res.brand = 'Lenovo';
  } else if (t.includes('asus') || t.includes('rog') || t.includes('tuf')) {
    res.brand = 'Asus';
  } else if (t.includes('acer') || t.includes('predator') || t.includes('nitro')) {
    res.brand = 'Acer';
  } else if (t.includes('boat') || t.includes('boAt') || t.includes('airdopes') || t.includes('rockerz')) {
    res.brand = 'boAt';
  } else if (t.includes('noise') || t.includes('colorfit')) {
    res.brand = 'Noise';
  } else if (t.includes('sony')) {
    res.brand = 'Sony';
  } else if (t.includes('fastrack')) {
    res.brand = 'Fastrack';
  } else if (t.includes('realme')) {
    res.brand = 'Realme';
  } else if (t.includes('redmi') || t.includes('xiaomi') || t.includes('mi ')) {
    res.brand = 'Xiaomi / Redmi';
  } else if (t.includes('vivo')) {
    res.brand = 'Vivo';
  } else if (t.includes('oppo')) {
    res.brand = 'Oppo';
  } else if (t.includes('pixel')) {
    res.brand = 'Google Pixel';
  } else if (t.includes('wildcraft')) {
    res.brand = 'Wildcraft';
  } else if (t.includes('titan')) {
    res.brand = 'Titan';
  }

  // Categories & Specific Item Types
  if (t.includes('id card') || t.includes('student id') || t.includes('college id') || t.includes('identity card') || t.includes('hall ticket')) {
    res.category = 'Documents / Cards';
    res.itemType = 'College ID Card';
  } else if (t.includes('iphone') || t.includes('phone') || t.includes('mobile') || t.includes('cellphone') || t.includes('s23') || t.includes('s24') || t.includes('galaxy s')) {
    res.category = 'Electronics';
    res.itemType = 'Phone';
  } else if (t.includes('macbook') || t.includes('laptop') || t.includes('notebook pc') || t.includes('thinkpad') || t.includes('pavilion') || t.includes('victus')) {
    res.category = 'Electronics';
    res.itemType = 'Laptop';
  } else if (t.includes('ipad') || t.includes('tablet') || t.includes('tab ')) {
    res.category = 'Electronics';
    res.itemType = 'Tablet';
  } else if (t.includes('smartwatch') || t.includes('smart watch') || t.includes('apple watch') || t.includes('iwatch') || t.includes('galaxy watch')) {
    res.category = 'Electronics';
    res.itemType = 'Smart Watch';
  } else if (t.includes('airpods') || t.includes('earbuds') || t.includes('earphone') || t.includes('tws') || t.includes('headphones') || t.includes('headphone') || t.includes('buds')) {
    res.category = 'Electronics';
    res.itemType = 'Earbuds / Headphones';
  } else if (t.includes('charger') || t.includes('adapter') || t.includes('power brick') || t.includes('charging wire')) {
    res.category = 'Electronics';
    res.itemType = 'Charger';
  } else if (t.includes('power bank') || t.includes('powerbank')) {
    res.category = 'Electronics';
    res.itemType = 'Power Bank';
  } else if (t.includes('wallet') || t.includes('purse') || t.includes('money purse') || t.includes('billfold')) {
    res.category = 'Personal Items';
    res.itemType = 'Wallet';
  } else if (t.includes('key') || t.includes('keys') || t.includes('bike key') || t.includes('car key') || t.includes('keychain')) {
    res.category = 'Personal Items';
    res.itemType = 'Keys';
  } else if (t.includes('bag') || t.includes('backpack') || t.includes('handbag') || t.includes('college bag') || t.includes('sling bag')) {
    res.category = 'Personal Items';
    res.itemType = 'Bag';
  } else if (t.includes('bottle') || t.includes('water bottle')) {
    res.category = 'Personal Items';
    res.itemType = 'Other Personal Item';
    res.attributes!.itemDescription = 'Water Bottle';
  } else if (t.includes('umbrella')) {
    res.category = 'Personal Items';
    res.itemType = 'Other Personal Item';
    res.attributes!.itemDescription = 'Umbrella';
  } else if (t.includes('calculator')) {
    res.category = 'College / Study Items';
    res.itemType = 'Other Personal Item';
    res.attributes!.itemDescription = 'Scientific Calculator';
  }

  // Model detection
  if (t.includes('s23 ultra')) res.model = 'Galaxy S23 Ultra';
  else if (t.includes('s23')) res.model = 'Galaxy S23 / S23 FE';
  else if (t.includes('s24 ultra')) res.model = 'Galaxy S24 Ultra';
  else if (t.includes('s24')) res.model = 'Galaxy S24 / S24+';
  else if (t.includes('iphone 16 pro max')) res.model = 'iPhone 16 Pro Max';
  else if (t.includes('iphone 16 pro')) res.model = 'iPhone 16 Pro';
  else if (t.includes('iphone 16')) res.model = 'iPhone 16';
  else if (t.includes('iphone 15 pro max')) res.model = 'iPhone 15 Pro Max';
  else if (t.includes('iphone 15 pro')) res.model = 'iPhone 15 Pro';
  else if (t.includes('iphone 15')) res.model = 'iPhone 15';
  else if (t.includes('iphone 14')) res.model = 'iPhone 14';
  else if (t.includes('iphone 13')) res.model = 'iPhone 13';
  else if (t.includes('iphone 12')) res.model = 'iPhone 12 / 12 Mini';
  else if (t.includes('iphone 11')) res.model = 'iPhone 11';
  else if (t.includes('macbook air m3')) res.model = 'MacBook Air M3 (13" / 15")';
  else if (t.includes('macbook air m2')) res.model = 'MacBook Air M2 (13" / 15")';
  else if (t.includes('macbook air m1') || t.includes('m1 macbook')) res.model = 'MacBook Air M1';
  else if (t.includes('macbook pro')) res.model = 'MacBook Pro 14" (M1/M2/M3)';
  else if (t.includes('nord ce 4')) res.model = 'OnePlus Nord CE 4';
  else if (t.includes('oneplus 12')) res.model = 'OnePlus 12 / 12R';
  else if (t.includes('airdopes 141')) res.model = 'Airdopes 141 / 141 ANC';

  // Specific Department for ID card
  const deptList = ['ai&ds', 'aids', 'cse', 'ai&ml', 'aiml', 'ece', 'mechatronics', 'bio tech', 'biotech', 'agri', 'it', 'eee', 'mech', 'civil'];
  for (const d of deptList) {
    if (t.includes(d)) {
      if (d === 'aids' || d === 'ai&ds') res.attributes!.department = 'AI&DS';
      else if (d === 'cse') res.attributes!.department = 'CSE';
      else if (d === 'aiml' || d === 'ai&ml') res.attributes!.department = 'AI&ML';
      else if (d === 'ece') res.attributes!.department = 'ECE';
      else if (d === 'mechatronics') res.attributes!.department = 'MECHATRONICS';
      else if (d === 'biotech' || d === 'bio tech') res.attributes!.department = 'BIO TECH';
      else if (d === 'agri') res.attributes!.department = 'AGRI';
      break;
    }
  }

  // Colours
  const colours = [
    { key: 'black', label: 'Black' },
    { key: 'blue', label: 'Midnight / Navy Blue' },
    { key: 'white', label: 'White' },
    { key: 'red', label: 'Red' },
    { key: 'green', label: 'Green / Olive' },
    { key: 'silver', label: 'Silver / Grey' },
    { key: 'space grey', label: 'Space Grey' },
    { key: 'gold', label: 'Gold / Starlight' },
    { key: 'purple', label: 'Purple / Violet' },
    { key: 'yellow', label: 'Yellow / Orange' },
    { key: 'brown', label: 'Dark Brown' },
  ];
  for (const c of colours) {
    if (t.includes(c.key)) {
      if (t.includes(`${c.key} case`) || t.includes(`${c.key} cover`)) {
        res.caseColour = c.label;
        res.hasCase = true;
        res.attributes!.caseColour = c.label;
        res.attributes!.hasCase = 'Yes';
      } else if (!res.colour) {
        res.colour = c.label;
        res.attributes!.colour = c.label;
      }
    }
  }

  // Tamil/Tanglish Case phrases: "blue cover irukku", "red cover la", "cover poturukku"
  if (t.includes('cover') || t.includes('case') || t.includes('pouch')) {
    res.hasCase = true;
    res.attributes!.hasCase = 'Yes';
    const match = t.match(/([a-z]+)\s*(?:case|cover|pouch)/i);
    if (match && !res.caseColour) {
      const colWord = match[1].toLowerCase();
      const matchedCol = colours.find(c => c.key === colWord);
      if (matchedCol) {
        res.caseColour = matchedCol.label;
        res.attributes!.caseColour = matchedCol.label;
      } else {
        res.caseColour = match[1].charAt(0).toUpperCase() + match[1].slice(1);
        res.attributes!.caseColour = res.caseColour;
      }
    }
  }

  // Stickers / Marks
  if (t.includes('sticker')) {
    const stickerMatch = t.match(/([a-z0-9\s]+)\s*sticker/i);
    const stickerDetail = stickerMatch ? stickerMatch[0].trim() : 'Sticker attached';
    res.physicalMarks = stickerDetail;
    res.attributes!.stickers = stickerDetail;
    res.attributes!.safeUniqueDetails = stickerDetail;
  }

  // Keys specific
  if (res.itemType === 'Keys') {
    if (t.includes('bike') || t.includes('royal enfield') || t.includes('yamaha') || t.includes('honda')) {
      res.attributes!.keyType = 'Two-Wheeler / Bike Ignition Key (Yamaha, Honda, Royal Enfield, etc.)';
    }
    if (t.includes('royal enfield')) {
      res.attributes!.keychainDesign = 'Royal Enfield emblem';
    }
    if (t.includes('metal')) {
      res.attributes!.keychainType = 'Metal Keychain / Medallion';
    }
  }

  // Wallet specific
  if (res.itemType === 'Wallet') {
    if (t.includes('leather')) {
      res.attributes!.material = 'Genuine Leather (Textured / Grain)';
    }
    if (t.includes('cash') || t.includes('money')) {
      res.attributes!.contentsCategory = ['Cash currency bills present'];
    }
    if (t.includes('bus pass') || t.includes('pass')) {
      res.attributes!.contentsCategory = [...(res.attributes!.contentsCategory || []), 'Bus Pass / Metro card'];
    }
  }

  // Location detection
  if (t.includes('canteen') || t.includes('cafeteria')) {
    res.location = 'Canteen';
  } else if (t.includes('library') || t.includes('reading room')) {
    res.location = 'Library';
  } else if (t.includes('lab') || t.includes('laboratory') || t.includes('computer center')) {
    res.location = 'Lab';
  } else if (t.includes('classroom') || t.includes('class') || t.includes('lecture hall')) {
    res.location = 'Classroom';
  } else if (t.includes('parking') || t.includes('bike stand')) {
    res.location = 'Parking';
  } else if (t.includes('hostel') || t.includes('mess') || t.includes('dorm')) {
    res.location = 'Hostel';
  } else if (t.includes('bus') || t.includes('college bus')) {
    res.location = 'Bus';
  } else if (t.includes('ground') || t.includes('stadium') || t.includes('sports complex')) {
    res.location = 'Ground';
  }

  // Build conversational acknowledgment
  const parts: string[] = [];
  if (res.colour && res.colour !== 'Unknown') parts.push(res.colour.toLowerCase());
  if (res.brand && res.brand !== 'Unknown') parts.push(res.brand);
  if (res.model && res.model !== 'Unknown') parts.push(res.model);
  else if (res.itemType) parts.push(res.itemType);

  const itemPhrase = parts.length > 0 ? parts.join(' ') : 'item';
  let casePhrase = '';
  if (res.hasCase && res.caseColour) {
    casePhrase = ` with a ${res.caseColour.toLowerCase()} cover`;
  } else if (res.attributes?.stickers) {
    casePhrase = ` with ${res.attributes.stickers}`;
  }

  res.conversationalReply = `Got it 👍 ${itemPhrase}${casePhrase}. I've filled in what you told me — please verify or answer the remaining questions below:`;

  return res;
}

export async function parseNaturalLanguageInput(userInput: string): Promise<ParsedNLReport> {
  const fallback = fallbackRuleParser(userInput);
  const ai = getGenAI();

  if (!ai) {
    return fallback;
  }

  try {
    const prompt = `You are CampusFind AI, an intelligent college Lost & Found parser.
Analyze this user report describing a lost or found item. The user may write in English, Tamil, or Tanglish (mixed Tamil-English, e.g. "Enoda black iPhone 13 blue case oda canteen la miss aachu", or "Black Samsung S23 da, blue cover irukku").

Extract the key details into pure JSON with NO markdown fences:
{
  "category": "Electronics | Personal Items | College / Study Items | Clothing | Documents / Cards | Other",
  "itemType": "Phone | Laptop | Tablet | Smart Watch | Earbuds / Headphones | Charger | Power Bank | Wallet | Keys | Bag | College ID Card | Other Personal Item",
  "brand": "string or Unknown",
  "model": "string or Unknown",
  "colour": "string or Unknown",
  "hasCase": boolean,
  "caseColour": "string or Unknown",
  "location": "Canteen | Library | Lab | Classroom | Parking | Hostel | Bus | Ground | Other",
  "approxTime": "Morning | Afternoon | Evening | specific time or Unknown",
  "physicalMarks": "string or Unknown",
  "isTheftSuspicious": boolean,
  "theftNotes": "string or null",
  "conversationalReply": "A concise, friendly acknowledgment (e.g. 'Got it 👍 Samsung Galaxy S23, black colour with a blue cover. Here are a few quick details to help identify it:')",
  "attributes": {
    "department": "e.g. CSE | AI&DS | ECE (for ID cards if mentioned)",
    "institutionName": "college name if mentioned",
    "stickers": "sticker details if mentioned",
    "material": "leather/canvas etc (for wallet/bag if mentioned)",
    "keyType": "bike key/room key etc if mentioned",
    "keychainDesign": "keychain text/logo if mentioned"
  }
}

User input: "${userInput}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const rawText = response.text || '';
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      ...fallback,
      ...parsed,
    };
  } catch (err) {
    console.warn('Gemini NLP parse failed, utilizing robust fallback extractor:', err);
    return fallback;
  }
}

export async function analyzeItemImage(imageDataUrl: string): Promise<ImageAnalysisResult> {
  const ai = getGenAI();

  // Basic fallback analysis if API key is not yet set up
  const fallbackResult: ImageAnalysisResult = {
    isEstimated: true,
    colour: 'Estimated from visual photo',
    shape: 'Handheld / standard item profile',
    notes: 'AI analysis is an estimate and is not 100% certain.',
  };

  if (!ai) {
    return fallbackResult;
  }

  try {
    // Extract base64 and mime type
    const matches = imageDataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches) {
      return fallbackResult;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const prompt = `Analyze this college lost/found item photo.
Visible characteristics only. If something is not clearly visible, mark as Unknown.
Output strictly JSON without markdown fences:
{
  "colour": "dominant colour or Unknown",
  "shape": "shape/profile description or Unknown",
  "brand": "visible logo/brand or Unknown",
  "model": "apparent model or Unknown",
  "caseDetails": "case present, case colour, design or Unknown",
  "marks": "visible scratches, cracks, stickers, dents or Unknown",
  "notes": "Short concise summary. End with: AI analysis is an estimate and is not 100% certain."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    const rawText = response.text || '';
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      colour: parsed.colour || 'Unknown',
      shape: parsed.shape || 'Unknown',
      brand: parsed.brand || 'Unknown',
      model: parsed.model || 'Unknown',
      caseDetails: parsed.caseDetails || 'Unknown',
      marks: parsed.marks || 'Unknown',
      isEstimated: true,
      notes: parsed.notes || 'AI analysis is an estimate and is not 100% certain.',
    };
  } catch (err) {
    console.warn('Image analysis failed, falling back:', err);
    return fallbackResult;
  }
}
