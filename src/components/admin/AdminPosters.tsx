import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { Poster } from '../../types';
import { POSTER_PRESETS, formatDateShort } from '../../utils/presets';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Calendar,
  Send,
  Sparkles
} from 'lucide-react';

export const AdminPosters: React.FC = () => {
  const {
    posters,
    savePoster,
    togglePosterActive,
    deletePoster
  } = useAgro();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState<Partial<Poster> | null>(null);
  const [sendNotification, setSendNotification] = useState(true);

  const handleOpenAdd = () => {
    setEditingPoster({
      title: '',
      description: '',
      imageUrl: POSTER_PRESETS[0].url,
      fileType: 'IMAGE',
      startDate: Date.now(),
      endDate: Date.now() + 30 * 86400000,
      priority: 1,
      isActive: true,
      notificationTitle: '',
      notificationMessage: ''
    });
    setSendNotification(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Poster) => {
    setEditingPoster({ ...p });
    setSendNotification(false);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoster?.title || !editingPoster?.description) {
      alert('Please fill Scheme Title and Description');
      return;
    }
    savePoster(editingPoster, sendNotification);
    setIsModalOpen(false);
    setEditingPoster(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            Promotional Schemes & Banner Carousel
          </h1>
          <p className="text-xs text-slate-500">
            Showcase seasonal discounts, volume schemes, and booking offers to all retailers in your network
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F5A2F] hover:bg-[#0c4725] text-white font-semibold text-xs shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Scheme
        </button>
      </div>

      {/* Posters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {posters.map(poster => (
          <div
            key={poster.id}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={poster.imageUrl}
                  alt={poster.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={() => togglePosterActive(poster.id)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md transition-all ${
                      poster.isActive
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-white/90 text-slate-600 border-slate-200'
                    }`}
                  >
                    {poster.isActive ? 'Active on App' : 'Hidden'}
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {poster.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {poster.description}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Valid until {formatDateShort(poster.endDate)}</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 text-[11px]">
                Priority #{poster.priority}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(poster)}
                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete scheme "${poster.title}"?`)) deletePoster(poster.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && editingPoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#0F5A2F] text-white flex items-center justify-between">
              <h3 className="font-semibold text-base font-display">
                {editingPoster.id ? 'Edit Scheme' : 'Launch New Promotional Scheme'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Scheme Title *</label>
                <input
                  type="text"
                  required
                  value={editingPoster.title || ''}
                  onChange={e => setEditingPoster({ ...editingPoster, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="e.g. Kharif Pre-Booking Bonanza: Extra 8% Off"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Offer Details & Terms *</label>
                <textarea
                  rows={3}
                  required
                  value={editingPoster.description || ''}
                  onChange={e => setEditingPoster({ ...editingPoster, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="Describe minimum order quantity, discounts, free freight, or complimentary gift..."
                />
              </div>

              {/* Poster Presets Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Background Image</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  {POSTER_PRESETS.map(preset => (
                    <div
                      key={preset.id}
                      onClick={() => setEditingPoster({ ...editingPoster, imageUrl: preset.url })}
                      className={`cursor-pointer rounded-xl overflow-hidden border p-1 transition-all ${
                        editingPoster.imageUrl === preset.url
                          ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        referrerPolicy="no-referrer"
                        className="h-16 w-full object-cover rounded-lg"
                      />
                      <span className="text-[10px] font-bold text-slate-700 block mt-1 truncate">
                        {preset.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Priority</label>
                  <input
                    type="number"
                    value={editingPoster.priority || 1}
                    onChange={e => setEditingPoster({ ...editingPoster, priority: parseInt(e.target.value, 10) || 1 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheme Expiry Date</label>
                  <input
                    type="date"
                    value={new Date(editingPoster.endDate || Date.now()).toISOString().split('T')[0]}
                    onChange={e => setEditingPoster({ ...editingPoster, endDate: new Date(e.target.value).getTime() })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {!editingPoster.id && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-950">
                    <input
                      type="checkbox"
                      checked={sendNotification}
                      onChange={e => setSendNotification(e.target.checked)}
                      className="rounded text-emerald-700 w-4 h-4"
                    />
                    <span>Broadcast Push Notification to All Dealers Immediately</span>
                  </label>
                </div>
              )}

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
                  Publish Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
