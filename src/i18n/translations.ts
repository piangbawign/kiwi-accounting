export type Locale = 'en-NZ' | 'mi-NZ' | 'my-MM' | 'zom-MM';

export interface TranslationDictionary {
  // App Header & Branding
  appTitle: string;
  tagline: string;
  financialYear: string;
  
  // Navigation Tabs
  dashboard: string;
  transactions: string;
  gstReturn: string;
  invoices: string;
  payroll: string;
  financialHealth: string;
  smartAlerts: string;
  provisionalTax: string;
  fbtLogbook: string;
  subcontractors: string;
  irdForms: string;
  receiptOcr: string;
  advancedIrdHub: string;
  churchCharity: string;
  rdTaxCredit: string;
  aiAdvisor: string;
  inventory: string;
  fixedAssets: string;
  dividends: string;
  shareholderAccount: string;
  budgets: string;
  auditLogs: string;

  // Header & Global Actions
  addTransaction: string;
  quickSearch: string;
  exportPdf: string;
  exportWizard: string;
  tools: string;
  shortcuts: string;
  undo: string;
  redo: string;
  bankFeeds: string;
  dataCleaner: string;
  backups: string;
  totalBalance: string;
  allAccounts: string;
  searchPlaceholder: string;
  encryptedStorage: string;

  // Transaction & Accounting Terminology
  income: string;
  expense: string;
  transfer: string;
  taxPayment: string;
  payrollType: string;
  ownerDraw: string;
  dividend: string;

  // GST & Tax Labels
  standardGst: string;
  zeroRated: string;
  exempt: string;
  noGst: string;
  gstExclusive: string;
  gstInclusive: string;

  // Common UI Controls
  save: string;
  cancel: string;
  close: string;
  delete: string;
  edit: string;
  filter: string;
  date: string;
  amount: string;
  category: string;
  account: string;
  reference: string;
  notes: string;

  // Language & Locale Settings
  language: string;
  english: string;
  maori: string;
  myanmar: string;
  zomi: string;
  selectLanguage: string;
}

