import React from 'react';
import { useAgro } from '../../context/AgroContext';
import { formatDateShort } from '../../utils/presets';
import {
  X,
  Bell,
  CheckCheck,
  ShoppingBag,
  Receipt,
  BookOpen,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToOrder?: (orderId: string) => void;
  onNavigateToBill?: (billId: string) => void;
  onNavigateToPosters?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onNavigateToOrder,
  onNavigateToBill,
  onNavigateToPosters
}) => {
  const {
    currentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead
  } = useAgro();

  if (!isOpen) return null;

  // Filter notifications relevant to current user
  const userNotifications = notifications.filter(n => {
    if (currentUser?.role === 'ADMIN') {
      return n.targetRetailerId === 'ADMIN' || n.targetRetailerId === 'ALL';
    }
    return n.targetRetailerId === currentUser?.retailerId || n.targetRetailerId === 'ALL';
  });

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleItemClick = (n: typeof notifications[0]) => {
    markNotificationRead(n.id);
    if (n.linkedType === 'ORDER' && n.linkedId && onNavigateToOrder) {
      onNavigateToOrder(n.linkedId);
      onClose();
    } else if (n.linkedType === 'BILL' && n.linkedId && onNavigateToBill) {
      onNavigateToBill(n.linkedId);
      onClose();
    } else if (n.linkedType === 'POSTER' && onNavigateToPosters) {
      onNavigateToPosters();
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      case 'BILL':
        return <Receipt className="w-5 h-5 text-blue-600" />;
      case 'PASSBOOK':
      case 'STATEMENT':
        return <BookOpen className="w-5 h-5 text-purple-600" />;
      case 'POSTER':
        return <ImageIcon className="w-5 h-5 text-amber-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-emerald-900/10 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0F5A2F] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-300" />
            <h3 className="font-semibold text-base font-display">Notifications & Broadcasts</h3>
            {unreadCount > 0 && (
              <span className="bg-amber-400 text-emerald-950 text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-emerald-100 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-1 rounded transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100 overflow-y-auto flex-1 p-2">
          {userNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            userNotifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                  n.isRead ? 'hover:bg-slate-50 opacity-85' : 'bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/70'
                }`}
              >
                <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-100 shrink-0">
                  {getIcon(n.linkedType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${n.isRead ? 'font-medium text-slate-800' : 'font-bold text-slate-900'}`}>
                      {n.title}
                    </p>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {formatDateShort(n.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-2"></span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
