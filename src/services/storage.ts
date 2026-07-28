import {
  Transaction,
  Account,
  Project,
  RecurringTransaction,
  Invoice,
  RecurringInvoiceSchedule,
  Dividend,
  PayrollEmployee,
  PayslipRecord,
  LoanMortgage,
  CategoryBudget,
  CompanySettings,
  AuditLogEntry,
  BankStatementItem,
  ChurchDonor,
  ChurchDonationReceipt,
  PassThroughFund,
  VolunteerExpenseClaim,
  BusinessEntity,
  BankFeedRule,
  CustomDashboardMetric,
  UserProfile,
  ScannedQrRecipeReceipt,
} from '../types';

const STORAGE_KEY = 'kiwiledger_nz_accounting_v1';

export interface StorageData {
  companySettings: CompanySettings;
  userProfiles?: UserProfile[];
  accounts: Account[];
  transactions: Transaction[];
  projects: Project[];
  recurringTransactions: RecurringTransaction[];
  invoices: Invoice[];
  recurringInvoices?: RecurringInvoiceSchedule[];
  dividends: Dividend[];
  employees: PayrollEmployee[];
  payslips: PayslipRecord[];
  loans: LoanMortgage[];
  budgets: CategoryBudget[];
  auditLogs: AuditLogEntry[];
  bankStatements: BankStatementItem[];
  donors: ChurchDonor[];
  donationReceipts: ChurchDonationReceipt[];
  passThroughFunds: PassThroughFund[];
  volunteerExpenses: VolunteerExpenseClaim[];
  securityPin: string | null;
  entities?: BusinessEntity[];
  activeEntityId?: string;
  bankFeedRules?: BankFeedRule[];
  customMetrics?: CustomDashboardMetric[];
  scannedQrItems?: ScannedQrRecipeReceipt[];
}

export const SAMPLE_SCANNED_ITEMS: ScannedQrRecipeReceipt[] = [
  {
    id: 'qr-sample-1',
    type: 'RECIPE',
    title: 'Traditional NZ Pavlova',
    sourceOrMerchant: 'Kiwi Kitchen Recipes QR',
    date: '2026-07-25',
    category: 'Food & Recipes',
    qrRawContent: 'https://kiwikitchen.co.nz/recipes/pavlova?id=88312',
    ingredientsOrItems: [
      '4 Egg whites (room temperature)',
      '1 Cup Caster sugar',
      '1 tsp White vinegar',
      '1 tsp Cornflour',
      '1 tsp Vanilla extract',
      'Whipped cream & fresh Kiwifruit for topping'
    ],
    instructionsOrNotes: 'Beat egg whites until stiff peaks form. Gradually add sugar. Fold in vinegar, cornflour, and vanilla. Bake at 120°C for 75 mins.',
    savedAt: new Date().toISOString(),
    isBookmarked: true,
  },
  {
    id: 'qr-sample-2',
    type: 'RECEIPT',
    title: 'Countdown Supermarket - Fresh Groceries',
    sourceOrMerchant: 'Countdown Auckland Central',
    date: '2026-07-26',
    totalAmount: 64.50,
    gstAmount: 8.41,
    category: 'Staff Amenities & Food',
    qrRawContent: 'NZ-GST-INV|Countdown|GST#123-456-789|2026-07-26|TOTAL:64.50|GST:8.41',
    ingredientsOrItems: [
      'Anchor Milk 2L ($5.20)',
      'Whittaker’s Chocolate 250g ($6.50)',
      'Fresh Kiwifruit 1kg ($4.80)',
      'Fairtrade Coffee Beans 500g ($18.00)',
      'Fresh Bakery Sourdough ($6.00)'
    ],
    instructionsOrNotes: 'GST Registered receipt #CNT-9941. Claimable business expense under Staff Kitchen Amenities.',
    savedAt: new Date().toISOString(),
    isBookmarked: false,
  },
];

