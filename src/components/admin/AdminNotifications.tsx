import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { formatDateShort } from '../../utils/presets';
import { Bell, Send, Users, User, CheckCircle2, MessageSquare } from 'lucide-react';

export const AdminNotifications: React.FC = () => {
  const { notifications, retailers, sendNotification } = useAgro();

  const [target, setTarget] = useState<'ALL' | string>('ALL');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'ANNOUNCEMENT' | 'SCHEME' | 'PAYMENT_REMINDER'>('ANNOUNCEMENT');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      alert('Please fill Title and Message');
      return;
    }

    sendNotification({
      targetRetailerId: target === 'ALL' ? undefined : target,
      title,
      message,
      type
    });

    setTitle('');
    setMessage('');
    alert('Push notification broadcasted successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            Push Notifications & Broadcast
          </h1>
          <p className="text-xs text-slate-500">
            Dispatch announcements, stock arrival alerts, and price revisions directly to retail partners
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Notification Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-700" />
            Dispatch Broadcast Alert
          </h2>

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
              <select
                value={target}
                onChange={e => setTarget(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="ALL">📢 All Registered Dealers ({retailers.length})</option>
                {retailers.map(r => (
                  <option key={r.id} value={r.id}>
                    👤 {r.businessName} ({r.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Notification Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="ANNOUNCEMENT">Announcement / General</option>
                <option value="SCHEME">Promotional Scheme</option>
                <option value="PAYMENT_REMINDER">Payment Reminder</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Notification Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                placeholder="e.g. Fresh Stock Arrived: Coragen 150ml"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Message Body *</label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                placeholder="Write your broadcast update here..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#0F5A2F] hover:bg-[#0c4725] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Broadcast Notification
            </button>
          </form>
        </div>

        {/* Notifications History List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-800">
              Notification Dispatch History ({notifications.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No notifications dispatched yet.
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-4 space-y-1 hover:bg-slate-50">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-xs">{n.title}</h3>
                    <span className="text-[10px] text-slate-400">{formatDateShort(n.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-600">{n.message}</p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500">
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                      {n.targetRetailerId ? 'Single Dealer' : 'All Dealers'}
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium">
                      {n.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
