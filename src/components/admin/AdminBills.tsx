import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { Bill } from '../../types';
import { formatCurrency, formatDateShort } from '../../utils/presets';
import {
  Receipt,
  Plus,
  Search,
  FileText,
  Download,
  Eye,
  X,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';

interface AdminBillsProps {
  initialOpenUpload?: boolean;
}

export const AdminBills: React.FC<AdminBillsProps> = ({ initialOpenUpload = false }) => {
  const { bills, retailers, uploadBill, distributorProfile } = useAgro();

  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(initialOpenUpload);
  const [selectedBillForPreview, setSelectedBillForPreview] = useState<Bill | null>(null);

  // Upload Form State
  const [retailerId, setRetailerId] = useState(retailers[0]?.id || '');
  const [billNumber, setBillNumber] = useState(`INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [amount, setAmount] = useState<number | ''>(25000);
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [fileName, setFileName] = useState('');

  const filteredBills = bills.filter(b =>
    b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.retailerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retailerId || !billNumber || !amount) {
      alert('Please fill all required fields');
      return;
    }

    const timestamp = new Date(billDate).getTime() || Date.now();
    uploadBill(
      retailerId,
      billNumber,
      Number(amount),
      timestamp,
      fileName || `${billNumber}.pdf`,
      `https://example.com/bills/${billNumber}.pdf`
    );

    setIsUploadOpen(false);
    alert(`Invoice ${billNumber} uploaded! Retailer passbook debited by ${formatCurrency(Number(amount))}.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            Tax Invoices & Bills Management
          </h1>
          <p className="text-xs text-slate-500">
            Upload dispatched goods invoices. Uploading automatically updates dealer passbook and ledger outstanding.
          </p>
        </div>
        <button
          onClick={() => {
            setBillNumber(`INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
            setIsUploadOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F5A2F] hover:bg-[#0c4725] text-white font-semibold text-xs shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Upload New Invoice
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Invoice / Bill # or Retailer Firm..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Retailer Firm</th>
              <th className="py-3 px-4">Invoice Date</th>
              <th className="py-3 px-4 text-right">Invoice Amount</th>
              <th className="py-3 px-4 text-right">Document Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBills.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  No bills found.
                </td>
              </tr>
            ) : (
              filteredBills.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    {b.billNumber}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {b.retailerName}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {formatDateShort(b.billDate)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#0F5A2F] text-sm">
                    {formatCurrency(b.amount)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedBillForPreview(b)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        View Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Invoice Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#0F5A2F] text-white flex items-center justify-between">
              <h3 className="font-semibold text-base font-display">Upload Tax Invoice Bill</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                💡 <strong>Auto Ledger Integration:</strong> Uploading this bill will automatically create a <strong>Debit</strong> entry in the retailer's passbook and increase their current market outstanding.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Retailer *</label>
                <select
                  required
                  value={retailerId}
                  onChange={e => setRetailerId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {retailers.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.businessName} ({r.retailerName} - {r.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Invoice / Bill Number *</label>
                  <input
                    type="text"
                    required
                    value={billNumber}
                    onChange={e => setBillNumber(e.target.value.toUpperCase())}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono uppercase focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="INV-2026-XXXX"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bill Date *</label>
                  <input
                    type="date"
                    required
                    value={billDate}
                    onChange={e => setBillDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Invoice Total Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(parseFloat(e.target.value) || '')}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-[#0F5A2F] focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="e.g. 35000"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">PDF / Scan File</label>
                <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center bg-slate-50">
                  <input
                    type="file"
                    id="bill-file"
                    accept=".pdf,image/*"
                    onChange={e => setFileName(e.target.files?.[0]?.name || '')}
                    className="hidden"
                  />
                  <label htmlFor="bill-file" className="cursor-pointer text-slate-600 flex flex-col items-center">
                    <UploadCloud className="w-6 h-6 text-emerald-700 mb-1" />
                    <span className="font-semibold text-[11px]">
                      {fileName || 'Click to select Tax Invoice PDF'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F5A2F] text-white font-bold hover:bg-[#0c4725] shadow-xs"
                >
                  Upload & Debit Passbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Printable Preview Modal */}
      {selectedBillForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#0F5A2F] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base font-display">Tax Invoice {selectedBillForPreview.billNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedBillForPreview(null)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Invoice Simulation */}
            <div className="p-6 space-y-6 text-xs bg-white">
              <div className="flex justify-between border-b pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-[#0F5A2F] font-display">
                    {distributorProfile.companyName}
                  </h2>
                  <p className="text-slate-600 text-[11px] mt-0.5">{distributorProfile.address}</p>
                  <p className="text-slate-500 text-[11px]">GSTIN: {distributorProfile.gstin}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-slate-800">
                    {selectedBillForPreview.billNumber}
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Date: {formatDateShort(selectedBillForPreview.billDate)}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Billed To (Retailer)</span>
                <div className="font-bold text-sm text-slate-900">{selectedBillForPreview.retailerName}</div>
                <p className="text-slate-500 text-[11px]">Authorized Agricultural Dealer</p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 flex justify-between items-center bg-emerald-50/50">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Grand Invoice Amount (Inclusive of GST)</span>
                  <div className="text-2xl font-black text-[#0F5A2F] font-display mt-0.5">
                    {formatCurrency(selectedBillForPreview.amount)}
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-xs">
                  Tax Invoice
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedBillForPreview(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => alert(`Invoice ${selectedBillForPreview.billNumber} downloaded!`)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0F5A2F] text-white font-bold hover:bg-[#0c4725] shadow-xs"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