export const DEFAULT_ENTITIES: BusinessEntity[] = [
  {
    id: 'ent-main',
    name: 'Grace Community Church Charitable Trust',
    tradingName: 'Grace Community Church & Ministries',
    nzbn: '9429041234567',
    irdNumber: '128-495-932',
    gstNumber: '128-495-932',
    entityType: 'REGISTERED_CHARITY',
    colorBadge: 'bg-teal-600',
    isDefault: true,
  },
  {
    id: 'ent-trading',
    name: 'Kiwi Cloud Software Solutions NZ Ltd',
    tradingName: 'Kiwi Cloud Tech',
    nzbn: '9429059876543',
    irdNumber: '109-876-543',
    gstNumber: '109-876-543',
    entityType: 'NZ_COMPANY',
    colorBadge: 'bg-indigo-600',
    isDefault: false,
  },
  {
    id: 'ent-property',
    name: 'Mount Eden Property Investment Trust',
    tradingName: 'Edenvale Apartments',
    nzbn: '9429011122233',
    irdNumber: '055-667-788',
    entityType: 'TRUST',
    colorBadge: 'bg-amber-600',
    isDefault: false,
  },
];

export const DEFAULT_BANK_RULES: BankFeedRule[] = [
  {
    id: 'rule-1',
    ruleName: 'Supermarket Groceries',
    keywords: ['COUNTDOWN', 'PAK N SAVE', 'NEW WORLD'],
    matchType: 'CONTAINS',
    assignedCategory: 'Hospitality & Catering',
    assignedIrdTaxCode: '300 - Operating Expenses',
    assignedGstType: 'STANDARD_15',
    autoApprove: true,
  },
  {
    id: 'rule-2',
    ruleName: 'Spark Telecom Broadband',
    keywords: ['SPARK', 'ONE NZ', '2DEGREES'],
    matchType: 'CONTAINS',
    assignedCategory: 'Telephone & Internet',
    assignedIrdTaxCode: '300 - Operating Expenses',
    assignedGstType: 'STANDARD_15',
    autoApprove: true,
  },
  {
    id: 'rule-3',
    ruleName: 'Fuel & Transport',
    keywords: ['Z ENERGY', 'BP CONNECT', 'MOBIL'],
    matchType: 'CONTAINS',
    assignedCategory: 'Motor Vehicle Expenses',
    assignedIrdTaxCode: '410 - Motor Vehicle',
    assignedGstType: 'STANDARD_15',
    autoApprove: false,
  },
];

export const DEFAULT_CUSTOM_METRICS: CustomDashboardMetric[] = [
  {
    id: 'cm-1',
    title: 'Operating Expense Ratio',
    description: 'Total Operating Expenses / Total Revenue %',
    formulaType: 'OPERATING_EXPENSE_RATIO',
    unit: 'PERCENTAGE',
    targetValue: 45,
    colorTheme: 'teal',
    isVisible: true,
  },
  {
    id: 'cm-2',
    title: 'Estimated Liquidity Runway',
    description: 'Days of operating cash remaining based on YTD burn',
    formulaType: 'CASH_RUNWAY',
    unit: 'DAYS',
    targetValue: 90,
    colorTheme: 'emerald',
    isVisible: true,
  },
];

export const DEFAULT_USER_PROFILES: UserProfile[] = [
  {
    id: 'prof-1',
    name: 'Pastor David Miller',
    email: 'david.miller@gracechurch.org.nz',
    role: 'Owner & Senior Pastor',
    irdNumber: '128-495-932',
    phone: '021 555 0192',
    associatedAccountIds: ['acc-anz-bus', 'acc-asb-sav'],
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'prof-2',
    name: 'Sarah Jenkins, CA',
    email: 's.jenkins@kiwitax.co.nz',
    role: 'Chartered Accountant',
    irdNumber: '098-765-432',
    phone: '022 491 8820',
    associatedAccountIds: ['acc-bnz-visa'],
    createdAt: '2026-02-01T10:30:00.000Z',
  },
];

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  tradingName: 'Grace Community Church & Ministries',
  legalName: 'Grace Community Church Charitable Trust',
  irdNumber: '128-495-932',
  nzbn: '9429041234567',
  ccNumber: 'CC58921',
  isCharityRegistered: true,
  charityTier: 'TIER_4',
  officialSignatoryName: 'Pastor David Miller',
  officialSignatoryTitle: 'Senior Pastor & Treasurer',
  gstNumber: '128-495-932',
  gstFilingFrequency: '2_MONTHLY',
  gstBasis: 'PAYMENTS',
  financialYearEndMonth: 3, // March 31
  entityType: 'REGISTERED_CHARITY',
  pinCode: '1234',
  isPinEnabled: false,
  businessAddress: '15 Fellowship Way, Mount Eden, Auckland 1024, New Zealand',
  bankAccountDetails: 'ANZ 01-0123-0456789-00',
};

