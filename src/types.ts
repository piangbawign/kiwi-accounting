export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'DIVIDEND' | 'TAX_PAYMENT' | 'PAYROLL' | 'OWNER_DRAW';

export type GSTType = 'STANDARD_15' | 'ZERO_RATED' | 'EXEMPT' | 'NO_GST';

export interface TransactionAttachment {
  id: string;
  name: string;
  size?: string;
  type?: string;
  dataUrl?: string;
  uploadedAt: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // Always positive value in base amount (NZD)
  type: TransactionType;
  category: string;
  accountId: string;
  projectId?: string;
  gstType: GSTType;
  gstAmount: number;
  irdTaxCode: string; // e.g., '100 - Sales', '300 - Office Expenses', '410 - Motor Vehicle'
  reference?: string;
  notes?: string;
  receiptUrl?: string;
  attachments?: TransactionAttachment[];
  isReconciled: boolean;
  recurringId?: string;
  createdAt: string;
  currency?: string; // Base currency code, default NZD
  foreignAmount?: number; // e.g. 1000 USD
  exchangeRate?: number; // NZD per foreign unit or foreign per NZD
  tags?: string[]; // e.g. ['#TaxDeductible', '#HomeOffice', '#AssetOver$1000']
  isChurchNonprofit?: boolean;
  churchCategory?: 'TITHES' | 'DONATION' | 'OFFERING' | 'PASS_THROUGH' | 'GRANT' | 'VOLUNTEER_REIMBURSEMENT' | 'MINISTRY_EXPENSE' | string;
  donorName?: string;
  isTaxDeductibleDonation?: boolean; // IR526 tax rebate eligible
  gstReturnPeriod?: string; // e.g., 'Jul-Aug 2026', '2026-Q3'
  gstBoxMapping?: 'BOX_5_SALES' | 'BOX_6_ZERO_RATED' | 'BOX_8_PURCHASES' | 'BOX_9_EXEMPT' | string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string; // e.g. 'Owner', 'Accountant', 'Director', 'Tax Advisor'
  irdNumber?: string;
  phone?: string;
  associatedAccountIds?: string[];
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'BUSINESS_CHEQUE' | 'PETTY_CASH';
  bankName: 'ANZ' | 'ASB' | 'BNZ' | 'Westpac' | 'Kiwibank' | 'Other';
  accountNumber: string; // e.g. 01-0123-0123456-00
  balance: number;
  currency: 'NZD';
  isDefault?: boolean;
  profileId?: string | null;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  clientName?: string;
  budget: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  description?: string;
}

export type DividendRecord = Dividend;
export type LoanRecord = LoanMortgage;
export type AuditLog = AuditLogEntry;

export interface ChurchDonor {
  id: string; // e.g. DON-101
  donorNumber: string;
  name: string;
  email?: string;
  address?: string;
  irdNumber?: string;
  isTaxReceiptEligible: boolean;
  givingMethod: 'BANK_TRANSFER' | 'CASH_ENVELOPE' | 'AUTOMATIC_PAYMENT' | 'CHEQUE';
  notes?: string;
}

export interface ChurchDonationReceipt {
  id: string;
  receiptNumber: string; // e.g. REC-2026-DON101
  donorId: string;
  donorName: string;
  donorAddress?: string;
  donorIrdNumber?: string;
  taxYear: string; // e.g. "2025/2026 Tax Year (Ending 31 March 2026)"
  issueDate: string;
  totalTaxDeductibleAmount: number; // Unconditional tithes & offerings
  totalNonDeductibleAmount: number; // Camp fees, book sales, etc.
  ccNumber: string;
  churchName: string;
  officialSignatory: string;
  signatoryTitle: string;
  status: 'ISSUED' | 'DRAFT' | 'SENT';
}

export interface PassThroughFund {
  id: string;
  fundName: string;
  code: string; // e.g. PASS-VANUATU
  targetAmount: number;
  currentReceived: number;
  currentDisbursed: number;
  status: 'ACTIVE' | 'DISBURSED' | 'CLOSED';
  description?: string;
}

