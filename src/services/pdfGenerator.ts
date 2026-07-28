import { jsPDF } from 'jspdf';
import { Invoice, CompanySettings, Transaction, ChurchDonationReceipt, ChurchDonor, AppState, PayrollEmployee, PayslipRecord } from '../types';
import { calculateNZPayroll } from './nzTaxEngine';

/**
 * Generates an official IRD-compliant NZ Tax Invoice PDF
 */
export function generateTaxInvoicePDF(invoice: Invoice, company: CompanySettings): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Color Palette
  const darkTeal = '#0f766e';
  const slateDark = '#0f172a';
  const slateGray = '#64748b';
  const lightBg = '#f8fafc';

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate dark
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('TAX INVOICE', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, 26);
  doc.text(`IRD Tax Compliant • GST Reg: ${company.gstNumber || company.irdNumber}`, 14, 31);

  // Company / Issuer Info (Right Top)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(company.legalName || 'KiwiLedger NZ Ltd', 196, 14, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Trading Name: ${company.tradingName}`, 196, 19, { align: 'right' });
  doc.text(`GST No: ${company.gstNumber || company.irdNumber}`, 196, 23, { align: 'right' });
  doc.text(`Address: ${company.businessAddress || 'Auckland, NZ'}`, 196, 27, { align: 'right' });

  // Bill To & Dates Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 42, 182, 32, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 118, 110); // Teal
  doc.text('BILL TO:', 18, 49);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(invoice.clientName, 18, 55);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  if (invoice.clientGstNumber) doc.text(`Client GST No: ${invoice.clientGstNumber}`, 18, 60);
  if (invoice.clientEmail) doc.text(`Client Email: ${invoice.clientEmail}`, 18, 65);

  // Dates Right
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('INVOICE DETAILS:', 130, 49);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Issue Date: ${invoice.issueDate}`, 130, 55);
  doc.text(`Due Date: ${invoice.dueDate}`, 130, 60);
  doc.text(`Status: ${invoice.status}`, 130, 65);

  // Items Table Header
  let y = 82;
  doc.setFillColor(15, 118, 110);
  doc.rect(14, y, 182, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('ITEM DESCRIPTION', 18, y + 5.5);
  doc.text('QTY', 120, y + 5.5, { align: 'center' });
  doc.text('UNIT PRICE', 150, y + 5.5, { align: 'right' });
  doc.text('AMOUNT ($)', 190, y + 5.5, { align: 'right' });

  // Items Table Rows
  y += 8;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  invoice.items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 9, 'F');
    }

    doc.text(item.description, 18, y + 6);
    doc.text(String(item.quantity), 120, y + 6, { align: 'center' });
    doc.text(`$${item.unitPrice.toFixed(2)}`, 150, y + 6, { align: 'right' });
    doc.text(`$${item.amount.toFixed(2)}`, 190, y + 6, { align: 'right' });

    y += 9;
  });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y + 2, 196, y + 2);
  y += 8;

  // Totals Box (Right Aligned)
  const totalX = 120;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Subtotal (excl. GST):', totalX, y);
  doc.text(`$${invoice.subtotal.toFixed(2)}`, 190, y, { align: 'right' });

  y += 6;
  doc.text('GST Total (15% NZD):', totalX, y);
  doc.text(`$${invoice.gstTotal.toFixed(2)}`, 190, y, { align: 'right' });

  y += 7;
  doc.setFillColor(15, 23, 42);
  doc.rect(totalX - 2, y - 4, 78, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL AMOUNT DUE:', totalX, y + 2);
  doc.text(`$${invoice.total.toFixed(2)} NZD`, 190, y + 2, { align: 'right' });

  // Payment Terms / Bank Account Box
  y += 20;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 25, 3, 3, 'FD');

  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PAYMENT INSTRUCTIONS:', 18, y + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Bank Account: ${company.bankAccountDetails || '02-0100-0123456-00 (BNZ)'}`, 18, y + 14);
  doc.text(`Please use Invoice Reference: ${invoice.invoiceNumber}`, 18, y + 20);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated by KiwiLedger NZ Accounting Engine • IRD Compliant Tax Document', 105, 285, { align: 'center' });

  doc.save(`${invoice.invoiceNumber}_Tax_Invoice.pdf`);
}

/**
 * Generates an official Profit & Loss Statement PDF
 */
