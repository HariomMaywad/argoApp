import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { formatCurrency, formatDateShort } from '../../utils/presets';
import {
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  QrCode,
  Copy,
  CheckCircle2,
  Building
} from 'lucide-react';

export const RetailerPassbook: React.FC = () => {
  const { currentRetailer, currentRetailerPassbook, distributorProfile } = useAgro();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const totalDebit = currentRetailerPassbook.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = currentRetailerPassbook.reduce((sum, e) => sum + e.credit, 0);
  const runningBalance = currentRetailerPassbook.length > 0
    ? currentRetailerPassbook[currentRetailerPassbook.length - 1].runningBalance
    : (currentRetailer?.outstandingAmount || 0);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            Dealer Passbook & Account Statement
          </h1>
          <p className="text-xs text-slate-500">
            Complete transaction record of all purchases (debits) and payment settlements (credits)
          </p>
        </div>
        <button
          onClick={() => alert('Statement PDF downloaded!')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          Download Statement
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Current Ledger Balance
          </span>
          <div className={`text-2xl font-black font-display ${runningBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {formatCurrency(runningBalance)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Credit Limit: {formatCurrency(currentRetailer?.creditLimit || 0)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Invoiced (Debits)
          </span>
          <div className="text-2xl font-black font-display text-slate-800 flex items-center gap-1">
            <ArrowUpRight className="w-5 h-5 text-rose-500" />
            {formatCurrency(totalDebit)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Goods purchased across time</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Payments Made (Credits)
          </span>
          <div className="text-2xl font-black font-display text-emerald-700 flex items-center gap-1">
            <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
            {formatCurrency(totalCredit)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Cash, UPI & NEFT clearances</p>
        </div>
      </div>

      {/* Payment Information & Bank Settlement Box */}
      <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
          <Building className="w-4 h-4" />
          <span>Distributor Settlement Bank Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
            <span className="text-emerald-300 text-[10px] uppercase font-bold block">Account Holder</span>
            <span className="font-bold text-white text-sm">{distributorProfile.bankDetails.accountName}</span>
          </div>

          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-emerald-300 text-[10px] uppercase font-bold block">Account Number</span>
              <span className="font-mono font-bold text-white text-sm">{distributorProfile.bankDetails.accountNumber}</span>
            </div>
            <button
              onClick={() => handleCopy(distributorProfile.bankDetails.accountNumber, 'acc')}
              className="p-1.5 hover:bg-white/20 rounded-lg text-emerald-200"
              title="Copy"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-emerald-300 text-[10px] uppercase font-bold block">IFSC Code</span>
              <span className="font-mono font-bold text-white text-sm">{distributorProfile.bankDetails.ifsc}</span>
            </div>
            <button
              onClick={() => handleCopy(distributorProfile.bankDetails.ifsc, 'ifsc')}
              className="p-1.5 hover:bg-white/20 rounded-lg text-emerald-200"
              title="Copy"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-emerald-300 text-[10px] uppercase font-bold block">UPI ID for Quick Pay</span>
              <span className="font-mono font-bold text-amber-300 text-xs">{distributorProfile.bankDetails.upiId}</span>
            </div>
            <button
              onClick={() => handleCopy(distributorProfile.bankDetails.upiId, 'upi')}
              className="p-1.5 hover:bg-white/20 rounded-lg text-emerald-200"
              title="Copy"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Entries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-bold text-sm text-slate-800">
            Account Transactions Ledger
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Invoice / Ref #</th>
                <th className="py-3 px-4">Particulars</th>
                <th className="py-3 px-4 text-right">Debit (Dr)</th>
                <th className="py-3 px-4 text-right">Credit (Cr)</th>
                <th className="py-3 px-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentRetailerPassbook.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    No ledger entries recorded yet.
                  </td>
                </tr>
              ) : (
                currentRetailerPassbook.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDateShort(entry.date)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {entry.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {entry.description}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-600 whitespace-nowrap">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 whitespace-nowrap">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(entry.runningBalance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