const SAMPLE_DONORS: ChurchDonor[] = [
  {
    id: 'don-101',
    donorNumber: 'DON-101',
    name: 'David & Sarah Miller',
    email: 'david.miller@gracechurch.org.nz',
    address: '24 Karaka Street, Mount Eden, Auckland 1024',
    irdNumber: '098-765-432',
    isTaxReceiptEligible: true,
    givingMethod: 'AUTOMATIC_PAYMENT',
    notes: 'Weekly tithe by AP. Tax-deductible donation claim recipient.',
  },
  {
    id: 'don-102',
    donorNumber: 'DON-102',
    name: 'James & Aroha Taylor',
    email: 'j.taylor@xtra.co.nz',
    address: '88 Dominion Road, Mount Eden, Auckland 1024',
    irdNumber: '112-233-445',
    isTaxReceiptEligible: true,
    givingMethod: 'BANK_TRANSFER',
    notes: 'Monthly giving towards operating fund & building maintenance.',
  },
  {
    id: 'don-103',
    donorNumber: 'DON-103',
    name: 'Wiremu & Mere Tane',
    email: 'wiremu.tane@gmail.com',
    address: '12 Edenvale Road, Mount Eden, Auckland 1024',
    irdNumber: '055-443-322',
    isTaxReceiptEligible: true,
    givingMethod: 'CASH_ENVELOPE',
    notes: 'Sunday morning cash envelope giving. Assigned Envelope #103.',
  },
  {
    id: 'don-104',
    donorNumber: 'DON-104',
    name: 'Grace Youth Camp Attendees',
    email: 'youth@gracechurch.org.nz',
    address: '15 Fellowship Way, Auckland 1024',
    isTaxReceiptEligible: false,
    givingMethod: 'BANK_TRANSFER',
    notes: 'Non-deductible camp registration fees and book sales.',
  },
];

const SAMPLE_PASS_THROUGH_FUNDS: PassThroughFund[] = [
  {
    id: 'pass-01',
    fundName: 'Vanuatu Cyclone Emergency Relief Fund 2026',
    code: 'PASS-VANUATU',
    targetAmount: 10000,
    currentReceived: 8450,
    currentDisbursed: 6000,
    status: 'ACTIVE',
    description: 'Designated disaster relief fund passed directly to Red Cross Vanuatu. Excluded from Church operational income.',
  },
  {
    id: 'pass-02',
    fundName: 'Auckland Winter Community Foodbank Appeal',
    code: 'PASS-FOODBANK',
    targetAmount: 5000,
    currentReceived: 4200,
    currentDisbursed: 4200,
    status: 'CLOSED',
    description: 'Designated grocery voucher fund passed directly to Auckland City Mission.',
  },
];

const SAMPLE_VOLUNTEER_EXPENSES: VolunteerExpenseClaim[] = [
  {
    id: 'vol-exp-01',
    volunteerName: 'Matthew Jenkins',
    volunteerEmail: 'm.jenkins@gmail.com',
    ministry: 'Youth Ministry',
    expenseDate: '2026-03-18',
    description: 'Out-of-pocket grocery receipts for Friday Youth snacks & craft supplies',
    amount: 142.50,
    gstType: 'STANDARD_15',
    receiptAttached: true,
    status: 'REIMBURSED',
    approvedBy: 'Pastor David Miller',
    bankAccountId: 'acc-anz-bus',
  },
  {
    id: 'vol-exp-02',
    volunteerName: 'Chloe Williams',
    volunteerEmail: 'chloe.w@worship.nz',
    ministry: 'Worship Team',
    expenseDate: '2026-03-22',
    description: 'XLR audio cables and sheet music printing from Rockshop Auckland',
    amount: 89.00,
    gstType: 'STANDARD_15',
    receiptAttached: true,
    status: 'PENDING',
  },
];

const SAMPLE_DONATION_RECEIPTS: ChurchDonationReceipt[] = [
  {
    id: 'rec-2026-don101',
    receiptNumber: 'REC-2026-DON101',
    donorId: 'don-101',
    donorName: 'David & Sarah Miller',
    donorAddress: '24 Karaka Street, Mount Eden, Auckland 1024',
    donorIrdNumber: '098-765-432',
    taxYear: '2025/2026 Tax Year (Ending 31 March 2026)',
    issueDate: '2026-04-02',
    totalTaxDeductibleAmount: 5200.00,
    totalNonDeductibleAmount: 0.00,
    ccNumber: 'CC58921',
    churchName: 'Grace Community Church Charitable Trust',
    officialSignatory: 'Pastor David Miller',
    signatoryTitle: 'Senior Pastor & Treasurer',
    status: 'ISSUED',
  },
];