export interface VolunteerExpenseClaim {
  id: string;
  volunteerName: string;
  volunteerEmail: string;
  ministry: string; // e.g. Youth Ministry, Worship, Facilities, Community Kitchen
  expenseDate: string;
  description: string;
  amount: number;
  gstType: GSTType;
  receiptAttached: boolean;
  status: 'PENDING' | 'APPROVED' | 'REIMBURSED' | 'DECLINED';
  approvedBy?: string;
  bankAccountId?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantityOnHand: number;
  reorderLevel: number;
  unitCost: number; // Excl GST Cost
  sellingPrice: number; // Excl GST Selling Price
  location?: string;
  supplier?: string;
  gstType: GSTType;
  lastRestockedDate?: string;
  notes?: string;
}

export interface AppState {
  companySettings: CompanySettings;
  userProfiles?: UserProfile[];
  accounts: Account[];
  transactions: Transaction[];
  projects: Project[];
  recurringTransactions: RecurringTransaction[];
  inventory?: InventoryItem[];
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
  activeEntityId?: string; // 'ALL' or entity ID
  bankFeedRules?: BankFeedRule[];
  customMetrics?: CustomDashboardMetric[];
  rdProjects?: RdProject[];
  rdExpenditures?: RdExpenditureLog[];
  shareholders?: Shareholder[];
  shareholderAccountEntries?: ShareholderCurrentAccountEntry[];
  periodicReports?: PeriodicReportConfig[];
  fixedAssets?: FixedAsset[];
  vehicleLogbookEntries?: VehicleLogbookEntry[];
  aimProvisionalTaxPeriods?: AimTaxPeriod[];
  subcontractors?: SubcontractorEntry[];
  taxFormDrafts?: IrdTaxFormDraft[];
  ocrReceipts?: OcrReceiptEntry[];
  myIrGatewayState?: MyIrGatewayConnection;
  industryTaxProfiles?: IndustryTaxProfile;
  auditRiskAnalysis?: IrdAuditRiskScore;
  entityStructureScenarios?: EntityStructureScenario[];
  groupConsolidationState?: GroupTaxConsolidation;
  scannedQrItems?: ScannedQrRecipeReceipt[];
}

export interface MyIrGatewayConnection {
  isMyIrConnected: boolean;
  myIrAccountId: string;
  lastEfileSync: string;
  autoFilingEnabled: boolean;
  bankFeedSyncs: BankFeedConnection[];
}

export interface BankFeedConnection {
  bankName: string; // ANZ, ASB, BNZ, Westpac, Kiwibank
  accountName: string;
  accountNumber: string;
  connectionMethod: 'AKAHU_OPEN_BANKING' | 'DIRECT_FEED_API' | 'OFX_CSV_SYNC';
  status: 'ACTIVE' | 'SYNCING' | 'DISCONNECTED';
  lastSyncTime: string;
  unreconciledTxCount: number;
}

export interface IndustryTaxProfile {
  activeIndustry: 'FARMING_AGRICULTURE' | 'CONSTRUCTION_TRADES' | 'HOSPITALITY_RETAIL' | 'HEALTHCARE_MEDICAL';
  farmingData?: {
    stockValuationMethod: 'HERD_SCHEME' | 'NATIONAL_STANDARD_COST';
    dairyCattleHeadCount: number;
    herdSchemeNationalAverageMarketValue: number; // IRD declared valuation rate per head
    incomeEqualisationAccountBalance: number;
  };
  constructionData?: {
    retentionMoneyTrustAccountBalance: number;
    retentionsHeldByClients: number;
    retentionsHeldForSubcontractors: number;
  };
  hospitalityData?: {
    tipsGratuitiesTaxable: number;
    staffMealsProvided: number;
    entertainment50PercentDeductionsTotal: number;
  };
  healthcareData?: {
    gstExemptConsultationsRevenue: number;
    gstRatedCosmeticProductsRevenue: number;
  };
}