export function generateProfitLossPDF(
  transactions: Transaction[],
  company: CompanySettings,
  periodTitle = 'Financial Year 2025/2026'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Title Banner
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('PROFIT & LOSS STATEMENT', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${company.legalName || company.tradingName} • IRD: ${company.irdNumber}`, 14, 26);
  doc.text(`Reporting Period: ${periodTitle}`, 196, 26, { align: 'right' });

  // Calculate totals
  const incomeTx = transactions.filter((t) => t.type === 'INCOME');
  const expenseTx = transactions.filter((t) => t.type === 'EXPENSE');

  const totalIncome = incomeTx.reduce((sum, t) => sum + (t.amount - t.gstAmount), 0);
  const totalExpense = expenseTx.reduce((sum, t) => sum + (t.amount - t.gstAmount), 0);
  const netProfit = totalIncome - totalExpense;

  let y = 42;

  // Revenue Section Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. OPERATING REVENUE (Excl. GST)', 18, y + 5);

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // Group Income by Category
  const incomeCategories: { [cat: string]: number } = {};
  incomeTx.forEach((t) => {
    const exGst = t.amount - t.gstAmount;
    incomeCategories[t.category] = (incomeCategories[t.category] || 0) + exGst;
  });

  Object.entries(incomeCategories).forEach(([cat, val]) => {
    doc.text(cat, 22, y);
    doc.text(`$${val.toFixed(2)}`, 190, y, { align: 'right' });
    y += 6;
  });

  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL OPERATING REVENUE:', 22, y + 2);
  doc.text(`$${totalIncome.toFixed(2)}`, 190, y + 2, { align: 'right' });

  y += 12;

  // Operating Expenses Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. OPERATING EXPENSES (Excl. GST)', 18, y + 5);

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // Group Expenses by Category
  const expenseCategories: { [cat: string]: number } = {};
  expenseTx.forEach((t) => {
    const exGst = t.amount - t.gstAmount;
    expenseCategories[t.category] = (expenseCategories[t.category] || 0) + exGst;
  });

  Object.entries(expenseCategories).forEach(([cat, val]) => {
    doc.text(cat, 22, y);
    doc.text(`$${val.toFixed(2)}`, 190, y, { align: 'right' });
    y += 6;
  });

  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL OPERATING EXPENSES:', 22, y + 2);
  doc.text(`$${totalExpense.toFixed(2)}`, 190, y + 2, { align: 'right' });

  y += 16;

  // Net Profit Box
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, 182, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('NET OPERATING PROFIT / (LOSS) BEFORE TAX:', 18, y + 8);
  doc.text(`$${netProfit.toFixed(2)} NZD`, 190, y + 8, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated on ${new Date().toISOString().split('T')[0]} • KiwiLedger Financial Engine`, 105, 285, { align: 'center' });

  doc.save(`Profit_and_Loss_${periodTitle.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Builds an official IRD GST101 Summary Return jsPDF document
 */
export function buildGstReturnDoc(
  gstSummary: {
    totalSales: number;
    zeroRatedSales?: number;
    gstOnSales: number;
    totalPurchases: number;
    gstOnPurchases: number;
    netGstPayable: number;
    isPayable?: boolean;
    periodLabel: string;
    startDate?: string;
    endDate?: string;
  },
  company: CompanySettings
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const zeroRated = gstSummary.zeroRatedSales || 0;
  const isPayable = gstSummary.isPayable !== undefined ? gstSummary.isPayable : gstSummary.netGstPayable >= 0;
  const netAmount = Math.abs(gstSummary.netGstPayable);

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 34, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('NZ INLAND REVENUE • GST101 WORKSHEET', 14, 16);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`GST Reg No: ${company.gstNumber || company.irdNumber || 'N/A'} • Accounting Basis: ${company.gstBasis || 'PAYMENTS'}`, 14, 25);
  doc.text(`Return Period: ${gstSummary.periodLabel}`, 196, 16, { align: 'right' });
  if (gstSummary.startDate && gstSummary.endDate) {
    doc.text(`Date Range: ${gstSummary.startDate} to ${gstSummary.endDate}`, 196, 25, { align: 'right' });
  }

  let y = 42;

  // Business Profile Info
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, 182, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Business Name: ${company.legalName || 'Registered Business'}`, 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Trading as: ${company.tradingName || company.legalName}`, 18, y + 12);
  doc.text(`Filing Frequency: ${(company.gstFilingFrequency || '2_MONTHLY').replace('_', ' ')}`, 120, y + 6);
  doc.text(`Financial Year End: Month ${company.financialYearEndMonth || 3}`, 120, y + 12);

  y += 24;

  // Title Section A
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 118, 110);
  doc.text('SECTION A: SALES AND INCOME (GST OUTPUT TAX)', 14, y);
  y += 4;

  // Box Calculations
  const sectionABoxes = [
    { num: 'Box 5', label: 'Total Sales & Income for period (including GST)', val: gstSummary.totalSales, bold: true },
    { num: 'Box 6', label: 'Zero-rated sales included in Box 5', val: zeroRated, bold: false },
    { num: 'Box 7', label: 'GST on sales and income [(Box 5 - Box 6) × 3/23]', val: gstSummary.gstOnSales, highlight: true },
  ];

  sectionABoxes.forEach((box) => {
    if (box.highlight) {
      doc.setFillColor(204, 251, 241);
      doc.rect(14, y, 182, 9, 'F');
      doc.setTextColor(15, 118, 110);
    } else {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 9, 'F');
      doc.setTextColor(15, 23, 42);
    }

    doc.setFont('helvetica', 'bold');
    doc.text(box.num, 18, y + 6);

    doc.setFont('helvetica', box.bold || box.highlight ? 'bold' : 'normal');
    doc.text(box.label, 36, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.text(`$${box.val.toFixed(2)}`, 190, y + 6, { align: 'right' });

    y += 11;
  });

  y += 4;

  // Title Section B
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 118, 110);
  doc.text('SECTION B: PURCHASES AND EXPENSES (GST INPUT TAX)', 14, y);
  y += 4;

  const sectionBBoxes = [
    { num: 'Box 8', label: 'Total Purchases & Expenses (including GST)', val: gstSummary.totalPurchases, bold: true },
    { num: 'Box 9', label: 'GST on purchases and expenses [Box 8 × 3/23]', val: gstSummary.gstOnPurchases, highlight: true },
  ];

  sectionBBoxes.forEach((box) => {
    if (box.highlight) {
      doc.setFillColor(204, 251, 241);
      doc.rect(14, y, 182, 9, 'F');
      doc.setTextColor(15, 118, 110);
    } else {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 9, 'F');
      doc.setTextColor(15, 23, 42);
    }

    doc.setFont('helvetica', 'bold');
    doc.text(box.num, 18, y + 6);

    doc.setFont('helvetica', box.bold || box.highlight ? 'bold' : 'normal');
    doc.text(box.label, 36, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.text(`$${box.val.toFixed(2)}`, 190, y + 6, { align: 'right' });

    y += 11;
  });

  y += 6;

  // Section C: Box 10 Result
  if (isPayable) {
    doc.setFillColor(15, 23, 42); // Dark Navy for payable
  } else {
    doc.setFillColor(6, 78, 59); // Dark Emerald for refund
  }
  doc.roundedRect(14, y, 182, 22, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('BOX 10: NET GST RESULT FOR PERIOD', 20, y + 9);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text('Difference between Box 7 (Sales GST) and Box 9 (Purchases GST)', 20, y + 16);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  if (isPayable) {
    doc.setTextColor(251, 191, 36); // Amber
    doc.text(`PAYABLE: $${netAmount.toFixed(2)} NZD`, 190, y + 13, { align: 'right' });
  } else {
    doc.setTextColor(52, 211, 153); // Emerald
    doc.text(`REFUND DUE: $${netAmount.toFixed(2)} NZD`, 190, y + 13, { align: 'right' });
  }

  y += 30;

  // Declaration & Signature block for myIR filing
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, 182, 34);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DECLARATION FOR INLAND REVENUE (myIR) FILING', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('I declare that the information given in this return is true and correct and has been calculated', 18, y + 12);
  doc.text('in accordance with the Goods and Services Tax Act 1985.', 18, y + 16);

  doc.text('Authorized Signature: ___________________________________', 18, y + 27);
  doc.text('Date: ____ / ____ / ________', 130, y + 27);

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Prepared for Inland Revenue myIR Filing • KiwiLedger NZ Tax & Accounting System', 105, 285, { align: 'center' });

  return doc;
}

/**
 * Generates and downloads an official IRD GST101 Summary Return PDF
 */
export function generateGstReturnPDF(
  gstSummary: {
    totalSales: number;
    zeroRatedSales?: number;
    gstOnSales: number;
    totalPurchases: number;
    gstOnPurchases: number;
    netGstPayable: number;
    isPayable?: boolean;
    periodLabel: string;
    startDate?: string;
    endDate?: string;
  },
  company: CompanySettings
): void {
  const doc = buildGstReturnDoc(gstSummary, company);
  doc.save(`GST101_Return_${gstSummary.periodLabel.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

/**
 * Generates and prints an official IRD GST101 Summary Return PDF via print dialog
 */
export function printGstReturnPDF(
  gstSummary: {
    totalSales: number;
    zeroRatedSales?: number;
    gstOnSales: number;
    totalPurchases: number;
    gstOnPurchases: number;
    netGstPayable: number;
    isPayable?: boolean;
    periodLabel: string;
    startDate?: string;
    endDate?: string;
  },
  company: CompanySettings
): void {
  const doc = buildGstReturnDoc(gstSummary, company);
  doc.autoPrint();

  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = blobUrl;
  document.body.appendChild(iframe);

  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe printing caught error, opening window fallback:', err);
        const printWin = window.open(blobUrl, '_blank');
        if (printWin) {
          printWin.onload = () => printWin.print();
        }
      }
    }, 200);
  };
}

