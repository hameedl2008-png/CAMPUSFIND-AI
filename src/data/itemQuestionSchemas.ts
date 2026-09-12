// Dynamic Question Schemas for CampusFind AI
// Adheres strictly to the item-specific questioning engine rules:
// Category -> Specific Item Type -> Relevant Questions ONLY.
// Irrelevant questions (e.g. brand/model/RAM/IMEI on ID cards or keys) are never shown.

export interface QuestionOption {
  value: string;
  label: string;
}

export interface DynamicQuestion {
  id: string;
  label: string;
  type: 'select' | 'text' | 'textarea' | 'radio' | 'checkbox-group';
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  options?: (string | QuestionOption)[];
  helperText?: string;
  dependsOnBrand?: boolean;
  condition?: (answers: Record<string, any>) => boolean;
  privacyNotice?: string;
}

export interface ItemTypeSchema {
  schemaKey: string;
  title: string;
  category: string;
  description: string;
  questions: DynamicQuestion[];
}

export const CATEGORY_ITEMS: Record<string, string[]> = {
  'Personal Items': [
    'Phone',
    'Laptop',
    'Tablet',
    'Smart Watch',
    'Earbuds / Headphones',
    'Charger',
    'Power Bank',
    'Wallet',
    'Keys',
    'Bag',
    'Water Bottle',
    'Spectacles / Sunglasses',
    'Umbrella',
    'Other Personal Item',
  ],
  'Electronics': [
    'Phone',
    'Laptop',
    'Tablet',
    'Smart Watch',
    'Earbuds / Headphones',
    'Charger',
    'Power Bank',
    'Bluetooth Speaker',
    'Pendrive / USB Drive',
    'Hard Drive',
    'Calculator',
    'Other Electronic Device',
  ],
  'Documents / Cards': [
    'College ID Card',
    'Student ID Card',
    'Driving License',
    'Bank / ATM Card',
    'Travel Card / Bus Pass',
    'Hall Ticket',
    'Certificate / Marksheet',
    'Other Document',
  ],
  'College / Study Items': [
    'College ID Card',
    'Book / Textbook',
    'Notebook / Record',
    'Assignment / Project File',
    'Calculator',
    'Lab Equipment / Coat',
    'Pencil Box / Stationery',
    'Other Study Item',
  ],
  'Clothing': [
    'Jacket / Hoodie',
    'Shirt / T-Shirt',
    'Cap / Hat',
    'Shoes / Footwear',
    'Other Clothing',
  ],
  'Other': [
    'Vehicle Key',
    'Helmet',
    'Sports Equipment',
    'Musical Instrument',
    'Medical Item',
    'Other Item',
  ],
};

export const CATEGORY_DATA = CATEGORY_ITEMS;

export const CAMPUS_LOCATIONS = [
  'Central Canteen / Cafeteria',
  'Central Library (1st / 2nd Floor)',
  'Main Computer Lab / Lab 1-4',
  'ECE / Mechanical Department Labs',
  'Lecture Hall / Classroom Block A-C',
  'Bike Parking / Gate 1-2',
  'Boys Hostel / Mess',
  'Girls Hostel / Mess',
  'College Bus Route',
  'Sports Ground / Pavilion',
  'Auditorium / Seminar Hall',
  'Other Campus Location',
];