export interface IrdAuditRiskScore {
  overallRiskScore: number; // 0 to 100 (lower is safer)
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  auditRiskFlags: AuditRiskFlag[];
  benchmarkComparisons: BenchmarkRatio[];
}

export interface AuditRiskFlag {
  id: string;
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  recommendation: string;
}

export interface BenchmarkRatio {
  metricName: string;
  businessValuePct: number;
  nzIndustryAveragePct: number;
  varianceStatus: 'NORMAL' | 'OUTLIER';
}

export interface EntityStructureScenario {
  id: string;
  scenarioName: string; // e.g. 'Sole Trader vs Company'
  businessProfit: number;
  ownerDrawingsOrSalary: number;
  taxSoleTrader: number;
  taxCompanyAndSalary: number;
  taxLtc: number;
  taxTrust: number;
  recommendedStructure: string;
  estimatedTaxSavings: number;
}

export interface GroupTaxConsolidation {
  parentEntityName: string;
  subsidiaryEntities: GroupEntity[];
  imputationCreditAccountBalance: number;
  groupLossOffsetAvailable: number;
}

export interface GroupEntity {
  id: string;
  entityName: string;
  irdNumber: string;
  ownershipPct: number;
  netProfitLoss: number;
  taxPaid: number;
  lossOffsetClaimed: number;
}

export interface SubcontractorEntry {
  id: string;
  contractorName: string;
  irdNumber: string;
  activityCode: string; // IRD Schedular activity e.g. WT-1 Construction, Cleaning, IT
  wtRatePct: number; // e.g. 15%, 20%, 33%
  hasSpecialTaxRateCert: boolean;
  totalGrossPaid: number;
  totalWithholdingTaxDeducted: number;
  lastPaymentDate: string;
}

export interface IrdTaxFormDraft {
  id: string;
  formType: 'IR3' | 'IR4' | 'IR7'; // Sole Trader, Company, Partnership
  taxYear: string; // e.g. '2026'
  entityName: string;
  irdNumber: string;
  grossRevenue: number;
  totalDeductions: number;
  netTaxableIncome: number;
  taxLiability: number;
  provisionalTaxPaid: number;
  status: 'DRAFT' | 'READY_FOR_IRD' | 'FILED';
}

export interface OcrReceiptEntry {
  id: string;
  vendorName: string;
  date: string;
  grossAmount: number;
  gstAmount: number;
  netAmount: number;
  category: string;
  isEntertainment50PercentLimit: boolean;
  taxDeductiblePct: number; // 100% or 50% or 0%
  confidenceScorePct: number;
  imageUrl?: string;
  status: 'PARSED' | 'VERIFIED' | 'FLAGGED';
}

export interface FixedAsset {
  id: string;
  assetName: string;
  assetNumber: string;
  category: 'VEHICLE' | 'COMPUTER_EQUIPMENT' | 'OFFICE_FURNITURE' | 'PLANT_MACHINERY' | 'BUILDING_IMPROVEMENTS' | 'LOW_VALUE_POOL';
  purchaseDate: string;
  costPrice: string | number;
  residualValue?: number;
  depreciationMethod: 'DV' | 'SL'; // Diminishing Value (DV) or Straight Line (SL)
  irdDepreciationRatePct: number; // IRD rate e.g. 30% for motor vehicles DV, 50% for computers DV
  accumulatedDepreciation: number;
  openingBookValue: number;
  currentBookValue: number;
  isLowValueWriteOff: boolean; // Under $1,000 threshold for immediate tax deduction
  status: 'ACTIVE' | 'DISPOSED' | 'WRITTEN_OFF';
  disposalDate?: string;
  disposalSalePrice?: number;
}

export interface VehicleLogbookEntry {
  id: string;
  vehicleRegistration: string;
  vehicleModel: string;
  date: string;
  driverName: string;
  startKm: number;
  endKm: number;
  businessKm: number;
  personalKm: number;
  purpose: string;
  startLocation?: string;
  destination?: string;
}