export const translations: Record<Locale, TranslationDictionary> = {
  'en-NZ': {
    appTitle: 'KiwiLedger Pro',
    tagline: 'NZ IRD Compliant Accounting & Bookkeeping',
    financialYear: 'FY 2025/26',

    dashboard: 'Dashboard',
    transactions: 'Transactions',
    gstReturn: 'GST Return',
    invoices: 'Invoices & Billing',
    payroll: 'Payroll & PAYE',
    financialHealth: 'Financial Health',
    smartAlerts: 'Smart Scan Alerts',
    provisionalTax: 'Provisional Tax & AIM',
    fbtLogbook: 'FBT & Vehicle Logbook',
    subcontractors: 'Subcontractors & ACC',
    irdForms: 'IRD Tax Forms',
    receiptOcr: 'Receipt OCR Rules',
    advancedIrdHub: 'Advanced IRD Tax Suite',
    churchCharity: 'Church & Non-Profit',
    rdTaxCredit: 'R&D Tax Credit (RDTI)',
    aiAdvisor: 'AI Tax Advisor',
    inventory: 'Inventory & Stock',
    fixedAssets: 'Fixed Assets',
    dividends: 'Dividends & ICA',
    shareholderAccount: 'Shareholder Current Account',
    budgets: 'Budgets & Forecasts',
    auditLogs: 'Audit Log & History',

    addTransaction: '+ Add Transaction',
    quickSearch: 'Quick Search',
    exportPdf: 'Export PDF',
    exportWizard: 'Export Wizard',
    tools: 'Tools & Hub',
    shortcuts: 'Shortcuts',
    undo: 'Undo',
    redo: 'Redo',
    bankFeeds: 'Bank Feeds',
    dataCleaner: 'Data Cleaner',
    backups: 'Tax Backups',
    totalBalance: 'Total Balance',
    allAccounts: 'All Bank Accounts',
    searchPlaceholder: 'Search transactions, accounts, rules (⌘K)...',
    encryptedStorage: '100% Local Encrypted Storage',

    income: 'Income',
    expense: 'Expense',
    transfer: 'Transfer',
    taxPayment: 'Tax Payment',
    payrollType: 'Payroll / Wages',
    ownerDraw: 'Owner Draw / Drawings',
    dividend: 'Dividend',

    standardGst: 'Standard GST (15%)',
    zeroRated: 'Zero-Rated (0%)',
    exempt: 'GST Exempt',
    noGst: 'No GST / Out of Scope',
    gstExclusive: 'Excl. GST',
    gstInclusive: 'Incl. GST',

    save: 'Save Entry',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    edit: 'Edit',
    filter: 'Filter',
    date: 'Date',
    amount: 'Amount',
    category: 'Category',
    account: 'Bank Account',
    reference: 'Reference',
    notes: 'Notes / Memo',

    language: 'Language',
    english: 'English (NZ)',
    maori: 'Te Reo Māori',
    myanmar: 'မြန်မာဘာသာ',
    zomi: 'Zomi (Tedim)',
    selectLanguage: 'Select System Language',
  },

  'mi-NZ': {
    appTitle: 'KiwiLedger Pro',
    tagline: 'Tauhokohoko me ngā Tāke Aotearoa (IRD)',
    financialYear: 'Tau Tāke 2025/26',

    dashboard: 'Pae Whakahaere',
    transactions: 'Ngā Tauhokohoko',
    gstReturn: 'Tāke Taonga me ngā Ratonga (GST)',
    invoices: 'Inoiti me ngā Takoha',
    payroll: 'Utu Kaimahi & PAYE',
    financialHealth: 'Hauora Pūtea',
    smartAlerts: 'Pānui Matatiki',
    provisionalTax: 'Tāke Whakawhiti & AIM',
    fbtLogbook: 'FBT me te Pukapuka Waka',
    subcontractors: 'Kaitukutuku me te ACC',
    irdForms: 'Ngā Puka Tāke IRD',
    receiptOcr: 'Tātari Whakaritenga (OCR)',
    advancedIrdHub: 'Kete Tāke IRD Matua',
    churchCharity: 'Hāhi me ngā Rōpū Aroha',
    rdTaxCredit: 'Pūtea Rangahau (RDTI)',
    aiAdvisor: 'Kaitohutohu Tāke AI',
    inventory: 'Rawa me ngā Taonga',
    fixedAssets: 'Ngā Rawa Taketake',
    dividends: 'Ngā Monihoko me te ICA',
    shareholderAccount: 'Pūkete Rangatira Pūtea',
    budgets: 'Pūtea Whakahaere & Mātāpono',
    auditLogs: 'Tātai Pūtea & Mōhiotanga',

    addTransaction: '+ Tāpiri Tauhokohoko',
    quickSearch: 'Ranga Whakawhiti',
    exportPdf: 'Tuku Pūrongo PDF',
    exportWizard: 'Mātāpunenga Tuku',
    tools: 'Ngā Rauemi',
    shortcuts: 'Ngā Ara Ngaro',
    undo: 'Whakakore',
    redo: 'Mahi Anō',
    bankFeeds: 'Pēke Whakawhiti',
    dataCleaner: 'Whakapai Taputapu',
    backups: 'Aukati Pūtea',
    totalBalance: 'Toenga Moni Katoa',
    allAccounts: 'Ngā Pūkete Pēke Katoa',
    searchPlaceholder: 'Rapua tauhokohoko, pūkete, ture (⌘K)...',
    encryptedStorage: '100% Pūkore Kua Whakawaeheretia',

    income: 'Moni Whiwhi',
    expense: 'Moni Whakapaunga',
    transfer: 'Whakawhiti Pūtea',
    taxPayment: 'Utu Tāke IRD',
    payrollType: 'Utu Kaimahi',
    ownerDraw: 'Moni Rangatira',
    dividend: 'Monihoko',

    standardGst: 'GST Standard (15%)',
    zeroRated: 'Tāke Kore (0%)',
    exempt: 'Kua Wātea i te GST',
    noGst: 'Kore Tāke',
    gstExclusive: 'I waho i te GST',
    gstInclusive: 'I roto i te GST',

    save: 'Tiaki',
    cancel: 'Whakakore',
    close: 'Dūpā',
    delete: 'Mukua',
    edit: 'Whakarerekē',
    filter: 'Tātari',
    date: 'Rā',
    amount: 'Moni',
    category: 'Rōpū',
    account: 'Pūkete Pēke',
    reference: 'Kupu Tohu',
    notes: 'Kupu Āpiti',

    language: 'Reo',
    english: 'Ingarihi (NZ)',
    maori: 'Te Reo Māori',
    myanmar: 'မြန်မာဘာသာ',
    zomi: 'Zomi (Tedim)',
    selectLanguage: 'Mātaki Reo',
  },

  'my-MM': {
    appTitle: 'KiwiLedger Pro',
    tagline: 'NZ IRD တရားဝင် စာရင်းကိုင်နှင့် ဘဏ္ဍာရေး စနစ်',
    financialYear: 'ဘဏ္ဍာရေးနှစ် 2025/26',

    dashboard: 'ပင်မစာမျက်နှာ',
    transactions: 'ငွေစာရင်း လွှဲပြောင်းမှုများ',
    gstReturn: 'GST အခွန် အစီရင်ခံစာ',
    invoices: 'အင်ဗွိုက်စ်နှင့် ဘေလ်များ',
    payroll: 'လစာနှင့် PAYE အခွန်',
    financialHealth: 'ဘဏ္ဍာရေး အခြေအနေ',
    smartAlerts: 'စမတ် သတိပေးချက်များ',
    provisionalTax: 'ကြိုတင်အခွန်နှင့် AIM',
    fbtLogbook: 'FBT နှင့် ယာဉ်မှတ်တမ်း',
    subcontractors: 'ကန်ထရိုက်တာနှင့် ACC',
    irdForms: 'IRD အခွန်ပုံစံများ',
    receiptOcr: 'ပြေစာ OCR စနစ်',
    advancedIrdHub: 'အဆင့်မြင့် IRD အခွန်စနစ်',
    churchCharity: 'ဘုရားကျောင်းနှင့် အလှူအတန်း',
    rdTaxCredit: 'R&D အခွန်သက်သာခွင့် (RDTI)',
    aiAdvisor: 'AI အခွန်အကြံပေး',
    inventory: 'ကုန်ပစ္စည်းစာရင်း',
    fixedAssets: 'အမြဲတမ်းပစ္စည်းများ',
    dividends: 'အမြတ်ဝေစုနှင့် ICA',
    shareholderAccount: 'ရှယ်ယာရှင် စာရင်း',
    budgets: 'ဘတ်ဂျက်နှင့် ခန့်မှန်းချက်',
    auditLogs: 'စာရင်းစစ်ဆေးမှု မှတ်တမ်း',

    addTransaction: '+ စာရင်းအသစ်ထည့်ရန်',
    quickSearch: 'အမြန်ရှာဖွေရန်',
    exportPdf: 'PDF ထုတ်ယူရန်',
    exportWizard: 'ဒေတာ ထုတ်ယူမှု',
    tools: 'ကိရိယာများ',
    shortcuts: 'ဖြတ်လမ်းများ',
    undo: 'ပြန်ပြင်ရန်',
    redo: 'ရှေ့ဆက်ရန်',
    bankFeeds: 'ဘဏ်စာရင်းများ',
    dataCleaner: 'ဒေတာ သန့်ရှင်းရေး',
    backups: 'အခွန် ဒေတာ သိမ်းရန်',
    totalBalance: 'စုစုပေါင်း လက်ကျန်',
    allAccounts: 'ဘဏ်အကောင့် အားလုံး',
    searchPlaceholder: 'ရှာဖွေရန် (⌘K)...',
    encryptedStorage: '100% လုံခြုံသော သိမ်းဆည်းမှု',

    income: 'ဝင်ငွေ',
    expense: 'ထွက်ငွေ/အသုံးစရိတ်',
    transfer: 'ငွေလွှဲ',
    taxPayment: 'အခွန်ပေးသွင်းမှု',
    payrollType: 'လစာ',
    ownerDraw: 'ပိုင်ရှင်ထုတ်ယူမှု',
    dividend: 'အမြတ်ဝေစု',

    standardGst: 'ပုံမှန် GST (15%)',
    zeroRated: 'အခွန်မဲ့ (0%)',
    exempt: 'GST ကင်းလွတ်ခွင့်',
    noGst: 'GST မပါပါ',
    gstExclusive: 'GST မပါဘဲ',
    gstInclusive: 'GST ပါပြီး',

    save: 'သိမ်းဆည်းမည်',
    cancel: 'ပယ်ဖျက်မည်',
    close: 'ပိတ်မည်',
    delete: 'ဖျက်မည်',
    edit: 'ပြင်ဆင်မည်',
    filter: 'စစ်ထုတ်မည်',
    date: 'ရက်စွဲ',
    amount: 'ပမာဏ',
    category: 'အမျိုးအစား',
    account: 'ဘဏ်အကောင့်',
    reference: 'ရည်ညွှန်းချက်',
    notes: 'မှတ်ချက်',

    language: 'ဘာသာစကား',
    english: 'အင်္ဂလိပ် (NZ)',
    maori: 'မာအိုရီ',
    myanmar: 'မြန်မာဘာသာ',
    zomi: 'ဇိုမီး (တိတိန်)',
    selectLanguage: 'ဘာသာစကား ရွေးချယ်ပါ',
  },

  'zom-MM': {
    appTitle: 'KiwiLedger Pro',
    tagline: 'NZ IRD Thukhun pui Sumlaibu & Sumsiah',
    financialYear: 'Kum Siah 2025/26',

    dashboard: 'Maimang Sumlaibu',
    transactions: 'Sum Lut Sum Suah',
    gstReturn: 'GST Siah Piakna',
    invoices: 'Invoi & Sum Tang',
    payroll: 'Nasep lian & PAYE Siah',
    financialHealth: 'Sum Cidamna',
    smartAlerts: 'Thu Zehtang Phatna',
    provisionalTax: 'Provisional Siah & AIM',
    fbtLogbook: 'FBT & Mawtaw Laibu',
    subcontractors: 'Kuli nasep & ACC',
    irdForms: 'IRD Siah Laiphek',
    receiptOcr: 'Resit Lai Tipiak (OCR)',
    advancedIrdHub: 'IRD Siah Mangpupa Suite',
    churchCharity: 'Pawlpi & Huhna Kipawlna',
    rdTaxCredit: 'R&D Siah Kiamna (RDTI)',
    aiAdvisor: 'AI Siah Thulakna',
    inventory: 'Kumpiau Wan teng',
    fixedAssets: 'A ngip Nuntakna Rawa',
    dividends: 'Neksuah Tang & ICA',
    shareholderAccount: 'Sumthang Puh Laitaw',
    budgets: 'Sum Seh & Laimang',
    auditLogs: 'Sumsiah Etphatna',

    addTransaction: '+ Sumlut/Sumsuah Tāpiri',
    quickSearch: 'Manlang Zonawm',
    exportPdf: 'PDF Khahkhia',
    exportWizard: 'Sum Laibu Khahkhia',
    tools: 'Zatna Van teng',
    shortcuts: 'Maanlang Zotu',
    undo: 'Kiphel',
    redo: 'Mahi Kipan',
    bankFeeds: 'Bank Feeds',
    dataCleaner: 'Laisianghnu',
    backups: 'Siah Kemcin',
    totalBalance: 'A khempeuh Sum teng',
    allAccounts: 'Bank Pūkete teng',
    searchPlaceholder: 'Zom In (⌘K)...',
    encryptedStorage: '100% Khakcip Lokel Kemna',

    income: 'Sumlut',
    expense: 'Sumsuah',
    transfer: 'Sum puak',
    taxPayment: 'Siah Piakna',
    payrollType: 'Nasep Utu',
    ownerDraw: 'Topa Sum Lak',
    dividend: 'Neksuah',

    standardGst: 'Standard GST (15%)',
    zeroRated: 'Siah Omlo (0%)',
    exempt: 'GST Wātea',
    noGst: 'GST Omlo',
    gstExclusive: 'GST Utawh',
    gstInclusive: 'GST Kawm',

    save: 'Kem in',
    cancel: 'Phel in',
    close: 'Khāk in',
    delete: 'Sut in',
    edit: 'Puah in',
    filter: 'Tāk in',
    date: 'Ni',
    amount: 'Sum Zah',
    category: 'Pawl',
    account: 'Bank Pūkete',
    reference: 'Thu Khentat',
    notes: 'Lai Khak',

    language: 'Pau',
    english: 'Mangpau (NZ)',
    maori: 'Māori Pau',
    myanmar: 'Kawlpau (Burmese)',
    zomi: 'Zomi (Tedim)',
    selectLanguage: 'Pau Teipau In',
  },
};