const SAMPLE_ACCOUNTS: Account[] = [
  {
    id: 'acc-anz-bus',
    name: 'ANZ Business Cheque',
    type: 'BUSINESS_CHEQUE',
    bankName: 'ANZ',
    accountNumber: '01-0123-0456789-00',
    balance: 18450.75,
    currency: 'NZD',
    isDefault: true,
    profileId: 'prof-1',
  },
  {
    id: 'acc-asb-sav',
    name: 'ASB Tax Reserve & Savings',
    type: 'SAVINGS',
    bankName: 'ASB',
    accountNumber: '12-3012-0987654-50',
    balance: 8200.00,
    currency: 'NZD',
    profileId: 'prof-1',
  },
  {
    id: 'acc-bnz-visa',
    name: 'BNZ Commercial Visa',
    type: 'CREDIT_CARD',
    bankName: 'BNZ',
    accountNumber: '02-0800-0112233-02',
    balance: -1240.50,
    currency: 'NZD',
    profileId: 'prof-2',
  },
  {
    id: 'acc-petty-cash',
    name: 'Petty Cash Float',
    type: 'PETTY_CASH',
    bankName: 'Other',
    accountNumber: 'CASH-FLOAT-01',
    balance: 250.00,
    currency: 'NZD',
  },
];

const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'proj-wellington-rebrand',
    name: 'Wellington City Brand Revamp',
    code: 'WLG-001',
    clientName: 'Wellington Regional Enterprise',
    budget: 15000,
    status: 'ACTIVE',
    description: 'Digital strategy & identity audit for Wellington enterprise client.',
  },
  {
    id: 'proj-chch-app',
    name: 'Christchurch Logistics Portal',
    code: 'CHC-002',
    clientName: 'Southern Freight Logistics',
    budget: 28000,
    status: 'ACTIVE',
    description: 'Custom React & Express portal deployment.',
  },
];

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    date: '2026-07-20',
    description: 'Client Deposit - Wellington City Rebrand',
    amount: 5750.00,
    type: 'INCOME',
    category: 'Sales & Consulting Income',
    accountId: 'acc-anz-bus',
    projectId: 'proj-wellington-rebrand',
    gstType: 'STANDARD_15',
    gstAmount: 750.00,
    irdTaxCode: '100 - Operating Income',
    reference: 'INV-2026-001',
    notes: '50% upfront milestone payment',
    isReconciled: true,
    createdAt: '2026-07-20T10:30:00Z',
  },
  {
    id: 'tx-002',
    date: '2026-07-18',
    description: 'PB Tech Auckland - New Developer Monitor & Hub',
    amount: 689.99,
    type: 'EXPENSE',
    category: 'Tools & Computer Equipment',
    accountId: 'acc-bnz-visa',
    gstType: 'STANDARD_15',
    gstAmount: 89.99,
    irdTaxCode: '310 - Hardware & Asset Expenses',
    reference: 'PB-REC-94821',
    notes: '27-inch 4K monitor for office',
    isReconciled: true,
    createdAt: '2026-07-18T14:20:00Z',
  },
  {
    id: 'tx-003',
    date: '2026-07-15',
    description: 'Spark NZ - Business Fibre & Mobile Plan',
    amount: 228.85,
    type: 'EXPENSE',
    category: 'Utilities & Telco',
    accountId: 'acc-anz-bus',
    gstType: 'STANDARD_15',
    gstAmount: 29.85,
    irdTaxCode: '340 - Telephone & Internet',
    reference: 'SPK-JUL-2026',
    isReconciled: true,
    createdAt: '2026-07-15T09:00:00Z',
  },
  {
    id: 'tx-004',
    date: '2026-07-10',
    description: 'Z Energy Ponsonby - Vehicle Fuel',
    amount: 115.00,
    type: 'EXPENSE',
    category: 'Motor Vehicle & Fuel',
    accountId: 'acc-bnz-visa',
    gstType: 'STANDARD_15',
    gstAmount: 15.00,
    irdTaxCode: '410 - Vehicle Running Costs',
    reference: 'ZE-9031',
    isReconciled: false,
    createdAt: '2026-07-10T17:45:00Z',
  },
  {
    id: 'tx-005',
    date: '2026-07-05',
    description: 'Inland Revenue NZ - GST Payment May-Jun Return',
    amount: 1420.00,
    type: 'TAX_PAYMENT',
    category: 'GST Paid to IRD',
    accountId: 'acc-asb-sav',
    gstType: 'NO_GST',
    gstAmount: 0,
    irdTaxCode: 'TAX - IRD GST Settlement',
    reference: 'IRD-GST-MAYJUN26',
    isReconciled: true,
    createdAt: '2026-07-05T11:15:00Z',
  },
  {
    id: 'tx-006',
    date: '2026-06-28',
    description: 'Spark Digital Software Subscription',
    amount: 86.25,
    type: 'EXPENSE',
    category: 'Subscriptions & Software',
    accountId: 'acc-bnz-visa',
    gstType: 'STANDARD_15',
    gstAmount: 11.25,
    irdTaxCode: '350 - Software & Cloud Services',
    reference: 'SUB-CLD-8821',
    isReconciled: true,
    createdAt: '2026-06-28T08:00:00Z',
  },
];

