import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { formatCurrency, formatDateShort } from '../../utils/presets';
import {
  BookOpen,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Download,
  X,
  CreditCard,
  DollarSign
} from 'lucide-react';

interface AdminPassbookProps {
  initialRetailerId?: string;
}

export const AdminPassbook: React.FC<AdminPassbookProps> = ({ initialRetailerId }) => {
  const {
    retailers,
    passbookEntries,
    addPassbookEntry
  } = useAgro();

  const [selectedRetailerId, setSelectedRetailerId] = useState(
    initialRetailerId || retailers[0]?.id || ''
  );
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  // New entry form
  const [entryType, setEntryType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [amount, setAmount] = useState<number | ''>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [description, setDescription] = useState('');

  const currentRetailer = retailers.find(r => r.id === selectedRetailerId);

  const retailerEntries = passbookEntries.filter(
    e => e.retailerId === selectedRetailerId
  );

  const totalDebit = retailerEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = retailerEntries.reduce((sum, e) => sum + e.credit, 0);
  const currentRunningBalance = retailerEntries.length > 0
    ? retailerEntries[retailerEntries.length - 1].runningBalance
    : (currentRetailer?.outstandingAmount || 0);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) {
      alert('Please enter amount and description');
      return;
    }

    const numAmount = Number(amount);
    const debit = entryType === 'DEBIT' ? numAmount : 0;
    const credit = entryType === 'CREDIT' ? numAmount : 0;

    addPassbookEntry(
      selectedRetailerId,
      invoiceNumber || (entryType === 'CREDIT' ? 'PAY-RECEIPT' : 'MANUAL-DR'),
      description,
      debit,
      credit
    );

    setIsEntryModalOpen(false);
    setAmount('');
    setDescription('');
    setInvoiceNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            Dealer Passbook & Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Complete transaction history, payment receipts, goods invoices, and running balances
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRetailerId}
            onChange={e => setSelectedRetailerId(e.target.value)}
            className="text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-xs"
          >
            {retailers.map(r => (
              <option key={r.id} value={r.id}>
                {r.businessName} ({r.city})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsEntryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F5A2F] hover:bg-[#0c4725] text-white font-semibold text-xs shadow-sm transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Dealer Financial Overview Card */}
      {currentRetailer && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Current Ledger Balance
            </span>
            <div className={`text-2xl font-black font-display ${currentRunningBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {formatCurrency(currentRunningBalance)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Credit Limit: {formatCurrency(currentRetailer.creditLimit)}
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
              Total Payments Received (Credits)
            </span>
            <div className="text-2xl font-black font-display text-emerald-700 flex items-center gap-1">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
              {formatCurrency(totalCredit)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Cash, UPI & NEFT receipts</p>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-800">
            Transaction Ledger: {currentRetailer?.businessName}
          </h2>
          <button
            onClick={() => alert('Statement downloaded as PDF.')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> Download Statement
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Ref / Invoice #</th>
                <th className="py-3 px-4">Description / Particulars</th>
                <th className="py-3 px-4 text-right">Debit (Dr)</th>
                <th className="py-3 px-4 text-right">Credit (Cr)</th>
                <th className="py-3 px-4 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {retailerEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    No ledger entries for this dealer.
                  </td>
                </tr>
              ) : (
                retailerEntries.map(entry => (
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

      {/* Add Manual Entry Modal */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#0F5A2F] text-white flex items-center justify-between">
              <h3 className="font-semibold text-base font-display">Add Ledger Entry</h3>
              <button
                onClick={() => setIsEntryModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Entry Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntryType('CREDIT')}
                    className={`py-2 rounded-xl font-bold border transition-all text-center ${
                      entryType === 'CREDIT'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Credit (Payment Recv)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryType('DEBIT')}
                    className={`py-2 rounded-xl font-bold border transition-all text-center ${
                      entryType === 'DEBIT'
                        ? 'bg-rose-50 border-rose-600 text-rose-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Debit (Charge / Goods)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(parseFloat(e.target.value) || '')}
                  className="w-full text-sm font-bold border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="e.g. 15000"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reference / Voucher #</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono uppercase focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="e.g. UPI-REF-8912 / CASH-REC-01"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Particulars / Description *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="e.g. Payment received via NEFT State Bank Ref 9182"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F5A2F] text-white font-bold hover:bg-[#0c4725] shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
