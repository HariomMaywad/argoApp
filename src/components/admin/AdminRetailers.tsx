import React, { useState, useMemo } from 'react';
import { useAgro } from '../../context/AgroContext';
import { Retailer } from '../../types';
import { formatCurrency } from '../../utils/presets';
import {
  Store,
  Search,
  Plus,
  Edit2,
  Phone,
  MapPin,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  X,
  CreditCard,
  BellRing,
  BookOpen
} from 'lucide-react';

interface AdminRetailersProps {
  onNavigateToPassbook?: (retailerId: string) => void;
  onNavigateToReminders?: (retailerId: string) => void;
}

export const AdminRetailers: React.FC<AdminRetailersProps> = ({
  onNavigateToPassbook,
  onNavigateToReminders
}) => {
  const {
    retailers,
    saveRetailer,
    toggleRetailerActive
  } = useAgro();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRetailer, setEditingRetailer] = useState<Partial<Retailer> | null>(null);
  const [rawPin, setRawPin] = useState('');

  const filteredRetailers = useMemo(() => {
    return retailers.filter(r => {
      return (
        r.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.retailerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.mobileNumber.includes(searchQuery) ||
        r.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.gstNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [retailers, searchQuery]);

  const handleOpenAdd = () => {
    setEditingRetailer({
      businessName: '',
      retailerName: '',
      mobileNumber: '',
      alternatePhone: '',
      email: '',
      address: '',
      city: 'Karnal',
      state: 'Haryana',
      gstNumber: '',
      creditLimit: 200000,
      outstandingAmount: 0,
      isActive: true
    });
    setRawPin('1234');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: Retailer) => {
    setEditingRetailer({ ...r });
    setRawPin(''); // leave blank unless changing
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRetailer?.businessName || !editingRetailer?.retailerName || !editingRetailer?.mobileNumber) {
      alert('Please fill Business Name, Dealer Name, and Mobile Number');
      return;
    }
    saveRetailer(editingRetailer, rawPin || undefined);
    setIsModalOpen(false);
    setEditingRetailer(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            Registered Dealers & Retailers
          </h1>
          <p className="text-xs text-slate-500">
            Manage dealer accounts, credit limits, security PINs, and ledger balances ({retailers.length} registered)
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F5A2F] hover:bg-[#0c4725] text-white font-semibold text-xs shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Retailer
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by business name, proprietor, mobile, city, or GSTIN..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Retailers List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRetailers.map(ret => (
          <div
            key={ret.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {ret.businessName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Prop: {ret.retailerName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleRetailerActive(ret.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                    ret.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {ret.isActive ? 'Active' : 'Deactivated'}
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 my-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ret.mobileNumber}</span>
                  {ret.alternatePhone && <span className="text-slate-400">/ {ret.alternatePhone}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{ret.city}, {ret.state}</span>
                </div>
                {ret.gstNumber && (
                  <div className="text-[11px] text-slate-400 font-mono">
                    GSTIN: {ret.gstNumber}
                  </div>
                )}
              </div>

              {/* Financial Box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Outstanding</span>
                  <span className={`font-black text-sm ${ret.outstandingAmount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {formatCurrency(ret.outstandingAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Credit Limit</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {formatCurrency(ret.creditLimit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {onNavigateToPassbook && (
                  <button
                    onClick={() => onNavigateToPassbook(ret.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                    title="View Passbook Ledger"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                )}
                {onNavigateToReminders && (
                  <button
                    onClick={() => onNavigateToReminders(ret.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                    title="Payment Reminders"
                  >
                    <BellRing className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => handleOpenEdit(ret)}
                className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 px-2.5 py-1 rounded-lg hover:bg-emerald-50"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Dealer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Retailer Modal */}
      {isModalOpen && editingRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#0F5A2F] text-white flex items-center justify-between">
              <h3 className="font-semibold text-base font-display">
                {editingRetailer.id ? 'Edit Retailer' : 'Register New Retailer'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business / Firm Name *</label>
                <input
                  type="text"
                  required
                  value={editingRetailer.businessName || ''}
                  onChange={e => setEditingRetailer({ ...editingRetailer, businessName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="e.g. Kisan Agro Agency"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Proprietor Name *</label>
                  <input
                    type="text"
                    required
                    value={editingRetailer.retailerName || ''}
                    onChange={e => setEditingRetailer({ ...editingRetailer, retailerName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number (Login ID) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={editingRetailer.mobileNumber || ''}
                    onChange={e => setEditingRetailer({ ...editingRetailer, mobileNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Security PIN (for Login)</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={rawPin}
                    onChange={e => setRawPin(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder={editingRetailer.id ? 'Leave blank to keep PIN' : '4-digit PIN (e.g. 1234)'}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={editingRetailer.gstNumber || ''}
                    onChange={e => setEditingRetailer({ ...editingRetailer, gstNumber: e.target.value.toUpperCase() })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono uppercase focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="06AAAAA1234A1Z5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={editingRetailer.creditLimit ?? ''}
                    onChange={e => setEditingRetailer({ ...editingRetailer, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Opening Outstanding (₹)</label>
                  <input
                    type="number"
                    value={editingRetailer.outstandingAmount ?? ''}
                    onChange={e => setEditingRetailer({ ...editingRetailer, outstandingAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editingRetailer.city || ''}
                    onChange={e => setEditingRetailer({ ...editingRetailer, city: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editingRetailer.state || ''}
                    onChange={e => setEditingRetailer({ ...editingRetailer, state: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Mandi / Shop Address</label>
                <textarea
                  rows={2}
                  value={editingRetailer.address || ''}
                  onChange={e => setEditingRetailer({ ...editingRetailer, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="Shop number, market road..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F5A2F] text-white font-bold hover:bg-[#0c4725] shadow-xs"
                >
                  Save Dealer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