export interface AimTaxPeriod {
  id: string;
  gstPeriodName: string; // e.g. 'Apr - May 2026'
  dueDate: string; // e.g. '28 June 2026'
  accountingNetProfit: number;
  taxAdjustments: number;
  taxableIncomePeriod: number;
  aimTaxPayable: number;
  standardUpliftTaxPayable: number;
  status: 'PENDING' | 'FILED_WITH_IRD' | 'PAID';
}

export interface RdProject {
  id: string;
  projectName: string;
  code: string;
  description: string;
  scientificUncertainty: string; // Systematic & investigative approach details
  startDate: string;
  endDate?: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'SUBMITTED_TO_IRD';
  eligiblePersonnelCost: number; // Staff/contractor wages
  eligibleDirectCost: number; // Software, equipment, materials
  eligibleSubcontractorCost: number;
  totalEligibleExpenditure: number; // Sum of eligible costs
  estimatedTaxCredit15Pct: number; // 15% of total eligible expenditure
  isOver50kThreshold: boolean; // Must meet $50,000 NZD minimum threshold for RDTI
  irdApprovalReference?: string;
}

export interface RdExpenditureLog {
  id: string;
  projectId: string;
  date: string;
  description: string;
  category: 'LABOUR' | 'DIRECT_MATERIALS' | 'CONTRACTOR' | 'SOFTWARE_CLOUD' | 'OVERHEAD';
  amount: number;
  eligibilityPercentage: number; // e.g. 100% or 80%
  eligibleAmount: number;
  transactionId?: string;
  notes?: string;
}

export interface Shareholder {
  id: string;
  name: string;
  irdNumber: string;
  email?: string;
  address?: string;
  shareClass: string; // e.g., 'Ordinary A', 'Preference'
  numberOfShares: number;
  sharePercentage: number; // e.g. 50 (%)
  currentAccountBalance: number; // Positive = credit balance (company owes shareholder), Negative = debit balance (shareholder owes company)
  fbtBenchmarkInterestRatePct?: number; // IRD FBT benchmark interest rate e.g. 8.41%
  isDirector: boolean;
  notes?: string;
}

export interface ShareholderCurrentAccountEntry {
  id: string;
  shareholderId: string;
  shareholderName: string;
  date: string;
  description: string;
  type: 'FUNDS_INJECTED' | 'DRAWING' | 'DIVIDEND_CREDIT' | 'INTEREST_CHARGED' | 'SALARY_CREDIT' | 'OTHER';
  amount: number; // positive increases credit balance / reduces debit
  transactionId?: string;
}

export interface PeriodicReportConfig {
  id: string;
  reportTitle: string; // e.g. 'July 2026 Monthly Management Pack'
  periodType: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
  startDate: string;
  endDate: string;
  comparisonMode: 'NONE' | 'PRIOR_PERIOD' | 'PRIOR_YEAR' | 'BUDGET';
  sectionsIncluded: {
    profitAndLoss: boolean;
    balanceSheet: boolean;
    cashFlowHighlights: boolean;
    kpiRatios: boolean;
    taxPosition: boolean;
    executiveSummaryNotes: boolean;
  };
  executiveSummaryNotes?: string;
  preparedBy?: string;
  preparedDate?: string;
}

export interface InvoiceQrPaymentConfig {
  enableQrCode: boolean;
  qrType: 'NZ_BANK_PAYTO' | 'CUSTOM_PAYMENT_URL' | 'CRYPTO_PAY';
  bankAccountNumber?: string;
  bankName?: string;
  customPaymentUrl?: string; // e.g., https://pay.company.co.nz/
}

export interface BusinessEntity {
  id: string;
  name: string;
  tradingName?: string;
  nzbn?: string;
  irdNumber?: string;
  gstNumber?: string;
  entityType: 'SOLE_TRADER' | 'NZ_COMPANY' | 'PARTNERSHIP' | 'REGISTERED_CHARITY' | 'CHURCH_ORGANISATION' | 'LOOK_THROUGH_COMPANY' | 'TRUST';
  colorBadge?: string; // e.g. 'bg-teal-600'
  isDefault?: boolean;
}