/**
 * Generates an official IR526 Donor Tax Receipt PDF for NZ Charities
 */
export function generateDonationReceiptPDF(
  receipt: ChurchDonationReceipt,
  donor: ChurchDonor,
  company: CompanySettings
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('OFFICIAL DONATION TAX RECEIPT', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Issued under Section LD 1 of the Income Tax Act 2007 (NZ Tax Credit)', 14, 26);
  doc.text(`Receipt No: ${receipt.receiptNumber}`, 196, 26, { align: 'right' });

  // Organization Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(company.legalName || 'Auckland Faith Church & Charity', 14, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Charities Commission Reg No: CC9876543 • IRD Donee Status Approved`, 14, 50);

  // Donor Details Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 56, 182, 28, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('DONOR DETAILS:', 18, 63);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(donor.name, 18, 70);

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  if (donor.email) doc.text(`Email: ${donor.email}`, 18, 76);

  // Donation Amount Box
  doc.setFillColor(15, 118, 110);
  doc.rect(14, 90, 182, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL UNCONDITIONAL GIFT DONATION:', 18, 101);
  doc.setFontSize(16);
  doc.text(`$${receipt.totalTaxDeductibleAmount.toFixed(2)} NZD`, 190, 101, { align: 'right' });

  // Tax Credit Estimate Box
  const taxCreditEst = receipt.totalTaxDeductibleAmount * (33.3333 / 100);
  doc.setFillColor(240, 253, 250);
  doc.setDrawColor(204, 251, 241);
  doc.roundedRect(14, 114, 182, 16, 3, 3, 'FD');

  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`Estimated IRD IR526 Tax Rebate Claim (33.33%): ~$${taxCreditEst.toFixed(2)} NZD`, 18, 124);

  // Compliance Statement
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This receipt certifies that the above payment was an unconditional donation with no direct commercial benefit received in return.',
    14,
    140
  );

  // Signature Block
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 175, 80, 175);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Authorized Treasurer Signature', 14, 180);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date Issued: ${receipt.issueDate}`, 14, 185);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('NZ IRD Form IR526 Compliant Tax Receipt • KiwiLedger Non-Profit Engine', 105, 285, { align: 'center' });

  doc.save(`${receipt.receiptNumber}_Donation_Receipt.pdf`);
}