const SAMPLE_RECURRING: RecurringTransaction[] = [
  {
    id: 'rec-001',
    description: 'Spark Business Fibre Internet',
    amount: 228.85,
    type: 'EXPENSE',
    category: 'Utilities & Telco',
    accountId: 'acc-anz-bus',
    frequency: 'MONTHLY',
    nextDueDate: '2026-08-15',
    autoPost: true,
    gstType: 'STANDARD_15',
    irdTaxCode: '340 - Telephone & Internet',
  },
  {
    id: 'rec-002',
    description: 'Xero & Cloud Software Subscriptions',
    amount: 86.25,
    type: 'EXPENSE',
    category: 'Subscriptions & Software',
    accountId: 'acc-bnz-visa',
    frequency: 'MONTHLY',
    nextDueDate: '2026-08-28',
    autoPost: true,
    gstType: 'STANDARD_15',
    irdTaxCode: '350 - Software & Cloud Services',
  },
  {
    id: 'rec-003',
    description: 'Wellington City Retainer Fee',
    amount: 3450.00,
    type: 'INCOME',
    category: 'Sales & Consulting Income',
    accountId: 'acc-anz-bus',
    frequency: 'MONTHLY',
    nextDueDate: '2026-08-01',
    autoPost: false,
    gstType: 'STANDARD_15',
    irdTaxCode: '100 - Operating Income',
  },
];

const SAMPLE_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-001',
    issueDate: '2026-07-20',
    dueDate: '2026-08-03',
    clientName: 'Wellington Regional Enterprise',
    clientGstNumber: '098-765-432',
    clientAddress: '15 Willis Street, Wellington CBD 6011',
    clientEmail: 'accounts@wellingtonenterprise.co.nz',
    gstBasis: 'EXCLUSIVE',
    subtotal: 5000.00,
    gstTotal: 750.00,
    total: 5750.00,
    status: 'PAID',
    paidDate: '2026-07-20',
    notes: 'Thank you for your business. Payment received with thanks.',
    items: [
      {
        id: 'item-1',
        description: 'Phase 1: Digital Brand Strategy & NZ Market Audit',
        quantity: 1,
        unitPrice: 5000.00,
        gstRate: 0.15,
        amount: 5000.00,
      },
    ],
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-2026-002',
    issueDate: '2026-07-22',
    dueDate: '2026-08-05',
    clientName: 'Southern Freight Logistics Ltd',
    clientGstNumber: '112-233-445',
    clientAddress: '42 Moorhouse Ave, Christchurch 8011',
    clientEmail: 'billing@southernfreight.co.nz',
    gstBasis: 'EXCLUSIVE',
    subtotal: 8400.00,
    gstTotal: 1260.00,
    total: 9660.00,
    status: 'SENT',
    notes: 'Payment strictly within 14 days to ANZ 01-0123-0456789-00',
    items: [
      {
        id: 'item-2',
        description: 'Custom React & Node Logistics API Integration',
        quantity: 70,
        unitPrice: 120.00,
        gstRate: 0.15,
        amount: 8400.00,
      },
    ],
  },
];