export interface BankFeedRule {
  id: string;
  ruleName: string;
  keywords: string[]; // e.g. ['COUNTDOWN', 'PAK N SAVE']
  matchType: 'CONTAINS' | 'EXACT' | 'STARTS_WITH';
  assignedCategory: string;
  assignedIrdTaxCode: string;
  assignedGstType: GSTType;
  autoApprove: boolean;
}

export interface BankFeedItem {
  id: string;
  bankName: 'ANZ' | 'ASB' | 'BNZ' | 'Westpac' | 'Kiwibank';
  accountNumber: string;
  date: string;
  payee: string;
  amount: number; // positive = credit/income, negative = debit/expense
  reference: string;
  particulars?: string;
  code?: string;
  suggestedCategory?: string;
  suggestedGstType?: GSTType;
  suggestedIrdCode?: string;
  status: 'PENDING' | 'MATCHED' | 'IMPORTED' | 'DISCARDED';
}

export interface CustomDashboardMetric {
  id: string;
  title: string;
  description?: string;
  formulaType: 'NET_PROFIT' | 'OPERATING_EXPENSE_RATIO' | 'CASH_RUNWAY' | 'REVENUE_PER_PROJECT' | 'CUSTOM_RATIO';
  numeratorCategory?: string;
  denominatorCategory?: string;
  unit: 'CURRENCY' | 'PERCENTAGE' | 'DAYS' | 'RATIO';
  targetValue?: number;
  colorTheme: 'teal' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'sky';
  isVisible: boolean;
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string;
  frequency: 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  nextDueDate: string;
  autoPost: boolean;
  gstType: GSTType;
  irdTaxCode: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  gstRate: number; // e.g. 0.15 or 0
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-001
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientGstNumber?: string;
  clientAddress?: string;
  clientEmail?: string;
  items: InvoiceItem[];
  gstBasis: 'EXCLUSIVE' | 'INCLUSIVE';
  subtotal: number;
  gstTotal: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  notes?: string;
  paidDate?: string;
  currency?: string; // e.g. NZD, USD, AUD
  foreignTotal?: number;
  exchangeRate?: number;
  tags?: string[];
  portalAccessToken?: string; // Unique token for client portal view
  paymentTerms?: string;
}

export interface Dividend {
  id: string;
  date: string;
  companyName: string;
  shareholderName: string;
  netDividend: number;
  imputationCredits: number;
  rwtDeducted: number;
  grossDividend: number;
  paymentDate: string;
  certificateNumber: string;
}

export interface PayrollEmployee {
  id: string;
  entityId?: string;
  name: string;
  email?: string;
  irdNumber: string;
  taxCode: string; // e.g. M, M SL, S, SH, ST
  kiwiSaverEmployeeRate: number; // e.g. 3, 4, 6, 8, 10 (%)
  kiwiSaverEmployerRate: number; // e.g. 3 (%)
  employeeAccLevyRate?: number; // e.g. 1.60 (%) ACC Employee Earner / Work Levy
  employerAccLevyRate?: number; // e.g. 0.72 (%) ACC Employer Work Levy
  grossWage: number; // Pay rate per period
  payFrequency: 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY';
  hourlyRate?: number;
  hoursWorked?: number;
  hasStudentLoan?: boolean;
  voluntaryStudentLoanDeduction?: number;
  childSupportDeduction?: number; // IRD Mandated Child Support deduction ($)
  courtAttachmentDeduction?: number; // IRD / Ministry of Justice court attachment ($)
}

export interface PayslipRecord {
  id: string;
  entityId?: string;
  employeeId: string;
  employeeName: string;
  employeeEmail?: string;
  payDate: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossPay: number;
  basePayeTax: number;
  studentLoanDeduction: number;
  payeTax: number; // Total PAYE (Base PAYE + SL)
  accLevy: number; // Employee ACC Earners levy
  employerAccLevy?: number; // Employer ACC Work Levy
  kiwiSaverEmployee: number;
  kiwiSaverEmployer: number;
  esctTax?: number; // Employer Superannuation Contribution Tax
  childSupportDeduction?: number;
  courtAttachmentDeduction?: number;
  totalEmployerContributions?: number; // Employer KS + Employer ACC + ESCT
  totalEmployerCost?: number; // Gross Pay + Employer Contributions
  totalIrdPayable: number; // Total amount required to pay IRD (PAYE + SL + ACC + ESCT + Child Support + Attachments)
  netPay: number;
  taxCode: string;
}

