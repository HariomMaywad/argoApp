import React from 'react';
import { useAgro } from '../../context/AgroContext';
import { formatCurrency, formatDateShort } from '../../utils/presets';
import { OrderStatusBadge } from '../common/Badge';
import {
  Store,
  Clock,
  Package,
  Megaphone,
  PlusCircle,
  FileSpreadsheet,
  Receipt,
  BellRing,
  Building2,
  ChevronRight,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAddProduct?: () => void;
  onOpenUploadBill?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenAddProduct,
  onOpenUploadBill
}) => {
  const {
    distributorProfile,
    retailers,
    products,
    orders,
    posters
  } = useAgro();

  const totalOutstanding = retailers.reduce((sum, r) => sum + r.outstandingAmount, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const activeRetailersCount = retailers.filter(r => r.isActive).length;
  const activeProductsCount = products.filter(p => p.isActive).length;
  const activePostersCount = posters.filter(p => p.isActive).length;

  const recentOrders = orders.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F5A2F] via-[#146b38] to-[#0A3D20] text-white p-6 sm:p-8 shadow-lg shadow-emerald-950/10 border border-emerald-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider mb-2">
              Distributor Admin Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
              {distributorProfile.companyName || 'AgroRetail Distributors'}
            </h1>
            <p className="text-emerald-100 text-sm mt-1">
              Prop: <span className="font-semibold text-white">{distributorProfile.ownerName}</span> • GST: {distributorProfile.gstin}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-5 flex items-center gap-5 min-w-[240px]">
            <div className="p-3 bg-amber-400 text-emerald-950 rounded-xl shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-emerald-100 font-medium">Total Market Outstanding</div>
              <div className="text-xl sm:text-2xl font-black font-display text-amber-300">
                {formatCurrency(totalOutstanding)}
              </div>
              <div className="text-[11px] text-emerald-200">Across {activeRetailersCount} active dealers</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {pendingOrdersCount}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>{orders.length} total orders</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
          </p>
        </div>

        {/* Active Retailers */}
        <div
          onClick={() => onNavigate('retailers')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Retailers
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {activeRetailersCount} <span className="text-sm font-normal text-slate-400">/ {retailers.length}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Registered dealers</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
          </p>
        </div>

        {/* Products Master */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Products Master
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {activeProductsCount} <span className="text-sm font-normal text-slate-400">/ {products.length}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Active SKUs in catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
          </p>
        </div>

        {/* Active Schemes */}
        <div
          onClick={() => onNavigate('posters')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Schemes & Posters
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Megaphone className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {activePostersCount} <span className="text-sm font-normal text-slate-400">Active</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Retailer Carousel Banners</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
          </p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Quick Management Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onOpenAddProduct ? onOpenAddProduct() : onNavigate('products')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-center group"
          >
            <PlusCircle className="w-6 h-6 text-emerald-700 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">+ New Product</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Add SKU to master</span>
          </button>

          <button
            onClick={() => onNavigate('excel-import')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-center group"
          >
            <FileSpreadsheet className="w-6 h-6 text-emerald-700 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Excel / Busy Import</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Bulk catalog sync</span>
          </button>

          <button
            onClick={() => onOpenUploadBill ? onOpenUploadBill() : onNavigate('bills')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-center group"
          >
            <Receipt className="w-6 h-6 text-emerald-700 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Upload Invoice</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Bill & Ledger Debit</span>
          </button>

          <button
            onClick={() => onNavigate('reminders')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-center group"
          >
            <BellRing className="w-6 h-6 text-emerald-700 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Payment Reminders</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Send alerts to dealers</span>
          </button>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold font-display text-slate-900">
              Recent Incoming Orders
            </h2>
            <p className="text-xs text-slate-500">Real-time orders placed by retailers</p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            View All ({orders.length}) <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No orders received yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map(order => (
              <div
                key={order.id}
                onClick={() => onNavigate('orders')}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 -mx-2 px-2 rounded-xl transition-all cursor-pointer"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0F5A2F] font-mono">
                        {order.id}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-0.5">
                      {order.retailerBusinessName} <span className="font-normal text-slate-500">({order.retailerName})</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {order.items.length} item(s) • {formatDateShort(order.dateTime)}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-sm font-extrabold text-[#0F5A2F] font-display">
                    {formatCurrency(order.grandTotal)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {order.retailerMobile}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