const SAMPLE_DIVIDENDS: Dividend[] = [
  {
    id: 'div-001',
    date: '2026-06-30',
    companyName: 'Kiwi Consulting NZ Limited',
    shareholderName: 'Piang Bawign',
    netDividend: 7200.00,
    imputationCredits: 2800.00,
    rwtDeducted: 500.00,
    grossDividend: 10000.00,
    paymentDate: '2026-06-30',
    certificateNumber: 'DIV-2026-01',
  },
];

const SAMPLE_EMPLOYEES: PayrollEmployee[] = [
  {
    id: 'emp-001',
    name: 'Aroha Smith',
    irdNumber: '119-823-401',
    taxCode: 'M SL',
    hasStudentLoan: true,
    voluntaryStudentLoanDeduction: 0,
    kiwiSaverEmployeeRate: 3.5,
    kiwiSaverEmployerRate: 3.5,
    employeeAccLevyRate: 1.60,
    employerAccLevyRate: 0.72,
    grossWage: 2850.00,
    payFrequency: 'FORTNIGHTLY',
  },
  {
    id: 'emp-002',
    name: 'Hemi Taylor',
    irdNumber: '124-551-890',
    taxCode: 'M',
    hasStudentLoan: false,
    voluntaryStudentLoanDeduction: 0,
    kiwiSaverEmployeeRate: 4,
    kiwiSaverEmployerRate: 3.5,
    employerAccLevyRate: 0.72,
    grossWage: 3200.00,
    payFrequency: 'FORTNIGHTLY',
  },
];

const SAMPLE_PAYSLIPS: PayslipRecord[] = [
  {
    id: 'payslip-1',
    employeeId: 'emp-001',
    employeeName: 'Aroha Smith',
    payDate: '2026-07-15',
    payPeriodStart: '2026-07-01',
    payPeriodEnd: '2026-07-14',
    grossPay: 2850.00,
    payeTax: 492.50,
    basePayeTax: 261.86,
    studentLoanDeduction: 230.64,
    accLevy: 45.60,
    esctTax: 15.00,
    totalIrdPayable: 553.10,
    kiwiSaverEmployee: 99.75,
    kiwiSaverEmployer: 85.50,
    netPay: 2212.15,
    taxCode: 'M SL',
  },
];

const SAMPLE_LOANS: LoanMortgage[] = [
  {
    id: 'loan-001',
    name: 'Auckland Commercial Office Mortgage',
    lender: 'ANZ Bank New Zealand',
    totalPrincipal: 450000,
    remainingBalance: 398200,
    interestRatePct: 6.75,
    monthlyPayment: 2920.00,
    termMonths: 300,
    startDate: '2023-04-01',
    loanType: 'MORTGAGE',
    taxDeductibleInterestPct: 100,
  },
  {
    id: 'loan-002',
    name: 'EV Company Vehicle Finance',
    lender: 'UDC Finance NZ',
    totalPrincipal: 42000,
    remainingBalance: 24500,
    interestRatePct: 8.50,
    monthlyPayment: 810.00,
    termMonths: 60,
    startDate: '2024-09-15',
    loanType: 'VEHICLE_FINANCE',
    taxDeductibleInterestPct: 100,
  },
];

const SAMPLE_BUDGETS: CategoryBudget[] = [
  { category: 'Subscriptions & Software', monthlyLimit: 200, alertThresholdPct: 80 },
  { category: 'Motor Vehicle & Fuel', monthlyLimit: 350, alertThresholdPct: 85 },
  { category: 'Utilities & Telco', monthlyLimit: 300, alertThresholdPct: 80 },
  { category: 'Tools & Computer Equipment', monthlyLimit: 1000, alertThresholdPct: 75 },
  { category: 'Travel & Accommodation', monthlyLimit: 500, alertThresholdPct: 90 },
  { category: 'Ministry & Outreach Supplies', monthlyLimit: 600, alertThresholdPct: 80 },
  { category: 'Facilities & Hall Maintenance', monthlyLimit: 1200, alertThresholdPct: 85 },
];

