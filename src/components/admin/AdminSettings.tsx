import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { DistributorProfile } from '../../types';
import {
  Building,
  Save,
  RotateCcw,
  CheckCircle2,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  FileText
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { distributorProfile, updateDistributorProfile, resetToDefaults } = useAgro();
  const [profile, setProfile] = useState<DistributorProfile>({ ...distributorProfile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDistributorProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data back to the demo catalog, orders, and ledger?')) {
      resetToDefaults();
      alert('Data reset to default demo records.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            Distributor Firm Profile & Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure your agricultural trading enterprise details, tax identifiers, and banking credentials
          </p>
        </div>
        <button
          onClick={handleResetData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-all shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Basic Firm Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Firm Legal Identity & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Firm Name *</label>
              <input
                type="text"
                required
                value={profile.companyName}
                onChange={e => setProfile({ ...profile, companyName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Owner / Proprietor Name *</label>
              <input
                type="text"
                required
                value={profile.ownerName}
                onChange={e => setProfile({ ...profile, ownerName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone *</label>
              <input
                type="tel"
                required
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">GSTIN Number *</label>
              <input
                type="text"
                required
                value={profile.gstin}
                onChange={e => setProfile({ ...profile, gstin: e.target.value.toUpperCase() })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pesticide & Seed License Number</label>
              <input
                type="text"
                value={profile.licenseNumber || ''}
                onChange={e => setProfile({ ...profile, licenseNumber: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                placeholder="e.g. HR-KNL-PEST-2024-891"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Registered Address & Godown Location</label>
            <textarea
              rows={2}
              value={profile.address}
              onChange={e => setProfile({ ...profile, address: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Bank & Settlement Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Bank Account & NEFT / UPI Credentials (Printed on Tax Invoices)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Beneficiary Account Name</label>
              <input
                type="text"
                value={profile.bankDetails.accountName}
                onChange={e => setProfile({
                  ...profile,
                  bankDetails: { ...profile.bankDetails, accountName: e.target.value }
                })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={profile.bankDetails.accountNumber}
                onChange={e => setProfile({
                  ...profile,
                  bankDetails: { ...profile.bankDetails, accountNumber: e.target.value }
                })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={profile.bankDetails.bankName}
                onChange={e => setProfile({
                  ...profile,
                  bankDetails: { ...profile.bankDetails, bankName: e.target.value }
                })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={profile.bankDetails.ifsc}
                onChange={e => setProfile({
                  ...profile,
                  bankDetails: { ...profile.bankDetails, ifsc: e.target.value.toUpperCase() }
                })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch</label>
              <input
                type="text"
                value={profile.bankDetails.branch}
                onChange={e => setProfile({
                  ...profile,
                  bankDetails: { ...profile.bankDetails, branch: e.target.value }
                })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">UPI ID for Quick Payment</label>
              <input
                type="text"
                value={profile.bankDetails.upiId}
                onChange={e => setProfile({
                  ...profile,
                  bankDetails: { ...profile.bankDetails, upiId: e.target.value }
                })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {savedSuccess ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Settings Saved Successfully!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F5A2F] hover:bg-[#0c4725] text-white font-bold text-xs shadow-xs transition-all"
          >
            <Save className="w-4 h-4" />
            Save Profile Settings
          </button>
        </div>
      </form>
    </div>
  );
};
