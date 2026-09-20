import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { Company } from '../../types';
import { Building2, Plus, Edit2, CheckCircle, XCircle, X } from 'lucide-react';

export const AdminCompanies: React.FC = () => {
  const { companies, saveCompany, toggleCompanyActive } = useAgro();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Partial<Company> | null>(null);

  const handleOpenAdd = () => {
    setEditingCompany({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Company) => {
    setEditingCompany({ ...c });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany?.name) {
      alert('Company Name is required');
      return;
    }
    saveCompany(editingCompany);
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            Agro-Chemical Companies & Brands
          </h1>
          <p className="text-xs text-slate-500">
            Manage principal companies, manufacturer contacts, and brand partnerships ({companies.length} brands)
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F5A2F] hover:bg-[#0c4725] text-white font-semibold text-xs shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Company / Brand
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map(c => (
          <div
            key={c.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
                    <p className="text-xs text-slate-500">Contact: {c.contactPerson || 'Area Manager'}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleCompanyActive(c.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                    c.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {c.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-1 mt-4">
                {c.phone && <div>Phone: {c.phone}</div>}
                {c.email && <div>Email: {c.email}</div>}
                {c.address && <div className="text-slate-500">{c.address}</div>}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleOpenEdit(c)}
                className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 text-xs px-2.5 py-1 rounded-lg hover:bg-emerald-50"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Company
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#0F5A2F] text-white flex items-center justify-between">
              <h3 className="font-semibold text-base font-display">
                {editingCompany.id ? 'Edit Company' : 'Add New Brand / Company'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={editingCompany.name || ''}
                  onChange={e => setEditingCompany({ ...editingCompany, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="e.g. Syngenta India Limited"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Person / Area Manager</label>
                <input
                  type="text"
                  value={editingCompany.contactPerson || ''}
                  onChange={e => setEditingCompany({ ...editingCompany, contactPerson: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="e.g. Vikram Sharma (Territory Lead)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editingCompany.phone || ''}
                    onChange={e => setEditingCompany({ ...editingCompany, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="e.g. 9812345678"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingCompany.email || ''}
                    onChange={e => setEditingCompany({ ...editingCompany, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="sales@syngenta.com"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">HQ / Depot Address</label>
                <textarea
                  rows={2}
                  value={editingCompany.address || ''}
                  onChange={e => setEditingCompany({ ...editingCompany, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="Warehouse / Zonal Office"
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
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