const SAMPLE_RECURRING_INVOICES: RecurringInvoiceSchedule[] = [
  {
    id: 'rec-inv-001',
    clientName: 'Wellington Tech Hub Limited',
    clientEmail: 'accounts@wellingtontech.co.nz',
    clientAddress: '100 Lambton Quay, Wellington 6011',
    clientGstNumber: '109-882-711',
    frequency: 'MONTHLY',
    nextDueDate: '2026-08-01',
    gstBasis: 'EXCLUSIVE',
    subtotal: 2500,
    gstTotal: 375,
    total: 2875,
    status: 'ACTIVE',
    notes: 'Monthly Software Architecture & Maintenance retainer.',
    items: [
      {
        id: 'rec-item-1',
        description: 'Monthly Software Architecture & System Maintenance Retainer',
        quantity: 1,
        unitPrice: 2500,
        gstRate: 0.15,
        amount: 2500,
      },
    ],
  },
  {
    id: 'rec-inv-002',
    clientName: 'Auckland Community Trust',
    clientEmail: 'finance@aucklandtrust.org.nz',
    clientAddress: '45 Queen Street, Auckland 1010',
    clientGstNumber: '088-771-233',
    frequency: 'QUARTERLY',
    nextDueDate: '2026-09-15',
    gstBasis: 'EXCLUSIVE',
    subtotal: 1200,
    gstTotal: 180,
    total: 1380,
    status: 'ACTIVE',
    notes: 'Quarterly IT & Non-profit advisory services.',
    items: [
      {
        id: 'rec-item-2',
        description: 'Quarterly IT Infrastructure & Systems Support',
        quantity: 1,
        unitPrice: 1200,
        gstRate: 0.15,
        amount: 1200,
      },
    ],
  },
];

const SAMPLE_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-1',
    timestamp: new Date().toISOString(),
    action: 'SYSTEM_INITIALIZED',
    details: 'KiwiLedger local store initialized with sample NZ accounts & IRD rules.',
    user: 'System Admin',
  },
];

const SAMPLE_BANK_STATEMENTS: BankStatementItem[] = [
  {
    id: 'bs-001',
    date: '2026-07-20',
    description: 'ANZ ONLINE DEPOSIT - WELLINGTON REBRAND',
    amount: 5750.00,
    rawReference: 'REF 9482-WELLINGTON',
    matchedTransactionId: 'tx-001',
    isReconciled: true,
  },
  {
    id: 'bs-002',
    date: '2026-07-18',
    description: 'PB TECH AUCKLAND STORE POS 4921',
    amount: -689.99,
    rawReference: 'CARD-4921 POS AUCKLAND',
    matchedTransactionId: 'tx-002',
    isReconciled: true,
  },
  {
    id: 'bs-003',
    date: '2026-07-15',
    description: 'SPARK NZ AUTOMATIC PAYMENT',
    amount: -228.85,
    rawReference: 'AP SPARK FIBRE',
    matchedTransactionId: 'tx-003',
    isReconciled: true,
  },
  {
    id: 'bs-004',
    date: '2026-07-10',
    description: 'Z ENERGY PONSONBY FUEL',
    amount: -115.00,
    rawReference: 'VISA-Z ENERGY',
    matchedTransactionId: undefined,
    isReconciled: false,
  },
];