// Maori Month Names
const maoriMonths = [
  'Hānuere',
  'Pēpuere',
  'Māehe',
  'Āperira',
  'Mei',
  'Hūne',
  'Hūrae',
  'Ākuhata',
  'Hepetema',
  'Ōketopa',
  'Nōrema',
  'Tīhema',
];

const maoriDays = [
  'Rātapu',
  'Rāhina',
  'Tūrei',
  'Wenerei',
  'Tāite',
  'Paraire',
  'Hāhoroi',
];

// Myanmar Month Names
const myanmarMonths = [
  'ဇန်နဝါရီ',
  'ဖေဖော်ဝါရီ',
  'မတ်',
  'ဧပြီ',
  'မေ',
  'ဇွန်',
  'ဇူလိုင်',
  'သြဂုတ်',
  'စက်တင်ဘာ',
  'အောက်တိုဘာ',
  'နိုဝင်ဘာ',
  'ဒီဇင်ဘာ',
];

const myanmarDays = [
  'တနင်္ဂနွေ',
  'တနင်္လာ',
  'အင်္ဂါ',
  'ဗုဒ္ဓဟူး',
  'ကြာသပတေး',
  'သောကြာ',
  'စနေ',
];

// Zomi Tedim Month Names
const zomiMonths = [
  'Kipthang (Jan)',
  'Zawngta (Feb)',
  'Sihpha (Mar)',
  'Sihpik (Apr)',
  'Keelkong (May)',
  'Pazawng (Jun)',
  'Pahuat (Jul)',
  'Maitu (Aug)',
  'Dialal (Sep)',
  'Kaikun (Oct)',
  'Singaw (Nov)',
  'Pukpahlian (Dec)',
];

