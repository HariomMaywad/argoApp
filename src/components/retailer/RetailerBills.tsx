import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { Bill } from '../../types';
import { formatCurrency, formatDateShort } from '../../utils/presets';
import { Receipt, Eye, Download, FileText, X } from 'lucide-react';

export const RetailerBills: React.FC = () => {
  const { currentRetailerBills = [], currentRetailer, distributorProfile } = useAgro();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const safeBills = currentRetailerBills || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            Tax Invoices & Billing Documents
          </h1>
          <p className="text-xs text-slate-500">
            Download your GST-compliant tax invoices for input tax credit (ITC) and inventory records ({safeBills.length} invoices)
          </p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Invoice Date</th>
              <th className="py-3 px-4 text-right">Invoice Amount</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentRetailerBills.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  No bills issued yet.
                </td>
              </tr>
            ) : (
              currentRetailerBills.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    {b.billNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {formatDateShort(b.billDate)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#0F5A2F] text-sm">
                    {formatCurrency(b.amount)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedBill(b)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-700" />
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice View Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#0F5A2F] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base font-display">Tax Invoice {selectedBill.billNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedBill(null)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                    {selectedBill.billNumber}
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Date: {formatDateShort(selectedBill.billDate)}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Billed To</span>
                <div className="font-bold text-sm text-slate-900">{currentRetailer?.businessName}</div>
                <p className="text-slate-500 text-[11px]">
                  Prop: {currentRetailer?.retailerName} • {currentRetailer?.city}, {currentRetailer?.state}
                </p>
                {currentRetailer?.gstNumber && (
                  <p className="text-slate-500 font-mono text-[11px]">GSTIN: {currentRetailer.gstNumber}</p>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl p-4 flex justify-between items-center bg-emerald-50/50">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Grand Invoice Amount (Inclusive of GST)</span>
                  <div className="text-2xl font-black text-[#0F5A2F] font-display mt-0.5">
                    {formatCurrency(selectedBill.amount)}
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-xs">
                  Tax Invoice
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedBill(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => alert(`Invoice ${selectedBill.billNumber} downloaded!`)}
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