export interface LoanMortgage {
  id: string;
  name: string;
  lender: string;
  totalPrincipal: number;
  remainingBalance: number;
  interestRatePct: number; // e.g. 6.85
  monthlyPayment: number;
  termMonths: number;
  startDate: string;
  loanType: 'MORTGAGE' | 'BUSINESS_LOAN' | 'VEHICLE_FINANCE' | 'EQUIPMENT_FINANCE';
  taxDeductibleInterestPct: number; // e.g. 100% for business, 0-100%
}

export interface CategoryBudget {
  category: string;
  monthlyLimit: number;
  alertThresholdPct?: number; // e.g. 80 (%)
}

export interface RecurringInvoiceSchedule {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  clientGstNumber?: string;
  frequency: 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  nextDueDate: string;
  items: InvoiceItem[];
  gstBasis: 'EXCLUSIVE' | 'INCLUSIVE';
  subtotal: number;
  gstTotal: number;
  total: number;
  status: 'ACTIVE' | 'PAUSED';
  notes?: string;
}

export interface CompanySettings {
  tradingName: string;
  legalName: string;
  irdNumber: string; // 8 or 9 digit IRD number e.g. 123-456-789
  nzbn?: string; // New Zealand Business Number (13 digits)
  ccNumber?: string; // Charities Services CC Number e.g. CC58921
  isCharityRegistered?: boolean;
  charityTier?: 'TIER_3' | 'TIER_4';
  officialSignatoryName?: string;
  officialSignatoryTitle?: string;
  companyDirector?: string;
  gstNumber: string;
  gstFilingFrequency: '2_MONTHLY' | '6_MONTHLY' | 'MONTHLY';
  gstBasis: 'PAYMENTS' | 'INVOICE' | 'HYBRID';
  financialYearEndMonth: number; // 3 for March 31
  entityType: 'SOLE_TRADER' | 'NZ_COMPANY' | 'INDIVIDUAL' | 'PARTNERSHIP' | 'REGISTERED_CHARITY' | 'CHURCH_ORGANISATION' | 'LOOK_THROUGH_COMPANY' | 'TRUST';
  pinCode: string; // empty string if disabled
  isPinEnabled: boolean;
  businessAddress: string;
  bankAccountDetails: string;
}

export interface CurrencyRate {
  code: string; // e.g. USD, AUD, EUR, GBP, JPY, CAD, SGD
  name: string; // e.g. US Dollar
  rateToNzd: number; // e.g. 1 USD = 1.6393 NZD or 1 NZD = 0.61 USD (we store NZD per 1 Foreign unit)
  symbol: string;
  lastUpdated: string;
}

export interface DocumentTag {
  id: string;
  name: string; // e.g. '#TaxDeductible'
  color: string; // e.g. 'bg-emerald-100 text-emerald-800 border-emerald-300'
  category: 'TAX' | 'EXPENSE_TYPE' | 'AUDIT' | 'ASSET' | 'PROJECT' | 'CUSTOM';
  description?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  action: string;
  details: string;
  user: string;
}

export interface BankStatementItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  rawReference: string;
  matchedTransactionId?: string;
  isReconciled: boolean;
}

export interface ScannedQrRecipeReceipt {
  id: string;
  type: 'RECEIPT' | 'RECIPE' | 'QR_CODE';
  title: string;
  sourceOrMerchant: string;
  date: string;
  totalAmount?: number;
  gstAmount?: number;
  category?: string;
  qrRawContent?: string;
  ingredientsOrItems?: string[];
  instructionsOrNotes?: string;
  savedAt: string;
  isBookmarked?: boolean;
}

