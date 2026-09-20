import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { PaymentReminder } from '../../types';
import { formatCurrency, formatDateShort } from '../../utils/presets';
import {
  BellRing,
  Plus,
  Send,
  CheckCircle2,
  Trash2,
  X,
  Clock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface AdminRemindersProps {
  initialRetailerId?: string;
}

export const AdminReminders: React.FC<AdminRemindersProps> = ({ initialRetailerId }) => {
  const {
    retailers,
    paymentReminders,
    createPaymentReminder,
    markReminderPaid,
    deleteReminder,
    distributorProfile
  } = useAgro();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRetailerId, setSelectedRetailerId] = useState(initialRetailerId || retailers[0]?.id || '');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
  const [customMessage, setCustomMessage] = useState('');

  const handleOpenCreate = () => {
    const ret = retailers.find(r => r.id === selectedRetailerId) || retailers[0];
    setCustomMessage(
      `Dear ${ret?.retailerName || 'Dealer'}, kindly arrange to clear your outstanding ledger balance of ${formatCurrency(ret?.outstandingAmount || 0)} by this week. Regards, ${distributorProfile.companyName}.`
    );
    setIsCreateOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRetailerId) return;

    const dueTimestamp = new Date(dueDate).getTime() || (Date.now() + 5 * 86400000);
    createPaymentReminder(selectedRetailerId, dueTimestamp, customMessage);
    setIsCreateOpen(false);
    alert('Payment reminder sent to retailer!');
  };

  const handleWhatsAppShare = (r: PaymentReminder) => {
    const cleanPhone = r.retailerMobile.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(r.message);
    const url = `https://wa.me/${phoneWithCode}?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            Payment Due Reminders & Alerts
          </h1>
          <p className="text-xs text-slate-500">
            Issue automated reminders and WhatsApp notices for pending credit balances ({paymentReminders.length} active)
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F5A2F] hover:bg-[#0c4725] text-white font-semibold text-xs shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Send New Reminder
        </button>
      </div>

      {/* Reminders List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {paymentReminders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <BellRing className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No payment reminders dispatched yet.</p>
            </div>
          ) : (
            paymentReminders.map(rem => (
              <div
                key={rem.id}
                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  rem.isPaid ? 'bg-slate-50/70 opacity-70' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-slate-900">
                      {rem.retailerName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      rem.isPaid
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {rem.isPaid ? 'Paid / Settled' : 'Pending Payment'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    "{rem.message}"
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span>Outstanding: <strong className="text-rose-600">{formatCurrency(rem.outstandingAmount)}</strong></span>
                    <span>Due Date: <strong>{formatDateShort(rem.dueDate)}</strong></span>
                    <span>Sent: {formatDateShort(rem.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleWhatsAppShare(rem)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Share WhatsApp
                  </button>

                  {!rem.isPaid && (
                    <button
                      onClick={() => markReminderPaid(rem.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-colors"
                      title="Mark Settled"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Paid
                    </button>
                  )}

                  <button
                    onClick={() => deleteReminder(rem.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Reminder Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#0F5A2F] text-white flex items-center justify-between">
              <h3 className="font-semibold text-base font-display">Send Payment Reminder</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Retailer *</label>
                <select
                  value={selectedRetailerId}
                  onChange={e => {
                    setSelectedRetailerId(e.target.value);
                    const ret = retailers.find(r => r.id === e.target.value);
                    if (ret) {
                      setCustomMessage(
                        `Dear ${ret.retailerName}, kindly arrange to clear your outstanding ledger balance of ${formatCurrency(ret.outstandingAmount)} by ${formatDateShort(new Date(dueDate).getTime())}. Regards, ${distributorProfile.companyName}.`
                      );
                    }
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {retailers.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.businessName} (Bal: {formatCurrency(r.outstandingAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reminder Message / Notice</label>
                <textarea
                  rows={4}
                  required
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F5A2F] text-white font-bold hover:bg-[#0c4725] shadow-xs"
                >
                  Dispatch Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
