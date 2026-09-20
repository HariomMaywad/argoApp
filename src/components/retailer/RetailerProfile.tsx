import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { formatCurrency } from '../../utils/presets';
import {
  User,
  ShieldCheck,
  Lock,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Building,
  CheckCircle2
} from 'lucide-react';

export const RetailerProfile: React.FC = () => {
  const { currentRetailer, distributorProfile, changeRetailerPin } = useAgro();

  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handlePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinMessage({ text: 'PIN must be at least 4 digits', isError: true });
      return;
    }
    if (newPin !== confirmPin) {
      setPinMessage({ text: 'New PIN and Confirm PIN do not match', isError: true });
      return;
    }

    const success = changeRetailerPin(oldPin, newPin);
    if (success) {
      setPinMessage({ text: 'Security PIN updated successfully!', isError: false });
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } else {
      setPinMessage({ text: 'Current PIN is incorrect.', isError: true });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold font-display text-slate-900">
          Dealer Profile & Security
        </h1>
        <p className="text-xs text-slate-500">
          Your registered business credentials, credit status, and security login PIN
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-[#0F5A2F]">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              {currentRetailer?.businessName}
            </h2>
            <p className="text-xs text-slate-500">
              Proprietor: {currentRetailer?.retailerName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Mobile (Login Username)</span>
            <span className="font-mono font-bold text-slate-800 text-sm">{currentRetailer?.mobileNumber}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">GSTIN Number</span>
            <span className="font-mono font-semibold text-slate-800">{currentRetailer?.gstNumber || 'Not registered'}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Mandi / City</span>
            <span className="font-semibold text-slate-800">{currentRetailer?.city}, {currentRetailer?.state}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Shop Address</span>
            <span className="text-slate-700">{currentRetailer?.address || 'Main Market'}</span>
          </div>
        </div>

        {/* Credit details */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs mt-2">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Approved Credit Limit</span>
            <span className="font-bold text-slate-900 text-sm">{formatCurrency(currentRetailer?.creditLimit || 0)}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Current Market Balance</span>
            <span className={`font-black text-sm ${(currentRetailer?.outstandingAmount || 0) > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {formatCurrency(currentRetailer?.outstandingAmount || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Change PIN Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
          <Lock className="w-4 h-4 text-emerald-700" />
          Update Security Access PIN
        </div>

        <form onSubmit={handlePinChange} className="space-y-4 text-xs max-w-md">
          {pinMessage && (
            <div className={`p-3 rounded-xl text-xs font-semibold ${
              pinMessage.isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {pinMessage.text}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Current PIN</label>
            <input
              type="password"
              maxLength={6}
              required
              value={oldPin}
              onChange={e => setOldPin(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              placeholder="Enter current 4-digit PIN"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">New PIN</label>
              <input
                type="password"
                maxLength={6}
                required
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                placeholder="New PIN"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New PIN</label>
              <input
                type="password"
                maxLength={6}
                required
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                placeholder="Confirm PIN"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#0F5A2F] text-white font-bold text-xs hover:bg-[#0c4725] shadow-xs"
          >
            Change Security PIN
          </button>
        </form>
      </div>

      {/* Distributor Helpline */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-emerald-950 block">{distributorProfile.companyName} Support Desk</span>
          <span className="text-emerald-800">Phone: {distributorProfile.phone} • Email: {distributorProfile.email}</span>
        </div>
        <a
          href={`tel:${distributorProfile.phone}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-emerald-800 border border-emerald-300 font-bold shadow-xs hover:bg-emerald-50"
        >
          <Phone className="w-3.5 h-3.5" /> Call Distributor
        </a>
      </div>
    </div>
  );
};
