import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, CreditCard, Landmark, ExternalLink, Check, Copy } from 'lucide-react';

interface InvoiceQrCodeProps {
  invoiceNumber: string;
  amount: number;
  bankAccountDetails?: string;
  companyName?: string;
  clientName?: string;
  customPaymentUrl?: string;
  qrType?: 'NZ_BANK_PAYTO' | 'CUSTOM_PAYMENT_URL' | 'CRYPTO_PAY';
  size?: number;
}

export const InvoiceQrCode: React.FC<InvoiceQrCodeProps> = ({
  invoiceNumber,
  amount,
  bankAccountDetails = '01-0123-0456789-00',
  companyName = 'Kiwi Business Ltd',
  clientName,
  customPaymentUrl,
  qrType = 'NZ_BANK_PAYTO',
  size = 140,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Format Bank Transfer Payload or Custom URL
  const qrPayload = React.useMemo(() => {
    if (qrType === 'CUSTOM_PAYMENT_URL' && customPaymentUrl) {
      return customPaymentUrl;
    }

    if (qrType === 'CRYPTO_PAY') {
      return `solana:${companyName}?amount=${amount}&reference=${invoiceNumber}`;
    }

    // Default NZ Bank Account PayTo / Direct Transfer Payload Standard
    const cleanedAccount = bankAccountDetails.replace(/[^0-9]/g, '');
    return `nzpayTo://transfer?acc=${cleanedAccount}&amt=${amount.toFixed(
      2
    )}&ref=${encodeURIComponent(invoiceNumber)}&part=${encodeURIComponent(
      companyName.slice(0, 12)
    )}&code=${encodeURIComponent(clientName ? clientName.slice(0, 12) : 'INVOICE')}`;
  }, [qrType, customPaymentUrl, bankAccountDetails, amount, invoiceNumber, companyName, clientName]);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(qrPayload, {
      width: size,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [qrPayload, size]);

  const handleCopyBankDetails = () => {
    navigator.clipboard.writeText(`${bankAccountDetails} - Ref: ${invoiceNumber} - Amount: $${amount.toFixed(2)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 text-xs">
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs shrink-0 flex flex-col items-center">
        {dataUrl ? (
          <img src={dataUrl} alt={`Payment QR Code for ${invoiceNumber}`} className="w-28 h-28 object-contain rounded-lg" />
        ) : (
          <div className="w-28 h-28 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
            <QrCode className="w-8 h-8 animate-pulse text-indigo-500" />
          </div>
        )}
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Scan To Pay</span>
      </div>

      <div className="space-y-1.5 flex-1">
        <div className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
          <Landmark className="w-4 h-4 text-indigo-600" />
          <span>NZ Instant Bank Payment QR</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-snug">
          Scan with any NZ Banking App or camera to auto-populate transfer details:
        </p>

        <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1 text-[11px] font-mono">
          <div className="flex justify-between text-slate-700">
            <span className="text-slate-400 font-sans">Bank Acc:</span>
            <span className="font-bold">{bankAccountDetails}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span className="text-slate-400 font-sans">Reference:</span>
            <span className="font-bold text-indigo-700">{invoiceNumber}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span className="text-slate-400 font-sans">Amount:</span>
            <span className="font-bold text-emerald-700">${amount.toFixed(2)} NZD</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyBankDetails}
          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-0.5"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Bank details copied!' : 'Copy bank details'}</span>
        </button>
      </div>
    </div>
  );
};
