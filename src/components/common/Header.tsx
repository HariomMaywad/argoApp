import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { NotificationModal } from './NotificationModal';
import {
  Sprout,
  Bell,
  ShoppingCart,
  User,
  ShieldCheck,
  Store,
  LogOut,
  ChevronDown,
  Repeat
} from 'lucide-react';

interface HeaderProps {
  onOpenCart?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onNavigateTab }) => {
  const {
    currentUser,
    currentRetailer,
    distributorProfile,
    retailers,
    notifications,
    cartCount,
    logout,
    quickSwitchRole
  } = useAgro();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  const userNotifications = notifications.filter(n => {
    if (currentUser?.role === 'ADMIN') {
      return n.targetRetailerId === 'ADMIN' || n.targetRetailerId === 'ALL';
    }
    return n.targetRetailerId === currentUser?.retailerId || n.targetRetailerId === 'ALL';
  });

  const unreadNotifCount = userNotifications.filter(n => !n.isRead).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-950/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F5A2F] to-[#0A3D20] flex items-center justify-center text-white shadow-sm shadow-emerald-900/20">
              <Sprout className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg text-[#0F5A2F] tracking-tight">
                  AgroRetail
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                  {currentUser?.role === 'ADMIN' ? 'Distributor Admin' : 'Retailer Portal'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
                {distributorProfile.companyName}
              </p>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Role Switcher Dropdown (Seamless Testing) */}
            <div className="relative">
              <button
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-all"
                title="Switch User / Role"
              >
                <Repeat className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden md:inline">Switch:</span>
                <span className="text-emerald-900 font-bold max-w-[90px] truncate">
                  {currentUser?.role === 'ADMIN' ? 'Admin' : currentRetailer?.retailerName || 'Retailer'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showSwitchMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setShowSwitchMenu(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Role & Account Switcher
                  </div>
                  <button
                    onClick={() => quickSwitchRole('ADMIN')}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-emerald-50 ${
                      currentUser?.role === 'ADMIN' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <div>
                      <div className="font-semibold">Distributor Admin</div>
                      <div className="text-[10px] text-slate-500">{distributorProfile.ownerName}</div>
                    </div>
                  </button>

                  <div className="h-px bg-slate-100 my-1"></div>
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Retailer Accounts
                  </div>

                  {retailers.map(r => (
                    <button
                      key={r.id}
                      onClick={() => quickSwitchRole('RETAILER', r.id)}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-emerald-50 ${
                        currentUser?.retailerId === r.id ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <Store className="w-4 h-4 text-blue-600" />
                      <div className="truncate">
                        <div className="font-semibold truncate">{r.retailerName} ({r.businessName})</div>
                        <div className="text-[10px] text-slate-500">PIN: 1234 • {r.city}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Cart Icon (Retailer only) */}
            {currentUser?.role === 'RETAILER' && (
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm transition-all text-xs font-semibold"
                title="View Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="bg-amber-400 text-emerald-950 px-1.5 py-0.2 rounded-full text-[11px] font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Current User Info & Logout */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Center Modal */}
      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onNavigateToOrder={(id) => onNavigateTab && onNavigateTab(currentUser?.role === 'ADMIN' ? 'orders' : 'orders')}
        onNavigateToBill={(id) => onNavigateTab && onNavigateTab('bills')}
        onNavigateToPosters={() => onNavigateTab && onNavigateTab('posters')}
      />
    </>
  );
};
