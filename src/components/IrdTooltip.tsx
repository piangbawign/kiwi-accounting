import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

export interface IrdTooltipProps {
  term: string;
  explanation: string;
  children?: React.ReactNode;
  iconOnly?: boolean;
}

export const IRD_DICTIONARY: Record<string, { title: string; text: string }> = {
  BOX_5: {
    title: 'Box 5: Total Sales & Income',
    text: 'All gross sales, fees, and revenue collected during this GST period including 15% GST.',
  },
  BOX_6: {
    title: 'Box 6: Zero-Rated Sales',
    text: 'Sales subject to 0% GST rate (e.g., exported goods, overseas services, financial services).',
  },
  BOX_7: {
    title: 'Box 7: GST on Sales',
    text: 'Calculated as (Box 5 − Box 6) × 3/23. Represents the 15% output GST owed to IRD.',
  },
  BOX_8: {
    title: 'Box 8: Total Purchases & Expenses',
    text: 'Total business expenses and assets bought including 15% GST for which you hold tax invoices.',
  },
  BOX_9: {
    title: 'Box 9: GST on Purchases',
    text: 'Calculated as Box 8 × 3/23. The GST input tax credit you claim back from IRD.',
  },
  BOX_10: {
    title: 'Box 10: Net GST Result',
    text: 'Difference between Box 7 and Box 9. Positive = Payable to IRD. Negative = Refund due from IRD.',
  },
  PROVISIONAL_TAX: {
    title: 'Provisional Tax (RIT > $5,000)',
    text: 'Required by IRD if your Residual Income Tax exceeds $5,000. Paid in 3 installments (28 Aug, 15 Jan, 7 May).',
  },
  IR526_REBATE: {
    title: 'IR526 Donation Tax Credit (33.33%)',
    text: 'Donors to registered Charities & Churches can claim back 33.33 cents for every dollar donated over $5.',
  },
  GST_FRACTION: {
    title: '3/23 Fraction Rule',
    text: 'Extracts 15% GST from a GST-inclusive amount. E.g., $115 gross ÷ 23 × 3 = $15 GST component.',
  },
  GST_BASIS: {
    title: 'GST Accounting Basis',
    text: 'Payments Basis = GST reported when cash is received/paid. Invoice Basis = GST reported when invoice is issued.',
  },
  ACC_LEVY: {
    title: 'ACC Earners Levy (~1.60%)',
    text: 'Standard accident compensation levy on self-employed earnings up to the annual earner maximum threshold.',
  },
};

export const IrdTooltip: React.FC<IrdTooltipProps> = ({
  term,
  explanation,
  children,
  iconOnly = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center group cursor-help ml-1"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsVisible(!isVisible);
      }}
    >
      {children ? (
        <span className="border-b border-dotted border-slate-400 group-hover:border-teal-600 transition-colors">
          {children}
        </span>
      ) : null}

      <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0 ml-1" />

      {/* Floating Tooltip Box */}
      {isVisible && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white rounded-xl shadow-2xl text-[11px] leading-relaxed z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100"
          style={{ width: '240px' }}
        >
          <div className="font-extrabold text-teal-300 text-xs mb-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            {term}
          </div>
          <p className="text-slate-200 font-medium">{explanation}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </span>
  );
};