const zomiDays = [
  'Nipini',
  'Seppatni',
  'Seppihni',
  'Gawmni',
  'Ningani',
  'Nipihni',
  'Pillangni',
];

/**
 * Format currency amount with NZD default in locale-aware format
 */
export function formatCurrencyLocale(
  amount: number,
  locale: Locale = 'en-NZ',
  currency: string = 'NZD'
): string {
  const absoluteValue = Math.abs(amount);
  const formattedNumber = new Intl.NumberFormat('en-NZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absoluteValue);

  const prefix = amount < 0 ? '-$' : '$';
  const currencySuffix = currency !== 'NZD' ? ` ${currency}` : '';

  return `${prefix}${formattedNumber}${currencySuffix}`;
}

/**
 * Format date in locale-aware format suitable for NZ business contexts
 */
export function formatDateLocale(
  dateInput: string | Date | number,
  locale: Locale = 'en-NZ',
  formatStyle: 'short' | 'medium' | 'long' = 'medium'
): string {
  if (!dateInput) return '';

  const dateObj = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  if (isNaN(dateObj.getTime())) return String(dateInput);

  const day = dateObj.getDate();
  const monthIndex = dateObj.getMonth();
  const year = dateObj.getFullYear();
  const dayIndex = dateObj.getDay();

  if (locale === 'mi-NZ') {
    if (formatStyle === 'short') {
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      return `${pad(day)}/${pad(monthIndex + 1)}/${year}`;
    }
    if (formatStyle === 'long') {
      return `${maoriDays[dayIndex]}, ${day} o ${maoriMonths[monthIndex]}, ${year}`;
    }
    return `${day} ${maoriMonths[monthIndex]} ${year}`;
  }

  if (locale === 'my-MM') {
    if (formatStyle === 'short') {
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      return `${year}/${pad(monthIndex + 1)}/${pad(day)}`;
    }
    if (formatStyle === 'long') {
      return `${year} ခုနှစ်၊ ${myanmarMonths[monthIndex]} ${day} ရက်၊ ${myanmarDays[dayIndex]}နေ့`;
    }
    return `${year} ${myanmarMonths[monthIndex]} ${day} ရက်`;
  }

  if (locale === 'zom-MM') {
    if (formatStyle === 'short') {
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      return `${pad(day)}/${pad(monthIndex + 1)}/${year}`;
    }
    if (formatStyle === 'long') {
      return `${zomiDays[dayIndex]}, ${day} ${zomiMonths[monthIndex]}, ${year}`;
    }
    return `${day} ${zomiMonths[monthIndex]} ${year}`;
  }

  // English NZ
  if (formatStyle === 'short') {
    return dateObj.toLocaleDateString('en-NZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  if (formatStyle === 'long') {
    return dateObj.toLocaleDateString('en-NZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return dateObj.toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format numbers with decimal precision
 */
export function formatNumberLocale(
  value: number,
  locale: Locale = 'en-NZ',
  decimals: number = 2
): string {
  return new Intl.NumberFormat('en-NZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentLocale(
  value: number,
  locale: Locale = 'en-NZ',
  decimals: number = 1
): string {
  return `${formatNumberLocale(value, locale, decimals)}%`;
}