// Brand to Model mappings for Phones
export const PHONE_BRAND_MODELS: Record<string, string[]> = {
  'Apple': [
    'iPhone 16 Pro Max',
    'iPhone 16 Pro',
    'iPhone 16 Plus',
    'iPhone 16',
    'iPhone 15 Pro Max',
    'iPhone 15 Pro',
    'iPhone 15 Plus',
    'iPhone 15',
    'iPhone 14 Pro Max',
    'iPhone 14 Pro',
    'iPhone 14 Plus',
    'iPhone 14',
    'iPhone 13 Pro',
    'iPhone 13',
    'iPhone 12 / 12 Mini',
    'iPhone 11',
    'iPhone SE',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Samsung': [
    'Galaxy S24 Ultra',
    'Galaxy S24 / S24+',
    'Galaxy S23 Ultra',
    'Galaxy S23 / S23 FE',
    'Galaxy S22 Series',
    'Galaxy S21 Series',
    'Galaxy A55 / A54 5G',
    'Galaxy A35 / A34',
    'Galaxy M34 / M35',
    'Galaxy F54 / F34',
    'Galaxy Z Flip 5 / 6',
    'Galaxy Z Fold 5 / 6',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'OnePlus': [
    'OnePlus 12 / 12R',
    'OnePlus 11 / 11R',
    'OnePlus Nord CE 4',
    'OnePlus Nord CE 3 / Lite',
    'OnePlus Nord 3',
    'OnePlus 10 Pro / 10T',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Xiaomi / Redmi': [
    'Redmi Note 13 Pro+ / Pro',
    'Redmi Note 13',
    'Redmi Note 12 Series',
    'Xiaomi 14 / 13 Pro',
    'Redmi 12 5G',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Realme': [
    'Realme 12 Pro+ / 12 Pro',
    'Realme 11 Pro',
    'Realme Narzo 70 / 60',
    'Realme GT Series',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Vivo': [
    'Vivo V30 / V30 Pro',
    'Vivo V29 Series',
    'Vivo T3 / T2 5G',
    'Vivo X100 / X90',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Oppo': [
    'Oppo Reno 11 / 11 Pro',
    'Oppo Reno 10',
    'Oppo F25 Pro',
    'Oppo A79 / A78',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Google Pixel': [
    'Pixel 9 Pro / 9',
    'Pixel 8 Pro / 8 / 8a',
    'Pixel 7 Pro / 7 / 7a',
    'Pixel 6a / 6',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Motorola': [
    'Edge 50 Pro / Fusion',
    'Edge 40 / 40 Neo',
    'Moto G84 / G64 5G',
    'Moto G54 / G34',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Other': [
    'Standard / Other Model',
    'Unknown / Not sure',
  ],
  'Unknown / Not sure': [
    'Unknown / Not sure',
  ],
};

// Brand to Model mappings for Laptops
export const LAPTOP_BRAND_MODELS: Record<string, string[]> = {
  'Apple': [
    'MacBook Air M3 (13" / 15")',
    'MacBook Air M2 (13" / 15")',
    'MacBook Air M1',
    'MacBook Pro 14" (M1/M2/M3)',
    'MacBook Pro 16" (M1/M2/M3)',
    'MacBook Pro 13"',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Dell': [
    'XPS 13 / 15',
    'Inspiron 15 (3000 / 5000)',
    'Inspiron 14',
    'Latitude Business Series',
    'Vostro Series',
    'Alienware / G15 Gaming',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'HP': [
    'Pavilion 15 / 14',
    'Victus Gaming 15 / 16',
    'Omen Gaming Laptop',
    'Spectre x360 2-in-1',
    'Envy 13 / 15',
    'HP 15s / 14s Standard',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Lenovo': [
    'ThinkPad E14 / T14 Series',
    'IdeaPad Slim 3 / 5',
    'Legion 5 / Pro Gaming',
    'LOQ Gaming Series',
    'Yoga 2-in-1 Touch',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Asus': [
    'ROG Zephyrus / Strix Gaming',
    'TUF Gaming F15 / A15',
    'ZenBook 14 OLED',
    'VivoBook 15 / 16',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Acer': [
    'Predator Helios 300 / 16',
    'Nitro 5 / 16 Gaming',
    'Aspire 5 / 7',
    'Swift 3 / Go',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'MSI': [
    'Katana / GF63 Gaming',
    'Stealth Series',
    'Modern / Prestige',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Samsung': [
    'Galaxy Book 4 / 3 Pro',
    'Galaxy Book 2',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Other': [
    'Standard Laptop Model',
    'Unknown / Not sure',
  ],
  'Unknown / Not sure': [
    'Unknown / Not sure',
  ],
};

// Brand to Model mappings for Tablets
export const TABLET_BRAND_MODELS: Record<string, string[]> = {
  'Apple': [
    'iPad Pro 11" / 13" (M4/M2)',
    'iPad Air (M2 / 5th Gen)',
    'iPad 10th Gen',
    'iPad 9th Gen',
    'iPad Mini (6th Gen)',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Samsung': [
    'Galaxy Tab S9 / S9+ / Ultra',
    'Galaxy Tab S8 Series',
    'Galaxy Tab S9 FE / FE+',
    'Galaxy Tab A9 / A9+',
    'Galaxy Tab A8',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Lenovo': [
    'Lenovo Tab M11 / M10',
    'Lenovo Tab P12 / P11 Pro',
    'Lenovo Yoga Tab',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'OnePlus': [
    'OnePlus Pad 2',
    'OnePlus Pad',
    'OnePlus Pad Go',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Xiaomi': [
    'Xiaomi Pad 6',
    'Redmi Pad Pro',
    'Redmi Pad SE',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Realme': [
    'Realme Pad 2',
    'Realme Pad Mini',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Other': [
    'Standard Tablet',
    'Unknown / Not sure',
  ],
  'Unknown / Not sure': [
    'Unknown / Not sure',
  ],
};

// Brand to Model mappings for Smartwatches
export const WATCH_BRAND_MODELS: Record<string, string[]> = {
  'Apple': [
    'Apple Watch Ultra 2 / 1',
    'Apple Watch Series 9 / 8',
    'Apple Watch Series 7 / 6',
    'Apple Watch SE (2nd Gen)',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Samsung': [
    'Galaxy Watch 7 / Ultra',
    'Galaxy Watch 6 / 6 Classic',
    'Galaxy Watch 5 / 5 Pro',
    'Galaxy Watch 4',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'boAt': [
    'boAt Wave Call / Sigma',
    'boAt Storm Call / Pro',
    'boAt Lunar Connect',
    'boAt Xtend Series',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Noise': [
    'Noise ColorFit Pro 5 / 4',
    'Noise ColorFit Pulse 3 / 2',
    'Noise Halo Plus',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Fastrack': [
    'Fastrack Reflex Play / Vox',
    'Fastrack Limitless FS1',
    'Fastrack Revoltt Series',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Fire-Boltt': [
    'Fire-Boltt Ninja Call Pro',
    'Fire-Boltt Phoenix / Gladiator',
    'Fire-Boltt Invincible',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Garmin': [
    'Forerunner Series',
    'Fenix / Instinct',
    'Venu / Vivoactive',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Fitbit': [
    'Fitbit Charge 6 / 5',
    'Fitbit Versa 4 / 3',
    'Fitbit Sense 2',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Other': [
    'Smartwatch Model',
    'Unknown / Not sure',
  ],
  'Unknown / Not sure': [
    'Unknown / Not sure',
  ],
};

// Brand to Model mappings for Earbuds
export const EARBUDS_BRAND_MODELS: Record<string, string[]> = {
  'Apple': [
    'AirPods Pro (2nd Gen / USB-C)',
    'AirPods Pro (1st Gen)',
    'AirPods (3rd Gen)',
    'AirPods (2nd Gen)',
    'AirPods Max (Over-Ear)',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'boAt': [
    'Airdopes 141 / 141 ANC',
    'Airdopes 131',
    'Airdopes 441',
    'Airdopes 161',
    'Rockerz 255 (Neckband)',
    'Rockerz 450 (Headphones)',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Sony': [
    'WF-1000XM5 / XM4 (Earbuds)',
    'WH-1000XM5 / XM4 (Over-Ear)',
    'WF-C500 / C700N',
    'WH-CH520 / CH720N',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'OnePlus': [
    'OnePlus Buds Pro 2 / 3',
    'OnePlus Nord Buds 2 / 2r',
    'OnePlus Bullets Wireless Z2',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Samsung': [
    'Galaxy Buds 3 / 3 Pro',
    'Galaxy Buds 2 / 2 Pro',
    'Galaxy Buds FE',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Noise': [
    'Noise Buds VS102 / VS104',
    'Noise Buds Trance',
    'Noise Air Buds Pro',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'JBL': [
    'JBL Wave Buds / Beam',
    'JBL Tune 510BT / 710BT',
    'JBL Live Pro',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Realme': [
    'Realme Buds Air 5 / 6',
    'Realme Buds T300 / T100',
    'Realme Buds Wireless 3',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Boult': [
    'Boult Audio AirBass Z40',
    'Boult Audio W20 / X10',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Sennheiser': [
    'Momentum True Wireless',
    'HD 450BT / 350BT',
    'Accentum Wireless',
    'Other / Not Listed',
    'Unknown / Not sure',
  ],
  'Other': [
    'Standard Earbuds / Headphones',
    'Unknown / Not sure',
  ],
  'Unknown / Not sure': [
    'Unknown / Not sure',
  ],
};

// Common Colours List
export const COLOUR_OPTIONS = [
  'Black',
  'Midnight / Navy Blue',
  'White',
  'Silver / Grey',
  'Space Grey',
  'Dark Brown',
  'Tan / Light Brown',
  'Red',
  'Green / Olive',
  'Gold / Starlight',
  'Rose Gold',
  'Purple / Violet',
  'Yellow / Orange',
  'Maroon / Burgundy',
  'Transparent / Clear',
  'Dual-tone / Multi-colour',
  'Other',
  'Unknown / Not sure',
];

// College Departments
export const COLLEGE_DEPARTMENTS_LIST = [
  'AI&DS',
  'CSE',
  'AI&ML',
  'ECE',
  'MECHATRONICS',
  'BIO TECH',
  'AGRI',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical & Electronics (EEE)',
  'Information Technology (IT)',
  'MBA / Management',
  'MCA / Computer Applications',
  'Science & Humanities',
  'Other Department',
  'Unknown / Not sure',
];

/**
 * Normalizes item type into a standardized schema key.
 */
export function normalizeSchemaKey(category: string, itemType: string): string {
  const t = (itemType || '').toLowerCase();
  const c = (category || '').toLowerCase();

  if (t.includes('id card') || t.includes('student id') || t.includes('college id') || (c.includes('documents') && t.includes('card') && !t.includes('bank') && !t.includes('atm'))) {
    return 'collegeIdCard';
  }
  if (t.includes('phone') || t.includes('mobile') || t.includes('iphone') || t.includes('cell')) {
    return 'phone';
  }
  if (t.includes('laptop') || t.includes('macbook') || t.includes('notebook')) {
    return 'laptop';
  }
  if (t.includes('tablet') || t.includes('ipad')) {
    return 'tablet';
  }
  if (t.includes('smart watch') || t.includes('smartwatch') || t.includes('iwatch')) {
    return 'smartwatch';
  }
  if (t.includes('earbuds') || t.includes('headphones') || t.includes('earphone') || t.includes('airpods')) {
    return 'earbuds';
  }
  if (t.includes('charger') || t.includes('adapter') || t.includes('power cord')) {
    return 'charger';
  }
  if (t.includes('power bank') || t.includes('powerbank')) {
    return 'powerbank';
  }
  if (t.includes('wallet') || t.includes('purse') || t.includes('money pouch')) {
    return 'wallet';
  }
  if (t.includes('key') || t.includes('keys') || t.includes('bike key')) {
    return 'keys';
  }
  if (t.includes('bag') || t.includes('backpack') || t.includes('handbag') || t.includes('sling bag') || t.includes('tote')) {
    return 'bag';
  }

  return 'generic';
}

/**
 * 1. DOCUMENTS / CARDS (College ID Card)
 * ASK ONLY: College/Institution, Student Name, Department, ID Colour, ID Type, Visible Photo, Signature/Printed, Distinguishing Marks, Unique Feature.
 * DO NOT ASK: Brand, Model, specs, storage, RAM, IMEI, serial number.
 */
export const COLLEGE_ID_CARD_SCHEMA: DynamicQuestion[] = [
  {
    id: 'institutionName',
    label: 'College / Institution Name *',
    type: 'text',
    required: true,
    placeholder: 'e.g. Engineering College Campus / Main Campus',
  },
  {
    id: 'studentName',
    label: 'Student / Cardholder Name',
    type: 'text',
    optional: true,
    placeholder: 'Name printed on card (leave blank if faded or unknown)',
    helperText: 'Optional: Useful for instant verified identity matching.',
  },
  {
    id: 'department',
    label: 'Department / Course *',
    type: 'select',
    required: true,
    options: COLLEGE_DEPARTMENTS_LIST,
  },
  {
    id: 'idCardColour',
    label: 'ID Card & Lanyard Colour *',
    type: 'select',
    required: true,
    options: [
      'White Card with Blue Lanyard',
      'White Card with Red Lanyard',
      'White Card with Black Lanyard',
      'White Card with Green Lanyard',
      'White Card (No Lanyard)',
      'Yellow Card',
      'Blue Card',
      'Green Card',
      'Other Colour Combination',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'idCardType',
    label: 'ID Card Type *',
    type: 'radio',
    required: true,
    options: ['Student', 'Staff / Faculty', 'Visitor / Other'],
  },
  {
    id: 'visiblePhoto',
    label: 'Visible Photo on Card',
    type: 'select',
    optional: true,
    options: [
      'Yes — Clear photo present',
      'Yes — Black & White photo',
      'Faded / Worn photo',
      'No photo visible',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'signatureDetails',
    label: 'Signature / Printed Barcode / QR Details',
    type: 'text',
    optional: true,
    placeholder: 'e.g. Barcode on back, Principal signature, Library barcode sticker',
    helperText: 'Only mention if visible and relevant for identification.',
  },
  {
    id: 'distinguishingMarks',
    label: 'Distinguishing Marks on ID Card',
    type: 'checkbox-group',
    options: [
      'Sticker attached',
      'Noticeable scratch',
      'Fold or crease',
      'Corner crack / edge damage',
      'Clear plastic card holder / pouch',
      'Bus pass sticker attached',
      'Hostel barcode on back',
      'Other unique mark',
      'Clean / No visible marks',
    ],
  },
  {
    id: 'safeUniqueDetails',
    label: 'Any Other Unique Identifying Feature',
    type: 'textarea',
    placeholder: 'e.g. Small star sticker on bottom corner, crack on card clip, blood group written on rear',
    helperText: 'Safe visible detail to differentiate this specific ID card.',
  },
];

/**
 * 2. MOBILE / PHONE
 * Questions: Brand, Model (depends on Brand), Colour, Storage (opt), Phone Case (Yes/No/Unknown), Case Colour/Design, Camera Layout, Screen Condition, Scratches/Dents, Accessories, IMEI (opt privacy-safe), Other unique features, Lock Type.
 */
export const PHONE_SCHEMA: DynamicQuestion[] = [
  {
    id: 'brand',
    label: 'Brand / Manufacturer *',
    type: 'select',
    required: true,
    options: [
      'Apple',
      'Samsung',
      'OnePlus',
      'Xiaomi / Redmi',
      'Realme',
      'Vivo',
      'Oppo',
      'Google Pixel',
      'Motorola',
      'Other',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'model',
    label: 'Model / Variant *',
    type: 'select',
    required: true,
    dependsOnBrand: true,
    options: ['Select brand first', 'Other / Not Listed', 'Unknown / Not sure'],
    helperText: 'Model list dynamically updates based on selected Brand.',
  },
  {
    id: 'colour',
    label: 'Phone Body / Frame Colour *',
    type: 'select',
    required: true,
    options: COLOUR_OPTIONS,
  },
  {
    id: 'storage',
    label: 'Storage Capacity',
    type: 'select',
    optional: true,
    options: ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB', 'Unknown / Not sure'],
  },
  {
    id: 'hasCase',
    label: 'Phone Case / Cover Attached? *',
    type: 'radio',
    required: true,
    options: ['Yes', 'No', 'Unknown / Not sure'],
  },
  {
    id: 'caseColour',
    label: 'Case / Cover Colour',
    type: 'select',
    options: COLOUR_OPTIONS,
    condition: (answers) => answers.hasCase === 'Yes',
  },
  {
    id: 'caseDesign',
    label: 'Case Design / Material / Stickers',
    type: 'text',
    placeholder: 'e.g. Transparent with corner bumpers, Matte silicone, Anime sticker on back',
    condition: (answers) => answers.hasCase === 'Yes',
  },
  {
    id: 'cameraLayout',
    label: 'Camera Layout / Visible Profile',
    type: 'select',
    options: [
      'Dual diagonal cameras (e.g. iPhone 13/14/15)',
      'Triple camera triangle with flash (e.g. Pro models)',
      'Vertical pill / Triple line (e.g. Samsung Galaxy / OnePlus)',
      'Horizontal camera visor bar (e.g. Pixel)',
      'Large circular camera island',
      'Single camera lens',
      'Other layout',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'screenCondition',
    label: 'Screen Condition & Protection',
    type: 'select',
    options: [
      'Intact with Tempered Glass attached',
      'Intact without screen protector',
      'Tempered glass chipped / hairline crack',
      'Main screen glass cracked / scratched',
      'Matte / Privacy screen protector attached',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'scratchesDents',
    label: 'Scratches, Cracks, or Dents',
    type: 'text',
    placeholder: 'e.g. Scratch on top right bezel, dent near speaker grill, chipped charging port',
  },
  {
    id: 'lockType',
    label: 'Lock Mechanism Type (Do NOT enter passcode)',
    type: 'select',
    options: [
      '6-digit PIN',
      '4-digit PIN',
      'Pattern Lock',
      'Face Unlock + PIN',
      'Fingerprint + PIN',
      'Alphanumeric Password',
      'No Lock / Swipe only',
      'Unknown / Not sure',
    ],
    helperText: 'Strict Privacy: Only the lock mechanism is recorded. Never disclose passwords or PINs.',
  },
  {
    id: 'accessories',
    label: 'Attached Accessories',
    type: 'text',
    placeholder: 'e.g. PopSocket grip, phone charm / lanyard, SIM ejector tool inside case',
  },
  {
    id: 'imeiLast4',
    label: 'IMEI (Last 4 digits only — Optional)',
    type: 'text',
    optional: true,
    placeholder: 'e.g. 8492 (or leave empty)',
    privacyNotice: 'Privacy Protected: Only enter the last 4 digits if you have the purchase box. Never enter full sensitive device identifiers.',
  },
  {
    id: 'safeUniqueDetails',
    label: 'Other Unique Identifying Feature',
    type: 'textarea',
    placeholder: 'e.g. Lockscreen shows anime wallpaper, sticker residue on back, engraved initials on frame',
    helperText: 'Specific traits that conclusively verify ownership.',
  },
];

/**
 * 3. LAPTOP
 * Questions: Brand, Model (depends on brand), Colour, Serial Number (opt), Screen size (opt), Stickers, Scratches/Dents, Keyboard characteristics, Laptop bag (opt), Charger (opt), Other accessories, Unique marks.
 * DO NOT ASK: IMEI, SIM details, phone questions.
 */
export const LAPTOP_SCHEMA: DynamicQuestion[] = [
  {
    id: 'brand',
    label: 'Brand / Manufacturer *',
    type: 'select',
    required: true,
    options: [
      'Apple',
      'Dell',
      'HP',
      'Lenovo',
      'Asus',
      'Acer',
      'MSI',
      'Samsung',
      'Other',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'model',
    label: 'Model / Laptop Series *',
    type: 'select',
    required: true,
    dependsOnBrand: true,
    options: ['Select brand first', 'Other / Not Listed', 'Unknown / Not sure'],
    helperText: 'Model list dynamically updates based on selected Brand.',
  },
  {
    id: 'colour',
    label: 'Laptop Body Colour *',
    type: 'select',
    required: true,
    options: [
      'Silver',
      'Space Grey',
      'Black',
      'Midnight Blue',
      'Dark Ash / Gunmetal',
      'White',
      'Gold / Starlight',
      'Other Colour',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'screenSize',
    label: 'Screen Size',
    type: 'select',
    optional: true,
    options: [
      '13" - 13.3" (Compact)',
      '14" (Standard Thin & Light)',
      '15.6" (Standard Full Size)',
      '16" - 17" (Large Gaming / Creator)',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'stickers',
    label: 'Stickers on Laptop Lid / Palm Rest',
    type: 'text',
    placeholder: 'e.g. GitHub Octocat sticker, college fest sticker, plain lid with no stickers',
    helperText: 'High-probability matching indicator.',
  },
  {
    id: 'keyboardType',
    label: 'Keyboard Characteristics',
    type: 'select',
    options: [
      'Backlit White Keyboard',
      'RGB Multi-colour Backlit (Gaming)',
      'Standard Non-backlit Keyboard',
      'Has dedicated Number Pad (NumPad on right)',
      'No Number Pad (Compact layout)',
      'Silicone keyboard cover / protector attached',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'scratchesDents',
    label: 'Physical Scratches, Dents or Wear',
    type: 'text',
    placeholder: 'e.g. Ding on left corner, scratches on bottom rubber feet, worn trackpad',
  },
  {
    id: 'laptopBag',
    label: 'Laptop Bag / Sleeve Included?',
    type: 'text',
    optional: true,
    placeholder: 'e.g. Black Wildcraft sleeve, Dell shoulder bag, No bag',
  },
  {
    id: 'chargerIncluded',
    label: 'Power Adapter / Charger Included?',
    type: 'select',
    optional: true,
    options: [
      'Yes — Charger included in report',
      'No — Laptop only',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'serialNumber',
    label: 'Serial Number / Service Tag (Optional)',
    type: 'text',
    optional: true,
    placeholder: 'e.g. Dell Service Tag or Apple Serial (if known)',
    privacyNotice: 'Optional: Hardware service tag or serial from invoice.',
  },
  {
    id: 'safeUniqueDetails',
    label: 'Unique Identifying Marks / Features',
    type: 'textarea',
    placeholder: 'e.g. Webcam privacy slider sticker, scratch across Apple logo, initials on bottom',
  },
];

/**
 * 4. TABLET
 * Questions: Brand, Model (depends on brand), Colour, Storage (opt), Case/Cover, Case Colour, Camera characteristics, Screen condition, Scratches/Dents, Accessories (Apple Pencil/Stylus/Keyboard), Unique marks.
 */
export const TABLET_SCHEMA: DynamicQuestion[] = [
  {
    id: 'brand',
    label: 'Brand / Manufacturer *',
    type: 'select',
    required: true,
    options: [
      'Apple',
      'Samsung',
      'Lenovo',
      'OnePlus',
      'Xiaomi',
      'Realme',
      'Other',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'model',
    label: 'Tablet Model / Series *',
    type: 'select',
    required: true,
    dependsOnBrand: true,
    options: ['Select brand first', 'Other / Not Listed', 'Unknown / Not sure'],
  },
  {
    id: 'colour',
    label: 'Tablet Body Colour *',
    type: 'select',
    required: true,
    options: COLOUR_OPTIONS,
  },
  {
    id: 'storage',
    label: 'Storage Capacity',
    type: 'select',
    optional: true,
    options: ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB', 'Unknown / Not sure'],
  },
  {
    id: 'hasCase',
    label: 'Tablet Case / Cover Attached? *',
    type: 'radio',
    required: true,
    options: ['Yes', 'No', 'Unknown / Not sure'],
  },
  {
    id: 'caseColour',
    label: 'Case / Cover Colour & Type',
    type: 'text',
    placeholder: 'e.g. Navy Blue trifold magnetic cover, clear silicone bumper',
    condition: (answers) => answers.hasCase === 'Yes',
  },
  {
    id: 'screenCondition',
    label: 'Screen Condition & Screen Guard',
    type: 'select',
    options: [
      'Clean / Intact glass',
      'Paper-feel matte screen protector attached (for drawing)',
      'Tempered glass protector attached',
      'Scratched / Hairline marks',
      'Cracked display',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'accessories',
    label: 'Accessories (Stylus / Keyboard)',
    type: 'text',
    placeholder: 'e.g. Apple Pencil attached magnetically, S-Pen, detachable keyboard cover',
  },
  {
    id: 'scratchesDents',
    label: 'Scratches, Dents, or Physical Marks',
    type: 'text',
    placeholder: 'e.g. Chipped aluminium edge near volume button, engraving on back',
  },
  {
    id: 'safeUniqueDetails',
    label: 'Other Unique Identifying Marks',
    type: 'textarea',
    placeholder: 'e.g. Initials engraved on back, custom wallpaper, sticker on case flap',
  },
];

/**
 * 5. SMART WATCH
 * Questions: Brand, Model, Watch dial colour, Strap colour, Strap type, Screen condition, Scratches/Marks, Charger (opt), Other accessories, Unique features.
 * DO NOT ASK: IMEI, Laptop specs, Storage/RAM.
 */
export const SMARTWATCH_SCHEMA: DynamicQuestion[] = [
  {
    id: 'brand',
    label: 'Brand / Manufacturer *',
    type: 'select',
    required: true,
    options: [
      'Apple',
      'Samsung',
      'boAt',
      'Noise',
      'Fastrack',
      'Fire-Boltt',
      'Garmin',
      'Fitbit',
      'Other',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'model',
    label: 'Model / Variant',
    type: 'select',
    dependsOnBrand: true,
    options: ['Select brand first', 'Other / Not Listed', 'Unknown / Not sure'],
  },
  {
    id: 'colour',
    label: 'Watch Dial / Case Colour *',
    type: 'select',
    required: true,
    options: [
      'Black',
      'Silver / Chrome',
      'Space Grey',
      'Starlight / Gold',
      'Midnight Blue',
      'Dark Grey / Titanium',
      'Rose Gold',
      'Other Colour',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'strapColour',
    label: 'Strap / Band Colour *',
    type: 'select',
    required: true,
    options: COLOUR_OPTIONS,
  },
  {
    id: 'strapType',
    label: 'Strap Material & Style *',
    type: 'select',
    required: true,
    options: [
      'Silicone / Sport Band (Smooth)',
      'Silicone with breathable holes (Nike style)',
      'Magnetic Ocean Loop / Rugged (Orange/Alpine)',
      'Leather / Faux Leather Strap',
      'Metal Mesh / Milanese Loop',
      'Stainless Steel Link Bracelet',
      'Nylon / Fabric Loop (Velcro)',
      'Other Strap Type',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'screenCondition',
    label: 'Dial Shape & Screen Condition',
    type: 'select',
    options: [
      'Square dial — Intact glass',
      'Square dial — Minor hairline scratches',
      'Circular dial — Intact glass',
      'Circular dial — Scratched bezel / glass',
      'Screen guard film attached',
      'Protective dial bumper case attached',
      'Cracked glass',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'scratchesDents',
    label: 'Scratches, Dents or Wear',
    type: 'text',
    placeholder: 'e.g. Scuffed sensor back, worn strap buckle, scratch on glass',
  },
  {
    id: 'chargerIncluded',
    label: 'Magnetic Charger Puck Included?',
    type: 'select',
    optional: true,
    options: ['No — Watch only', 'Yes — Charger included', 'Unknown / Not sure'],
  },
  {
    id: 'safeUniqueDetails',
    label: 'Unique Identifying Features',
    type: 'textarea',
    placeholder: 'e.g. Dial ring colour accent, custom watch face, notch cut into strap',
  },
];

/**
 * 6. EARBUDS / HEADPHONES
 * Questions: Brand, Model (opt), Colour, Case colour (for earbuds), Left/Right/Both, Earbud case shape/design, Cable (if applicable), Scratches/marks, Accessories, Unique identifying features.
 */
export const EARBUDS_SCHEMA: DynamicQuestion[] = [
  {
    id: 'brand',
    label: 'Brand / Manufacturer *',
    type: 'select',
    required: true,
    options: [
      'Apple',
      'boAt',
      'Sony',
      'OnePlus',
      'Samsung',
      'Noise',
      'JBL',
      'Realme',
      'Boult',
      'Sennheiser',
      'Other',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'model',
    label: 'Model / Variant',
    type: 'select',
    optional: true,
    dependsOnBrand: true,
    options: ['Select brand first', 'Other / Not Listed', 'Unknown / Not sure'],
  },
  {
    id: 'colour',
    label: 'Earbuds / Headphones Colour *',
    type: 'select',
    required: true,
    options: COLOUR_OPTIONS,
  },
  {
    id: 'earbudsPart',
    label: 'What parts were lost / found? *',
    type: 'select',
    required: true,
    options: [
      'Both Earbuds inside Charging Case',
      'Only Charging Case (Empty / no earbuds)',
      'Only Left Earbud',
      'Only Right Earbud',
      'Wireless Neckband (With connecting wire)',
      'Over-Ear / On-Ear Headphones',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'caseColour',
    label: 'Charging Case Colour (for TWS Earbuds)',
    type: 'select',
    options: COLOUR_OPTIONS,
    condition: (answers) => !answers.earbudsPart?.includes('Over-Ear') && !answers.earbudsPart?.includes('Neckband'),
  },
  {
    id: 'earbudCaseDesign',
    label: 'Case Shape / Protective Cover',
    type: 'select',
    options: [
      'Oval / Pill flip-top case',
      'Square rounded flip-top case',
      'Pebble round case',
      'Silicone protective case skin attached with carabiner hook',
      'Cartoon / Character silicone case cover',
      'Plain glossy / matte finish (No outer cover)',
      'Other design',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'cableType',
    label: 'Cable / Audio Wire (if applicable)',
    type: 'select',
    options: [
      'True Wireless (No cable)',
      'Type-C charging cable included',
      'Neckband flexible wire',
      'Detachable 3.5mm headphone audio cable',
      'Other / None',
    ],
  },
  {
    id: 'scratchesDents',
    label: 'Scratches, Marks, or Ear Tip Wear',
    type: 'text',
    placeholder: 'e.g. Scuffed lid hinge, mismatched ear tips (one black, one white), dent on bud stem',
  },
  {
    id: 'safeUniqueDetails',
    label: 'Unique Identifying Features',
    type: 'textarea',
    placeholder: 'e.g. Engraving on front of AirPods case, tiny scratch near indicator LED, keychain attached',
  },
];

/**
 * 7. CHARGER
 * Questions: Brand (opt), Charger type (USB-C, Lightning, Micro USB, Laptop brick, Other), Colour, Wattage (opt), Cable included, Cable colour, Connector type, Physical marks, Unique identifying features.
 * DO NOT force a Model field!
 */
export const CHARGER_SCHEMA: DynamicQuestion[] = [
  {
    id: 'chargerType',
    label: 'Charger Adapter Type *',
    type: 'select',
    required: true,
    options: [
      'USB-C Fast Charging Adapter (Phone)',
      'Apple 20W USB-C Power Adapter',
      'OnePlus SuperVOOC / Warp Adapter',
      'Samsung 25W / 45W Super Fast Adapter',
      'Laptop Charger with USB-C (65W / 100W)',
      'Laptop Charger with Round Barrel Pin',
      'Standard USB-A Brick Adapter',
      'Multi-port GaN Fast Charger',
      'Other Charger Type',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'colour',
    label: 'Charger Adapter Colour *',
    type: 'select',
    required: true,
    options: [
      'White',
      'Black',
      'Grey',
      'Red (e.g. OnePlus cable)',
      'Other Colour',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'brand',
    label: 'Brand / Manufacturer',
    type: 'select',
    optional: true,
    options: [
      'Apple',
      'Samsung',
      'OnePlus',
      'Xiaomi / Mi',
      'Dell',
      'HP',
      'Lenovo',
      'Anker',
      'Ambrane',
      'Portronics',
      'Unbranded / Local',
      'Other',
      'Unknown / Not sure',
    ],
    helperText: 'Optional: Charger brand if printed or known.',
  },
  {
    id: 'wattage',
    label: 'Wattage Rating (if printed on adapter)',
    type: 'select',
    optional: true,
    options: [
      '18W - 20W Fast Charger',
      '25W - 33W',
      '45W',
      '65W - 67W (Laptop / Ultra Fast)',
      '100W - 120W+',
      'Standard 5W - 10W',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'cableIncluded',
    label: 'Cable Included? *',
    type: 'select',
    required: true,
    options: [
      'Detachable cable attached to adapter',
      'Fixed built-in cable (permanently attached)',
      'Adapter brick only (No cable attached)',
      'Only charging cable (No adapter brick)',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'connectorType',
    label: 'Cable Connector Type',
    type: 'select',
    options: [
      'Type-C to Type-C',
      'Type-A to Type-C',
      'Type-C to Lightning (Apple)',
      'Type-A to Lightning',
      'Type-A to Micro USB',
      'Laptop Barrel Pin / Pin Tip',
      'No cable',
      'Other Connector',
    ],
  },
  {
    id: 'cableColour',
    label: 'Cable Colour & Texture',
    type: 'text',
    placeholder: 'e.g. White rubberized, Red OnePlus flat cable, Black braided wire',
  },
  {
    id: 'scratchesDents',
    label: 'Physical Marks or Cable Wear',
    type: 'text',
    placeholder: 'e.g. Yellowing near connector neck, insulation tape near joint, scratch on pins',
  },
  {
    id: 'safeUniqueDetails',
    label: 'Unique Identifying Features',
    type: 'textarea',
    placeholder: 'e.g. Initials written in permanent marker on plug, rubber band wound around cable',
  },
];

/**
 * 8. POWER BANK
 * Questions: Brand (opt), Model (opt), Colour, Capacity (opt), Number/type of ports, Display indicator (opt), Scratches/marks, Cable included, Other unique features.
 */
export const POWERBANK_SCHEMA: DynamicQuestion[] = [
  {
    id: 'colour',
    label: 'Power Bank Body Colour *',
    type: 'select',
    required: true,
    options: [
      'Black',
      'Metallic Silver / Aluminium',
      'Navy Blue',
      'White',
      'Green / Olive',
      'Red',
      'Other Colour',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'brand',
    label: 'Brand / Manufacturer',
    type: 'select',
    optional: true,
    options: [
      'Mi / Xiaomi',
      'Ambrane',
      'Anker',
      'URBN',
      'boAt',
      'Realme',
      'Portronics',
      'OnePlus',
      'Other Brand',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'capacity',
    label: 'Battery Capacity (mAh)',
    type: 'select',
    optional: true,
    options: [
      '10,000 mAh (Standard slim)',
      '20,000 mAh (Thick / Heavy)',
      '30,000 mAh (Extra large)',
      '5,000 mAh (Ultra compact)',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'portsCount',
    label: 'Number & Type of Ports',
    type: 'select',
    options: [
      '2x USB-A + 1x Type-C (Standard 3 ports)',
      '1x USB-A + 1x Type-C',
      'Dual Type-C + Dual USB-A',
      'Built-in integrated charging cables',
      'Wireless Magnetic Power Bank (MagSafe style)',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'displayIndicator',
    label: 'Battery Level Indicator',
    type: 'select',
    optional: true,
    options: [
      '4 White LED dot indicator lights',
      'Digital % LED percentage screen',
      'Single LED light (changes colour)',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'cableIncluded',
    label: 'Charging Cable Included?',
    type: 'select',
    options: [
      'Short white Type-C cable included',
      'Short black Type-C cable included',
      'No cable',
      'Other cable attached',
    ],
  },
  {
    id: 'scratchesDents',
    label: 'Scratches, Dents or Surface Wear',
    type: 'text',
    placeholder: 'e.g. Scratched aluminium shell, chipped plastic corners, dent near power button',
  },
  {
    id: 'safeUniqueDetails',
    label: 'Unique Identifying Features',
    type: 'textarea',
    placeholder: 'e.g. Developer sticker on back, rubber band around it, initials engraved',
  },
];

/**
 * 9. WALLET
 * Questions: Material, Colour, Brand (opt), Wallet type (Bi-fold, Tri-fold, Card holder, etc.), Approximate size, Compartments (opt), Contents category (DO NOT request sensitive numbers!), Unique marks, Stitching/logo/design, Other features.
 * NEVER ask for: Full card number, CVV, PIN, Bank password.
 */
export const WALLET_SCHEMA: DynamicQuestion[] = [
  {
    id: 'material',
    label: 'Wallet Material *',
    type: 'select',
    required: true,
    options: [
      'Genuine Leather (Textured / Grain)',
      'Faux / PU Leather (Smooth)',
      'Fabric / Canvas / Denim',
      'Metal / Carbon Fiber Slim Cardholder',
      'Synthetic / Waterproof Material',
      'Other Material',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'colour',
    label: 'Wallet Colour *',
    type: 'select',
    required: true,
    options: [
      'Dark Brown',
      'Tan / Light Brown',
      'Black',
      'Navy Blue',
      'Grey',
      'Maroon / Red',
      'Olive Green',
      'Other Colour',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'walletType',
    label: 'Wallet Type / Style *',
    type: 'select',
    required: true,
    options: [
      'Bi-fold (Standard folds once)',
      'Tri-fold (Folds into three)',
      'Slim Cardholder with Money Clip',
      'Zipper Pouch / Coin Purse',
      'Long Travel / Chequebook Wallet',
      'Other Style',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'brand',
    label: 'Brand / Logo (if visible)',
    type: 'select',
    optional: true,
    options: [
      'Wildhorn',
      'Woodland',
      'Tommy Hilfiger',
      'Puma',
      'Titan',
      "Levi's",
      'Fastrack',
      'Hidesign',
      'Unbranded / Local',
      'Other Brand',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'compartments',
    label: 'Compartments & Features',
    type: 'checkbox-group',
    options: [
      'Transparent window for ID card / photo',
      'Dedicated coin pocket with snap button / zipper',
      'Dual cash dividers (2 cash slots)',
      'Metal money clip inside',
      'Elastic cash band on outside',
    ],
  },
  {
    id: 'contentsCategory',
    label: 'General Contents Present (Select all that apply)',
    type: 'checkbox-group',
    options: [
      'Cash currency bills present',
      'College ID card inside',
      'Bank debit / credit cards present',
      'Passport / Stamp size personal photo',
      'Bus Pass / Metro card',
      'Loose coins in coin pocket',
      'Room / Bike key inside',
      'Receipts / ATM slips inside',
    ],
    helperText: 'Strict Privacy: Never enter card numbers, PINs, CVVs, or financial details.',
    privacyNotice: 'For student security, never record card numbers or PINs. Only broad categories are checked for verification.',
  },
  {
    id: 'stitchingDesign',
    label: 'Stitching, Logo & Design Details',
    type: 'text',
    placeholder: 'e.g. Contrast white stitching along border, embossed metal logo on front bottom right',
  },
  {
    id: 'scratchesDents',
    label: 'Unique Marks / Wear & Tear',
    type: 'text',
    placeholder: 'e.g. Worn leather on spine fold, circular coin mark imprinted on leather, frayed edge',
  },
  {
    id: 'safeUniqueDetails',
    label: 'Other Identifying Details',
    type: 'textarea',
    placeholder: 'e.g. Distinctive photo in transparent sleeve, emergency phone number written on slip inside',
  },
];

/**
 * 10. KEYS
 * Questions: Number of keys, Key type, Keychain type, Keychain colour, Keychain design, Key ring type, Label/tag (opt), Unique marks, Other features.
 * DO NOT ASK: Brand, Model, Device specifications!
 */
export const KEYS_SCHEMA: DynamicQuestion[] = [
  {
    id: 'keyCount',
    label: 'Number of Keys on Ring *',
    type: 'select',
    required: true,
    options: [
      '1 Single Key',
      '2 Keys',
      'Bunch of 3 to 4 Keys',
      'Bunch of 5 or more Keys',
      'Car / Bike Smart Remote Fob only',
    ],
  },
  {
    id: 'keyType',
    label: 'Key Type / Vehicle Classification *',
    type: 'select',
    required: true,
    options: [
      'Two-Wheeler / Bike Ignition Key (Yamaha, Honda, Royal Enfield, etc.)',
      'Car Smart Key / Flip Remote',
      'Hostel / Room Door Key (Standard brass)',
      'Godrej / Computerized dimple door key',
      'Small Cupboard / Padlock / Locker Key',
      'Mixed bunch (Bike key + room keys)',
      'Other Key Type',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'keychainType',
    label: 'Keychain / Tag Attached *',
    type: 'select',
    required: true,
    options: [
      'Metal Keychain / Medallion',
      'Fabric Lanyard / Neck Strap ribbon',
      'Rubber / Silicone Figurine (Anime / Superhero / Bike)',
      'Leather Loop / Fob',
      'Wooden Engraved Fob',
      'Plastic Room Number Tag',
      'No keychain attached (Just key ring)',
      'Other Keychain Type',
    ],
  },
  {
    id: 'keychainColour',
    label: 'Keychain Colour',
    type: 'select',
    options: COLOUR_OPTIONS,
    condition: (answers) => answers.keychainType !== 'No keychain attached (Just key ring)',
  },
  {
    id: 'keychainDesign',
    label: 'Keychain Text, Logo or Character Design',
    type: 'text',
    placeholder: 'e.g. Royal Enfield emblem, "Remove Before Flight" red strap, Goku figurine, Room 304 tag',
  },
  {
    id: 'keyRingType',
    label: 'Key Ring / Attachment Style',
    type: 'select',
    options: [
      'Standard Circular Split Ring',
      'Carabiner / D-Hook Clip (Clips to belt loop)',
      'Quick-release connector clip',
      'Twisted wire ring',
      'Other Ring Type',
    ],
  },
  {
    id: 'scratchesDents',
    label: 'Distinguishing Marks on Keys',
    type: 'text',
    placeholder: 'e.g. Duplicate key notch mark, bent key tip, black plastic head on key, worn brass teeth',
  },
  {
    id: 'safeUniqueDetails',
    label: 'Other Unique Identifying Features',
    type: 'textarea',
    placeholder: 'e.g. Small silver bell attached, specific room number etched on brass, lanyard has college fest logo',
  },
];

/**
 * 11. BAG
 * Questions: Bag type (Backpack, Laptop Bag, Handbag, etc.), Colour, Brand (opt), Material, Size, Number of compartments, Logo/design, Stickers/keychains, Scratches/damage, Unique identifying features.
 */
export const BAG_SCHEMA: DynamicQuestion[] = [
  {
    id: 'bagType',
    label: 'Bag Classification *',
    type: 'select',
    required: true,
    options: [
      'College Backpack (Standard 2-3 zip)',
      'Dedicated Laptop Bag (Shoulder strap)',
      'Hand Bag / Shoulder Tote Bag',
      'Sling Bag / Crossbody Pouch',
      'Sports Duffle / Gym Bag',
      'Drawstring Bag',
      'Other Bag Type',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'colour',
    label: 'Primary Bag Colour *',
    type: 'select',
    required: true,
    options: COLOUR_OPTIONS,
  },
  {
    id: 'brand',
    label: 'Brand / Manufacturer',
    type: 'select',
    optional: true,
    options: [
      'Wildcraft',
      'American Tourister',
      'Skybags',
      'Nike',
      'Puma',
      'Adidas',
      'Safari',
      'Fastrack',
      'Dell',
      'Lenovo',
      'HP',
      'Unbranded / Local',
      'Other Brand',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'material',
    label: 'Bag Material & Texture',
    type: 'select',
    options: [
      'Polyester / Water-resistant Nylon',
      'Heavy Canvas / Cotton Fabric',
      'Faux Leather / Leather',
      'Denim Fabric',
      'Other Material',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'compartments',
    label: 'Compartments & Pockets',
    type: 'checkbox-group',
    options: [
      'Dedicated padded laptop compartment',
      'Side elastic mesh for water bottle',
      'Front quick-access zippered pouch',
      'Secret anti-theft pocket on back padding',
      'Rain cover compartment at bottom',
      'Double / Heavy-duty main zippers',
    ],
  },
  {
    id: 'logoDesign',
    label: 'Front Logo, Pattern, or Print',
    type: 'text',
    placeholder: 'e.g. Large white Nike swoosh, abstract geometric pattern, plain solid black',
  },
  {
    id: 'stickersKeychain',
    label: 'Attached Keychains, Badges or Ribbons',
    type: 'text',
    placeholder: 'e.g. Yellow ribbon tied to top handle, anime badge pinned on front pocket',
  },
  {
    id: 'scratchesDents',
    label: 'Wear, Scratches or Damage',
    type: 'text',
    placeholder: 'e.g. Frayed right shoulder strap, torn mesh pocket, ink stain inside main compartment',
  },
  {
    id: 'safeUniqueDetails',
    label: 'Unique Identifying Features',
    type: 'textarea',
    placeholder: 'e.g. Name written with permanent marker on inner label, distinctive keychain on zip runner',
  },
];

/**
 * 12. OTHER PERSONAL ITEM / GENERAL
 * Questions: What type of item is it? Colour, Brand (opt), Model (opt), Material, Size, Physical description, Unique marks, Accessories, Other useful info.
 * Avoids forcing gadget questions!
 */
export const GENERIC_SCHEMA: DynamicQuestion[] = [
  {
    id: 'itemDescription',
    label: 'What type of item is it? *',
    type: 'text',
    required: true,
    placeholder: 'e.g. Water Bottle, Scientific Calculator, Lab Coat, Umbrella, Spectacles, Casio Watch',
    helperText: 'A clear concise name describing the item.',
  },
  {
    id: 'colour',
    label: 'Primary Item Colour *',
    type: 'select',
    required: true,
    options: COLOUR_OPTIONS,
  },
  {
    id: 'material',
    label: 'Material / Texture',
    type: 'select',
    options: [
      'Plastic / Polymer',
      'Stainless Steel / Metal',
      'Fabric / Cloth / Cotton',
      'Glass',
      'Leather / Faux Leather',
      'Wood / Paper',
      'Rubber / Silicone',
      'Other Material',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'size',
    label: 'Approximate Size',
    type: 'select',
    options: [
      'Small (Pocket size / Handheld)',
      'Medium (Notebook or bottle size)',
      'Large (Backpack or coat size)',
      'Unknown / Not sure',
    ],
  },
  {
    id: 'brand',
    label: 'Brand / Manufacturer (Only if applicable)',
    type: 'text',
    optional: true,
    placeholder: 'e.g. Milton / Casio / Ray-Ban / Tupperware (leave blank if unbranded)',
  },
  {
    id: 'model',
    label: 'Model / Variant (Only if applicable)',
    type: 'text',
    optional: true,
    placeholder: 'e.g. fx-991CW, 1000ml Thermosteel (leave blank if unknown)',
  },
  {
    id: 'physicalDescription',
    label: 'Physical Appearance & Visual Traits',
    type: 'textarea',
    placeholder: 'Describe what the item looks like (shape, design, cap, handle, buttons, logos)...',
  },
  {
    id: 'safeUniqueDetails',
    label: 'Unique Marks, Stickers, or Wear',
    type: 'textarea',
    placeholder: 'e.g. Dent on bottom rim, name sticker, scratched surface, initials engraved',
    helperText: 'Crucial distinguishing feature to confirm ownership.',
  },
  {
    id: 'accessories',
    label: 'Accessories / Cases Included (if any)',
    type: 'text',
    optional: true,
    placeholder: 'e.g. Hard protective case, carrying strap, pouch included',
  },
];

/**
 * Returns the relevant questions based on Category and Specific Item.
 */
export function getQuestionsForItem(category: string, itemType: string): DynamicQuestion[] {
  const schemaKey = normalizeSchemaKey(category, itemType);
  switch (schemaKey) {
    case 'collegeIdCard':
      return COLLEGE_ID_CARD_SCHEMA;
    case 'phone':
      return PHONE_SCHEMA;
    case 'laptop':
      return LAPTOP_SCHEMA;
    case 'tablet':
      return TABLET_SCHEMA;
    case 'smartwatch':
      return SMARTWATCH_SCHEMA;
    case 'earbuds':
      return EARBUDS_SCHEMA;
    case 'charger':
      return CHARGER_SCHEMA;
    case 'powerbank':
      return POWERBANK_SCHEMA;
    case 'wallet':
      return WALLET_SCHEMA;
    case 'keys':
      return KEYS_SCHEMA;
    case 'bag':
      return BAG_SCHEMA;
    case 'generic':
    default:
      return GENERIC_SCHEMA;
  }
}

/**
 * Returns dynamic model list based on itemType and brand.
 */
export function getModelsForBrand(itemType: string, brand: string): string[] {
  const schemaKey = normalizeSchemaKey('', itemType);
  const cleanBrand = (brand || '').trim();

  let map: Record<string, string[]> | null = null;
  if (schemaKey === 'phone') map = PHONE_BRAND_MODELS;
  else if (schemaKey === 'laptop') map = LAPTOP_BRAND_MODELS;
  else if (schemaKey === 'tablet') map = TABLET_BRAND_MODELS;
  else if (schemaKey === 'smartwatch') map = WATCH_BRAND_MODELS;
  else if (schemaKey === 'earbuds') map = EARBUDS_BRAND_MODELS;

  if (!map) return ['Other / Not Listed', 'Unknown / Not sure'];

  // Exact match
  if (map[cleanBrand]) {
    return map[cleanBrand];
  }

  // Case-insensitive match
  const lower = cleanBrand.toLowerCase();
  for (const [key, models] of Object.entries(map)) {
    if (key.toLowerCase() === lower || lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return models;
    }
  }

  return ['Other / Not Listed', 'Unknown / Not sure'];
}