export function getStoredData(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialData: StorageData = {
        companySettings: DEFAULT_COMPANY_SETTINGS,
        userProfiles: DEFAULT_USER_PROFILES,
        accounts: SAMPLE_ACCOUNTS,
        transactions: SAMPLE_TRANSACTIONS,
        projects: SAMPLE_PROJECTS,
        recurringTransactions: SAMPLE_RECURRING,
        invoices: SAMPLE_INVOICES,
        recurringInvoices: SAMPLE_RECURRING_INVOICES,
        dividends: SAMPLE_DIVIDENDS,
        employees: SAMPLE_EMPLOYEES,
        payslips: SAMPLE_PAYSLIPS,
        loans: SAMPLE_LOANS,
        budgets: SAMPLE_BUDGETS,
        auditLogs: SAMPLE_AUDIT_LOGS,
        bankStatements: SAMPLE_BANK_STATEMENTS,
        donors: SAMPLE_DONORS,
        donationReceipts: SAMPLE_DONATION_RECEIPTS,
        passThroughFunds: SAMPLE_PASS_THROUGH_FUNDS,
        volunteerExpenses: SAMPLE_VOLUNTEER_EXPENSES,
        securityPin: null,
        entities: DEFAULT_ENTITIES,
        activeEntityId: 'ent-main',
        bankFeedRules: DEFAULT_BANK_RULES,
        customMetrics: DEFAULT_CUSTOM_METRICS,
        scannedQrItems: SAMPLE_SCANNED_ITEMS,
      };
      saveStoredData(initialData);
      return initialData;
    }
    const parsed = JSON.parse(raw) as StorageData;
    // Ensure new collections exist for existing stored states
    if (!parsed.userProfiles) parsed.userProfiles = DEFAULT_USER_PROFILES;
    if (!parsed.donors) parsed.donors = SAMPLE_DONORS;
    if (!parsed.donationReceipts) parsed.donationReceipts = SAMPLE_DONATION_RECEIPTS;
    if (!parsed.passThroughFunds) parsed.passThroughFunds = SAMPLE_PASS_THROUGH_FUNDS;
    if (!parsed.volunteerExpenses) parsed.volunteerExpenses = SAMPLE_VOLUNTEER_EXPENSES;
    if (!parsed.recurringInvoices) parsed.recurringInvoices = SAMPLE_RECURRING_INVOICES;
    if (!parsed.entities) parsed.entities = DEFAULT_ENTITIES;
    if (!parsed.activeEntityId) parsed.activeEntityId = 'ent-main';
    if (!parsed.bankFeedRules) parsed.bankFeedRules = DEFAULT_BANK_RULES;
    if (!parsed.customMetrics) parsed.customMetrics = DEFAULT_CUSTOM_METRICS;
    if (!parsed.scannedQrItems) parsed.scannedQrItems = SAMPLE_SCANNED_ITEMS;
    return parsed;
  } catch (e) {
    console.error('Error reading localStorage:', e);
    return {
      companySettings: DEFAULT_COMPANY_SETTINGS,
      userProfiles: DEFAULT_USER_PROFILES,
      accounts: SAMPLE_ACCOUNTS,
      transactions: SAMPLE_TRANSACTIONS,
      projects: SAMPLE_PROJECTS,
      recurringTransactions: SAMPLE_RECURRING,
      invoices: SAMPLE_INVOICES,
      recurringInvoices: SAMPLE_RECURRING_INVOICES,
      dividends: SAMPLE_DIVIDENDS,
      employees: SAMPLE_EMPLOYEES,
      payslips: SAMPLE_PAYSLIPS,
      loans: SAMPLE_LOANS,
      budgets: SAMPLE_BUDGETS,
      auditLogs: SAMPLE_AUDIT_LOGS,
      bankStatements: SAMPLE_BANK_STATEMENTS,
      donors: SAMPLE_DONORS,
      donationReceipts: SAMPLE_DONATION_RECEIPTS,
      passThroughFunds: SAMPLE_PASS_THROUGH_FUNDS,
      volunteerExpenses: SAMPLE_VOLUNTEER_EXPENSES,
      securityPin: null,
    };
  }
}

export function saveStoredData(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export const loadKiwiLedgerState = getStoredData;
export const saveKiwiLedgerState = saveStoredData;

export function logAuditAction(action: string, details: string, user: string = 'User'): void {
  const data = getStoredData();
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    user,
  };
  data.auditLogs.unshift(entry);
  if (data.auditLogs.length > 200) {
    data.auditLogs = data.auditLogs.slice(0, 200);
  }
  saveStoredData(data);
}

export function logAuditEvent(action: string, category: string, details: string): AuditLogEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    action: `${category}: ${action}`,
    details,
    user: 'Local User',
  };
}

export function exportBackupJSON(): string {
  const data = getStoredData();
  return JSON.stringify(data, null, 2);
}

export function restoreBackupJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString) as StorageData;
    if (!parsed.companySettings || !Array.isArray(parsed.transactions)) {
      throw new Error('Invalid KiwiLedger backup structure');
    }
    saveStoredData(parsed);
    logAuditAction('DATA_RESTORED', 'Full JSON backup restored into local storage');
    return true;
  } catch (e) {
    console.error('Restore failed:', e);
    return false;
  }
}

export function getStorageUsageBytes(): { usedBytes: number; formattedSize: string; transactionCount: number } {
  const dataString = localStorage.getItem(STORAGE_KEY) || '';
  const usedBytes = new Blob([dataString]).size;
  let formattedSize = `${(usedBytes / 1024).toFixed(1)} KB`;
  if (usedBytes > 1024 * 1024) {
    formattedSize = `${(usedBytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  const data = getStoredData();
  return {
    usedBytes,
    formattedSize,
    transactionCount: data.transactions.length,
  };
}

export function resetToDemoData(): void {
  localStorage.removeItem(STORAGE_KEY);
  getStoredData(); // Re-initializes
}
