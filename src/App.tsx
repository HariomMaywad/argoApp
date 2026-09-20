import React, { useState } from 'react';
import { AgroProvider, useAgro } from './context/AgroContext';
import { Header } from './components/common/Header';
import { ProductDetailModal } from './components/common/ProductDetailModal';
import { Product } from './types';

// Admin Screens
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminRetailers } from './components/admin/AdminRetailers';
import { AdminBills } from './components/admin/AdminBills';
import { AdminPassbook } from './components/admin/AdminPassbook';
import { AdminExcelImport } from './components/admin/AdminExcelImport';
import { AdminImportHistory } from './components/admin/AdminImportHistory';
import { AdminPosters } from './components/admin/AdminPosters';
import { AdminReminders } from './components/admin/AdminReminders';
import { AdminNotifications } from './components/admin/AdminNotifications';
import { AdminCompanies } from './components/admin/AdminCompanies';
import { AdminSettings } from './components/admin/AdminSettings';

// Retailer Screens
import { RetailerHome } from './components/retailer/RetailerHome';
import { RetailerCart } from './components/retailer/RetailerCart';
import { RetailerOrders } from './components/retailer/RetailerOrders';
import { RetailerBills } from './components/retailer/RetailerBills';
import { RetailerPassbook } from './components/retailer/RetailerPassbook';
import { RetailerProfile } from './components/retailer/RetailerProfile';

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  Receipt,
  BookOpen,
  FileSpreadsheet,
  Megaphone,
  BellRing,
  Building2,
  Settings,
  History,
  Home,
  User,
  ShoppingBag
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    role = 'ADMIN',
    activeAdminTab = 'dashboard',
    setActiveAdminTab,
    activeRetailerTab = 'home',
    setActiveRetailerTab,
    orders = [],
    cartCount = 0,
    currentRetailerOrders = []
  } = useAgro();

  // Detail Modal
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  // Sub-navigation helpers
  const [passbookRetailerId, setPassbookRetailerId] = useState<string | undefined>(undefined);
  const [reminderRetailerId, setReminderRetailerId] = useState<string | undefined>(undefined);
  const [openAddProductModal, setOpenAddProductModal] = useState(false);
  const [openUploadBillModal, setOpenUploadBillModal] = useState(false);

  const pendingOrdersCount = (orders || []).filter(o => o?.status === 'Pending').length;

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
    { id: 'retailers', label: 'Retailers', icon: Store },
    { id: 'bills', label: 'Invoices', icon: Receipt },
    { id: 'passbook', label: 'Passbook', icon: BookOpen },
    { id: 'excel', label: 'Excel Import', icon: FileSpreadsheet },
    { id: 'posters', label: 'Schemes', icon: Megaphone },
    { id: 'reminders', label: 'Reminders', icon: BellRing },
    { id: 'companies', label: 'Brands', icon: Building2 },
    { id: 'settings', label: 'Firm Profile', icon: Settings },
  ];

  const retailerNavItems = [
    { id: 'home', label: 'Catalog & Deals', icon: Home },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag, badge: (currentRetailerOrders || []).length },
    { id: 'bills', label: 'Invoices', icon: Receipt },
    { id: 'passbook', label: 'Ledger', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleAdminDashboardNavigate = (tab: string) => {
    if (tab === 'add-product') {
      setActiveAdminTab('products');
      setOpenAddProductModal(true);
    } else if (tab === 'upload-bill') {
      setActiveAdminTab('bills');
      setOpenUploadBillModal(true);
    } else {
      setActiveAdminTab(tab);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8]">
      {/* Global Navigation Header */}
      <Header />

      {/* Mode Sub-Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-none text-xs">
            {role === 'ADMIN' ? (
              adminNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeAdminTab === item.id || (item.id === 'excel' && activeAdminTab === 'import-history');

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setOpenAddProductModal(false);
                      setOpenUploadBillModal(false);
                      setActiveAdminTab(item.id);
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#0F5A2F] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              retailerNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeRetailerTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveRetailerTab(item.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#0F5A2F] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-amber-400 text-slate-950' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {role === 'ADMIN' ? (
          <div>
            {activeAdminTab === 'dashboard' && (
              <AdminDashboard onNavigate={handleAdminDashboardNavigate} />
            )}
            {activeAdminTab === 'products' && (
              <AdminProducts initialOpenAdd={openAddProductModal} />
            )}
            {activeAdminTab === 'orders' && (
              <AdminOrders />
            )}
            {activeAdminTab === 'retailers' && (
              <AdminRetailers
                onNavigateToPassbook={(retId) => {
                  setPassbookRetailerId(retId);
                  setActiveAdminTab('passbook');
                }}
                onNavigateToReminders={(retId) => {
                  setReminderRetailerId(retId);
                  setActiveAdminTab('reminders');
                }}
              />
            )}
            {activeAdminTab === 'bills' && (
              <AdminBills initialOpenUpload={openUploadBillModal} />
            )}
            {activeAdminTab === 'passbook' && (
              <AdminPassbook initialRetailerId={passbookRetailerId} />
            )}
            {activeAdminTab === 'excel' && (
              <AdminExcelImport
                onNavigateToHistory={() => setActiveAdminTab('import-history')}
              />
            )}
            {activeAdminTab === 'import-history' && (
              <AdminImportHistory
                onBack={() => setActiveAdminTab('excel')}
              />
            )}
            {activeAdminTab === 'posters' && (
              <AdminPosters />
            )}
            {activeAdminTab === 'reminders' && (
              <AdminReminders initialRetailerId={reminderRetailerId} />
            )}
            {activeAdminTab === 'notifications' && (
              <AdminNotifications />
            )}
            {activeAdminTab === 'companies' && (
              <AdminCompanies />
            )}
            {activeAdminTab === 'settings' && (
              <AdminSettings />
            )}
          </div>
        ) : (
          <div>
            {activeRetailerTab === 'home' && (
              <RetailerHome
                onNavigateToCatalog={() => setActiveRetailerTab('home')}
                onNavigateToCart={() => setActiveRetailerTab('cart')}
                onOpenProductDetail={(prod) => setSelectedProductForModal(prod)}
              />
            )}
            {activeRetailerTab === 'cart' && (
              <RetailerCart
                onBackToShopping={() => setActiveRetailerTab('home')}
                onViewOrders={() => setActiveRetailerTab('orders')}
              />
            )}
            {activeRetailerTab === 'orders' && (
              <RetailerOrders />
            )}
            {activeRetailerTab === 'bills' && (
              <RetailerBills />
            )}
            {activeRetailerTab === 'passbook' && (
              <RetailerPassbook />
            )}
            {activeRetailerTab === 'profile' && (
              <RetailerProfile />
            )}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 font-display">AgroRetail Enterprise</span>
            <span>•</span>
            <span>Distributor & Dealer Agricultural Commerce System</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Rewritten from Android Jetpack Compose to React • Real-time SharedPreferences Ledger emulation
          </div>
        </div>
      </footer>
    </div>
  );
};

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center p-6 text-center">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg max-w-md w-full space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-bold text-lg">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-display">Something went wrong</h2>
            <p className="text-xs text-slate-500">
              {this.state.error?.message || 'An unexpected application state occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-4 py-2 bg-[#0F5A2F] text-white text-xs font-semibold rounded-xl hover:bg-[#0c4825] transition"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AgroProvider>
        <AppContent />
      </AgroProvider>
    </ErrorBoundary>
  );
};

export default App;