/**
 * 5. Generate Full Executive Financial Report PDF
 */
export function generateFinancialSummaryPDF(appState: AppState) {
  const doc = new jsPDF();
  const company = appState.companySettings;

  // Primary Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('EXECUTIVE FINANCIAL REPORT', 14, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('NZ IRD Compliant General Ledger & Tax Summary', 14, 28);

  doc.text(`${company.tradingName || company.legalName}`, 196, 18, { align: 'right' });
  doc.text(`IRD No: ${company.irdNumber || '123-456-789'}`, 196, 24, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-NZ')}`, 196, 30, { align: 'right' });

  // Key Financial Metrics
  const incomeTx = appState.transactions.filter((t) => t.type === 'INCOME');
  const expenseTx = appState.transactions.filter((t) => t.type === 'EXPENSE');

  const totalIncome = incomeTx.reduce((sum, t) => sum + (t.amount - t.gstAmount), 0);
  const totalExpense = expenseTx.reduce((sum, t) => sum + (t.amount - t.gstAmount), 0);
  const totalGstCollected = incomeTx.reduce((sum, t) => sum + t.gstAmount, 0);
  const totalGstPaid = expenseTx.reduce((sum, t) => sum + t.gstAmount, 0);
  const netProfit = totalIncome - totalExpense;
  const netGstPayable = totalGstCollected - totalGstPaid;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 44, 182, 38, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.setFontSize(10);
  doc.text('FINANCIAL SUMMARY OVERVIEW (Excl. GST)', 18, 52);

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  doc.text(`Total Operating Income:`, 18, 61);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${totalIncome.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}`, 80, 61);

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Operating Expenses:`, 18, 68);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${totalExpense.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}`, 80, 68);

  doc.setFont('helvetica', 'normal');
  doc.text(`Net Taxable Operating Profit:`, 18, 75);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(netProfit >= 0 ? 15 : 225, netProfit >= 0 ? 118 : 29, netProfit >= 0 ? 110 : 72);
  doc.text(`$${netProfit.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}`, 80, 75);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Net GST Payable / (Refund):`, 110, 61);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${netGstPayable.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}`, 170, 61);

  doc.setFont('helvetica', 'normal');
  doc.text(`Active Bank Accounts:`, 110, 68);
  doc.setFont('helvetica', 'bold');
  doc.text(`${appState.accounts.length} Accounts`, 170, 68);

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Ledger Entries:`, 110, 75);
  doc.setFont('helvetica', 'bold');
  doc.text(`${appState.transactions.length} Transactions`, 170, 75);

  // Bank Balances Table
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.setFontSize(10);
  doc.text('BANK ACCOUNTS & LIQUIDITY', 14, 92);

  let currentY = 96;
  doc.setFillColor(15, 118, 110);
  doc.rect(14, currentY, 182, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Account Name', 18, currentY + 4.5);
  doc.text('Bank', 75, currentY + 4.5);
  doc.text('Account Number', 115, currentY + 4.5);
  doc.text('Balance', 190, currentY + 4.5, { align: 'right' });

  currentY += 6;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  appState.accounts.forEach((a, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, 182, 6, 'F');
    }
    doc.text(a.name.slice(0, 28), 18, currentY + 4.5);
    doc.text(a.bankName, 75, currentY + 4.5);
    doc.text(a.accountNumber, 115, currentY + 4.5);
    doc.text(`$${a.balance.toLocaleString('en-NZ', { minimumFractionDigits: 2 })} NZD`, 190, currentY + 4.5, { align: 'right' });
    currentY += 6;
  });

  currentY += 8;

  // Recent Transactions Table
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.setFontSize(10);
  doc.text('RECENT GENERAL LEDGER TRANSACTIONS', 14, currentY);

  currentY += 4;
  doc.setFillColor(15, 23, 42);
  doc.rect(14, currentY, 182, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text('Date', 18, currentY + 4.5);
  doc.text('Payee / Description', 40, currentY + 4.5);
  doc.text('Category', 105, currentY + 4.5);
  doc.text('IRD Code', 145, currentY + 4.5);
  doc.text('Amount', 190, currentY + 4.5, { align: 'right' });

  currentY += 6;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');

  appState.transactions.slice(0, 15).forEach((t, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, 182, 5.5, 'F');
    }
    doc.text(t.date, 18, currentY + 4);
    doc.text(t.description.slice(0, 30), 40, currentY + 4);
    doc.text(t.category.slice(0, 20), 105, currentY + 4);
    doc.text(t.irdTaxCode.slice(0, 18), 145, currentY + 4);
    doc.text(`$${t.amount.toFixed(2)}`, 190, currentY + 4, { align: 'right' });
    currentY += 5.5;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('KiwiLedger Official Executive Financial Report • IRD NZ Compliant', 105, 285, { align: 'center' });

  doc.save(`${company.tradingName.replace(/\s+/g, '_')}_Executive_Financial_Report.pdf`);
}

