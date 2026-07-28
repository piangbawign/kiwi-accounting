import { GSTType, Transaction } from '../types';

export interface AutoCategoryRule {
  keywords: string[];
  category: string;
  irdCode: string;
  defaultGst: GSTType;
  type?: 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'TAX_PAYMENT';
}

export const NZ_AUTO_CATEGORY_RULES: AutoCategoryRule[] = [
  // Motor Vehicle & Fuel
  {
    keywords: ['z energy', 'bp', 'caltex', 'gull', 'mobil', 'waitomo', 'challenge', 'npd', 'gasoline', 'petrol', 'fuel', 'oil', 'aa auto'],
    category: 'Motor Vehicle & Fuel',
    irdCode: '410 - Vehicle Running Costs',
    defaultGst: 'STANDARD_15',
    type: 'EXPENSE',
  },
  // Hardware, Computer & Tech
  {
    keywords: ['pb tech', 'pbtech', 'jaycar', 'apple', 'micro ream', 'computer', 'noel leeming', 'jbhifi', 'jb hi-fi', 'harvey norman tech'],
    category: 'Tools & Computer Equipment',
    irdCode: '310 - Hardware & Assets',
    defaultGst: 'STANDARD_15',
    type: 'EXPENSE',
  },
  // Telco & Utilities
  {
    keywords: ['spark', 'one nz', 'vodafone', '2degrees', 'skinny', 'chorus', 'mercury', 'genesis', 'contact energy', 'electric kiwi', 'trustpower', 'powershop', 'broadband', 'internet', 'mobile'],
    category: 'Utilities & Telco',
    irdCode: '340 - Telephone & Internet',
    defaultGst: 'STANDARD_15',
    type: 'EXPENSE',
  },
  // Software & Cloud Subscriptions
  {
    keywords: ['xero', 'figma', 'github', 'aws', 'amazon web', 'google cloud', 'gsuite', 'google workspace', 'microsoft 365', 'office 365', 'slack', 'zoom', 'adobe', 'canva', 'dropbox', 'chatgpt', 'openai', 'anthropic'],
    category: 'Subscriptions & Software',
    irdCode: '350 - Software Services',
    defaultGst: 'STANDARD_15',
    type: 'EXPENSE',
  },
  // Office Supplies & Building Materials
  {
    keywords: ['officemax', 'warehouse stationery', 'bunnings', 'mitre 10', 'placemakers', 'carters', 'stationery', 'paper', 'printer ink'],
    category: 'Office Supplies & Stationery',
    irdCode: '300 - Office Expenses',
    defaultGst: 'STANDARD_15',
    type: 'EXPENSE',
  },
  // Supermarkets & Refreshments
  {
    keywords: ['countdown', 'woolworths', 'paknsave', 'pak n save', 'new world', 'four square', 'farro', 'groceries', 'coffee', 'cafe', 'mcdonalds', 'subway'],
    category: 'Meals & Entertainment (50% Tax Deductible)',
    irdCode: '370 - Entertainment',
    defaultGst: 'STANDARD_15',
    type: 'EXPENSE',
  },
  // Travel & Transit
  {
    keywords: ['air new zealand', 'air nz', 'uber', 'lime', 'fullers', 'interislander', 'at hop', 'auckland transport', 'metlink', 'taxi', 'parking', 'wilson parking'],
    category: 'Travel & Accommodation',
    irdCode: '360 - Business Travel',
    defaultGst: 'STANDARD_15',
    type: 'EXPENSE',
  },
  // Banking & Fees
  {
    keywords: ['account fee', 'bank fee', 'merchant fee', 'stripe fee', 'paypal fee', 'card fee', 'overdraft fee', 'interest paid'],
    category: 'Bank Fees & Interest',
    irdCode: '400 - Financial Charges',
    defaultGst: 'EXEMPT',
    type: 'EXPENSE',
  },
  // Inland Revenue & Tax
  {
    keywords: ['inland revenue', 'ird', 'gst payment', 'provisional tax', 'paye payment', 'acc levy', 'tax settlement'],
    category: 'GST Paid / Refunded IRD',
    irdCode: 'TAX - IRD GST Settlement',
    defaultGst: 'NO_GST',
    type: 'TAX_PAYMENT',
  },
  // Income / Client Sales
  {
    keywords: ['invoice payment', 'consulting fee', 'client payment', 'stripe payout', 'shopify payout', 'sales revenue', 'direct credit', 'service fee received'],
    category: 'Sales & Consulting Income',
    irdCode: '100 - Operating Income',
    defaultGst: 'STANDARD_15',
    type: 'INCOME',
  },
];

/**
 * Suggests an auto-category rule based on transaction description or merchant name
 */
export function suggestCategoryForDescription(description: string): AutoCategoryRule | null {
  if (!description) return null;
  const lower = description.toLowerCase().trim();

  for (const rule of NZ_AUTO_CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return rule;
      }
    }
  }

  return null;
}

/**
 * Auto-categorizes an array of transactions if they are unclassified or generic.
 * Returns the updated list and total count of auto-categorized items.
 */
export function autoCategorizeAllTransactions(transactions: Transaction[]): {
  updatedTransactions: Transaction[];
  categorizedCount: number;
} {
  let count = 0;

  const updatedTransactions = transactions.map((tx) => {
    // Check if category is generic or unclassified
    const isGenericCategory =
      !tx.category ||
      tx.category === 'General Expense' ||
      tx.category === 'Uncategorized' ||
      tx.category === 'Miscellaneous' ||
      tx.category === 'Other';

    if (isGenericCategory) {
      const match = suggestCategoryForDescription(tx.description);
      if (match) {
        count++;
        return {
          ...tx,
          category: match.category,
          irdTaxCode: match.irdCode,
          gstType: match.defaultGst,
          notes: tx.notes
            ? `${tx.notes} (⚡ Auto-categorized via NZ Rule Engine)`
            : '⚡ Auto-categorized via NZ Rule Engine',
        };
      }
    }
    return tx;
  });

  return { updatedTransactions, categorizedCount: count };
}