/**
 * Generates an official IRD Employment Info (EI) & PAYE Remittance Summary PDF
 */
export function generatePayrollSummaryPDF(
  employees: PayrollEmployee[],
  payslips: PayslipRecord[],
  company: CompanySettings,
  periodTitle = 'Pay Period Summary'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const calcs = employees.map((e) => calculateNZPayroll(e, todayStr));

  // Cumulative Metrics
  const totalGross = calcs.reduce((acc, c) => acc + c.grossPay, 0);
  const totalBasePaye = calcs.reduce((acc, c) => acc + c.basePayeTax, 0);
  const totalStudentLoan = calcs.reduce((acc, c) => acc + c.studentLoanDeduction, 0);
  const totalAccLevy = calcs.reduce((acc, c) => acc + c.accLevy, 0);
  const totalEmployerAccLevy = calcs.reduce((acc, c) => acc + (c.employerAccLevy || 0), 0);
  const totalEsct = calcs.reduce((acc, c) => acc + (c.esctTax || 0), 0);
  const totalChildSupport = calcs.reduce((acc, c) => acc + (c.childSupportDeduction || 0), 0);
  const totalCourtAttachments = calcs.reduce((acc, c) => acc + (c.courtAttachmentDeduction || 0), 0);
  const totalKiwiSaverEmp = calcs.reduce((acc, c) => acc + c.kiwiSaverEmployee, 0);
  const totalKiwiSaverEmployer = calcs.reduce((acc, c) => acc + c.kiwiSaverEmployer, 0);
  const totalNetPay = calcs.reduce((acc, c) => acc + c.netPay, 0);
  const totalIrdPayable = calcs.reduce((acc, c) => acc + c.totalIrdPayable, 0);
  const totalEmployerContributions = calcs.reduce((acc, c) => acc + (c.totalEmployerContributions || 0), 0);
  const totalEmployerCost = calcs.reduce((acc, c) => acc + (c.totalEmployerCost || (c.grossPay + (c.totalEmployerContributions || 0))), 0);

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate dark
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PAYROLL & PAYE REMITTANCE SUMMARY', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Inland Revenue Employment Information (EI) • Due 20th of next month via myIR`, 14, 26);

  doc.text(`${company.legalName || company.tradingName}`, 196, 16, { align: 'right' });
  doc.text(`IRD GST/Employer No: ${company.irdNumber || '119-823-401'}`, 196, 22, { align: 'right' });
  doc.text(`Report Period: ${periodTitle} (${todayStr})`, 196, 28, { align: 'right' });

  let y = 42;

  // Remittance KPI Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 42, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.setFontSize(10);
  doc.text('IRD REMITTANCE & EMPLOYER COST SUMMARY', 18, y + 8);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  // Column 1
  doc.setFont('helvetica', 'normal');
  doc.text('Total Gross Wages:', 18, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${totalGross.toFixed(2)}`, 65, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.text('Base PAYE Income Tax:', 18, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${totalBasePaye.toFixed(2)}`, 65, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.text('Student Loan (SL 12%):', 18, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${totalStudentLoan.toFixed(2)}`, 65, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.text('ACC Earners Levy (1.60%):', 18, y + 37);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${totalAccLevy.toFixed(2)}`, 65, y + 37);

  // Column 2
  doc.setFont('helvetica', 'normal');
  doc.text('Employer ESCT Tax:', 85, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${totalEsct.toFixed(2)}`, 130, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.text('Child Support / Attachments:', 85, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${(totalChildSupport + totalCourtAttachments).toFixed(2)}`, 130, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.text('Employer KiwiSaver:', 85, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${totalKiwiSaverEmployer.toFixed(2)}`, 130, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.text('Employer ACC Work Levy:', 85, y + 37);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${totalEmployerAccLevy.toFixed(2)}`, 130, y + 37);

  // Totals Box Right
  doc.setFillColor(15, 23, 42);
  doc.rect(142, y + 12, 50, 24, 'F');
  doc.setTextColor(255, 255, 255);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL IRD DUE:', 145, y + 18);
  doc.setFontSize(10);
  doc.text(`$${totalIrdPayable.toFixed(2)}`, 145, y + 24);

  doc.setFontSize(7.5);
  doc.text('TOTAL EMP COST:', 145, y + 29);
  doc.setFontSize(9);
  doc.text(`$${totalEmployerCost.toFixed(2)}`, 145, y + 34);

  y += 48;

  // Employee Payroll Detail Table
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.setFontSize(10);
  doc.text('INDIVIDUAL EMPLOYEE PAYROLL BREAKDOWN', 14, y);

  y += 4;
  doc.setFillColor(15, 118, 110);
  doc.rect(14, y, 182, 6, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('Employee', 17, y + 4.2);
  doc.text('Tax Code', 55, y + 4.2);
  doc.text('Gross', 75, y + 4.2, { align: 'right' });
  doc.text('Base PAYE', 97, y + 4.2, { align: 'right' });
  doc.text('Stud. Loan', 118, y + 4.2, { align: 'right' });
  doc.text('ACC Levy', 137, y + 4.2, { align: 'right' });
  doc.text('KiwiSaver', 158, y + 4.2, { align: 'right' });
  doc.text('Net Pay', 178, y + 4.2, { align: 'right' });
  doc.text('IRD Due', 194, y + 4.2, { align: 'right' });

  y += 6;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  calcs.forEach((c, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 6, 'F');
    }

    doc.text(c.employeeName.slice(0, 20), 17, y + 4.2);
    doc.text(c.taxCode, 55, y + 4.2);
    doc.text(`$${c.grossPay.toFixed(2)}`, 75, y + 4.2, { align: 'right' });
    doc.text(`$${c.basePayeTax.toFixed(2)}`, 97, y + 4.2, { align: 'right' });
    doc.text(`$${c.studentLoanDeduction.toFixed(2)}`, 118, y + 4.2, { align: 'right' });
    doc.text(`$${c.accLevy.toFixed(2)}`, 137, y + 4.2, { align: 'right' });
    doc.text(`$${c.kiwiSaverEmployee.toFixed(2)}`, 158, y + 4.2, { align: 'right' });
    doc.text(`$${c.netPay.toFixed(2)}`, 178, y + 4.2, { align: 'right' });
    doc.text(`$${c.totalIrdPayable.toFixed(2)}`, 194, y + 4.2, { align: 'right' });

    y += 6;
  });

  // Table Totals Footer
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('TOTALS:', 17, y + 4.2);
  doc.text(`$${totalGross.toFixed(2)}`, 75, y + 4.2, { align: 'right' });
  doc.text(`$${totalBasePaye.toFixed(2)}`, 97, y + 4.2, { align: 'right' });
  doc.text(`$${totalStudentLoan.toFixed(2)}`, 118, y + 4.2, { align: 'right' });
  doc.text(`$${totalAccLevy.toFixed(2)}`, 137, y + 4.2, { align: 'right' });
  doc.text(`$${totalKiwiSaverEmp.toFixed(2)}`, 158, y + 4.2, { align: 'right' });
  doc.text(`$${totalNetPay.toFixed(2)}`, 178, y + 4.2, { align: 'right' });
  doc.text(`$${totalIrdPayable.toFixed(2)}`, 194, y + 4.2, { align: 'right' });

  y += 12;

  // Processed Payslips Log if available
  if (payslips.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 118, 110);
    doc.setFontSize(10);
    doc.text('RECENT ISSUED PAYSLIPS LOG', 14, y);

    y += 4;
    doc.setFillColor(15, 23, 42);
    doc.rect(14, y, 182, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text('Pay Date', 17, y + 3.5);
    doc.text('Employee', 42, y + 3.5);
    doc.text('Tax Code', 90, y + 3.5);
    doc.text('Gross Pay', 125, y + 3.5, { align: 'right' });
    doc.text('Net Paid', 160, y + 3.5, { align: 'right' });
    doc.text('Total IRD', 194, y + 3.5, { align: 'right' });

    y += 5;
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    payslips.slice(0, 10).forEach((ps, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 5, 'F');
      }
      doc.text(ps.payDate || '', 17, y + 3.5);
      doc.text(ps.employeeName || '', 42, y + 3.5);
      doc.text(ps.taxCode || 'M', 90, y + 3.5);
      doc.text(`$${(ps.grossPay || 0).toFixed(2)}`, 125, y + 3.5, { align: 'right' });
      doc.text(`$${(ps.netPay || 0).toFixed(2)}`, 160, y + 3.5, { align: 'right' });
      doc.text(`$${(ps.totalIrdPayable || ((ps.basePayeTax || ps.payeTax || 0) + (ps.accLevy || 0))).toFixed(2)}`, 194, y + 3.5, { align: 'right' });
      y += 5;
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('KiwiLedger Official NZ Payroll & IRD PAYE Summary • Tax Compliant Output', 105, 285, { align: 'center' });

  doc.save(`${company.tradingName.replace(/\s+/g, '_')}_Payroll_Summary_${todayStr}.pdf`);
}

/**
 * Builds an official individual Employee PDF Payslip document
 */
export function buildSinglePayslipDoc(
  payslip: PayslipRecord | (ReturnType<typeof calculateNZPayroll> & { payDate?: string; payPeriodStart?: string; payPeriodEnd?: string }),
  company: CompanySettings
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const payDate = (payslip as PayslipRecord).payDate || new Date().toISOString().split('T')[0];
  const periodStart = (payslip as PayslipRecord).payPeriodStart || payDate;
  const periodEnd = (payslip as PayslipRecord).payPeriodEnd || payDate;
  const employeeName = payslip.employeeName || 'Employee';

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate dark
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('EMPLOYEE PAYSLIP', 14, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Official NZ Inland Revenue Compliant Payslip Record`, 14, 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(company.legalName || company.tradingName, 196, 18, { align: 'right' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`IRD/GST No: ${company.irdNumber || '119-823-401'}`, 196, 24, { align: 'right' });
  if (company.businessAddress) doc.text(company.businessAddress.slice(0, 35), 196, 29, { align: 'right' });

  let y = 48;

  // Metadata Grid Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 28, 3, 3, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Employee Name:', 18, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(employeeName, 50, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Tax Code:', 18, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.taxCode || 'M', 50, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Pay Date:', 110, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(payDate, 140, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Pay Period:', 110, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${periodStart} to ${periodEnd}`, 140, y + 16);

  y += 36;

  // Gross Earnings Section
  doc.setFillColor(15, 118, 110); // teal header
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('GROSS EARNINGS & PAY', 18, y + 5);
  doc.text('AMOUNT (NZD)', 190, y + 5, { align: 'right' });

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.text('Gross Wages / Salary:', 18, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${(payslip.grossPay || 0).toFixed(2)}`, 190, y + 6, { align: 'right' });

  y += 12;

  // Employee Deductions Section
  doc.setFillColor(15, 118, 110);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('EMPLOYEE STATUTORY & VOLUNTARY DEDUCTIONS', 18, y + 5);
  doc.text('AMOUNT (NZD)', 190, y + 5, { align: 'right' });

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);

  const deductions = [
    { label: 'Base PAYE Income Tax', amount: payslip.basePayeTax ?? payslip.payeTax ?? 0 },
    { label: 'Student Loan Deduction (12%)', amount: payslip.studentLoanDeduction ?? 0 },
    { label: `ACC Employee Work Levy (${(payslip as any).employeeAccLevyRate ?? 1.60}%)`, amount: payslip.accLevy ?? 0 },
    { label: 'KiwiSaver Employee Contribution', amount: payslip.kiwiSaverEmployee ?? 0 },
  ];

  if (payslip.childSupportDeduction && payslip.childSupportDeduction > 0) {
    deductions.push({ label: 'IRD Child Support Deduction', amount: payslip.childSupportDeduction });
  }
  if (payslip.courtAttachmentDeduction && payslip.courtAttachmentDeduction > 0) {
    deductions.push({ label: 'Court Order Attachment Deduction', amount: payslip.courtAttachmentDeduction });
  }

  let totalEmpDeductions = 0;

  deductions.forEach((d, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 6, 'F');
    }
    doc.text(d.label, 18, y + 4.2);
    doc.text(`-$${(d.amount || 0).toFixed(2)}`, 190, y + 4.2, { align: 'right' });
    totalEmpDeductions += d.amount || 0;
    y += 6;
  });

  // Deductions Total Bar
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL DEDUCTIONS:', 18, y + 4.2);
  doc.text(`-$${totalEmpDeductions.toFixed(2)}`, 190, y + 4.2, { align: 'right' });

  y += 12;

  // NET PAY HIGHLIGHT BOX
  doc.setFillColor(16, 185, 129); // emerald
  doc.roundedRect(14, y, 182, 16, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('NET AMOUNT PAID TO EMPLOYEE:', 20, y + 10);
  doc.setFontSize(14);
  doc.text(`$${(payslip.netPay || 0).toFixed(2)} NZD`, 188, y + 10, { align: 'right' });

  y += 24;

  // Employer Contributions Section
  doc.setFillColor(15, 23, 42); // slate header
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('EMPLOYER CONTRIBUTIONS & TAXES (ON-COSTS)', 18, y + 5);
  doc.text('AMOUNT (NZD)', 190, y + 5, { align: 'right' });

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);

  const employerItems = [
    { label: 'KiwiSaver Employer Contribution', amount: payslip.kiwiSaverEmployer || 0 },
    { label: 'ACC Employer Work Levy', amount: payslip.employerAccLevy || 0 },
    { label: 'Employer ESCT Tax', amount: payslip.esctTax || 0 },
  ];

  let totalEmployerContrib = 0;
  employerItems.forEach((item, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 6, 'F');
    }
    doc.text(item.label, 18, y + 4.2);
    doc.text(`$${(item.amount || 0).toFixed(2)}`, 190, y + 4.2, { align: 'right' });
    totalEmployerContrib += item.amount || 0;
    y += 6;
  });

  const totalEmployerCost = payslip.totalEmployerCost || ((payslip.grossPay || 0) + totalEmployerContrib);
  const totalIrdPayable = payslip.totalIrdPayable || ((payslip.basePayeTax || payslip.payeTax || 0) + (payslip.studentLoanDeduction || 0) + (payslip.accLevy || 0) + (payslip.esctTax || 0));

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL EMPLOYER COST FOR PERIOD:', 18, y + 4.2);
  doc.text(`$${totalEmployerCost.toFixed(2)}`, 190, y + 4.2, { align: 'right' });

  y += 10;

  doc.setFontSize(8.5);
  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Tax & Deductions Remitted to Inland Revenue (IRD): $${totalIrdPayable.toFixed(2)} NZD`, 18, y);

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`KiwiLedger Official Payslip • Generated for ${employeeName} on ${payDate}`, 105, 285, { align: 'center' });

  return doc;
}

/**
 * Generates and downloads an official individual Employee PDF Payslip
 */
export function generateSinglePayslipPDF(
  payslip: PayslipRecord | (ReturnType<typeof calculateNZPayroll> & { payDate?: string; payPeriodStart?: string; payPeriodEnd?: string }),
  company: CompanySettings
): void {
  const doc = buildSinglePayslipDoc(payslip, company);
  const payDate = (payslip as PayslipRecord).payDate || new Date().toISOString().split('T')[0];
  const employeeName = payslip.employeeName || 'Employee';
  doc.save(`${employeeName.replace(/\s+/g, '_')}_Payslip_${payDate}.pdf`);
}

/**
 * Directly triggers the print dialog for an official Employee Payslip PDF
 */
export function printSinglePayslipPDF(
  payslip: PayslipRecord | (ReturnType<typeof calculateNZPayroll> & { payDate?: string; payPeriodStart?: string; payPeriodEnd?: string }),
  company: CompanySettings
): void {
  const doc = buildSinglePayslipDoc(payslip, company);
  doc.autoPrint();

  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = blobUrl;
  document.body.appendChild(iframe);

  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe printing caught error, opening window fallback:', err);
        const printWin = window.open(blobUrl, '_blank');
        if (printWin) {
          printWin.onload = () => printWin.print();
        }
      }
    }, 100);
  };
}



