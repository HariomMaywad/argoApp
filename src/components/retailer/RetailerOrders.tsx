import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDateFull, formatDateShort } from '../../utils/presets';
import { OrderStatusBadge } from '../common/Badge';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

interface RetailerOrdersProps {
  onOrderAgain?: (order: Order) => void;
}

export const RetailerOrders: React.FC<RetailerOrdersProps> = ({ onOrderAgain }) => {
  const { currentRetailerOrders, addToCart, products } = useAgro();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const handleReorder = (ord: Order) => {
    ord.items.forEach(it => {
      const prod = products.find(p => p.id === it.productId);
      if (prod) {
        addToCart(prod, it.quantity);
      }
    });
    alert('Items added to your Cart!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            My Purchase Orders & Dispatches
          </h1>
          <p className="text-xs text-slate-500">
            Real-time status tracking, dispatch bilty numbers, and itemized booking records ({currentRetailerOrders.length} orders)
          </p>
        </div>
      </div>

      {currentRetailerOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-xs text-center max-w-md mx-auto space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500">
            Place your first bulk seeds or pesticide order from the wholesale catalog.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentRetailerOrders.map(ord => {
            const isExpanded = expandedOrderId === ord.id;

            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-emerald-600"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(ord.id)}
                  className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm text-[#0F5A2F]">
                        {ord.id}
                      </span>
                      <OrderStatusBadge status={ord.status} />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDateShort(ord.dateTime)}
                      </span>
                      <span>•</span>
                      <span>{ord.items.length} items</span>
                    </div>

                    {ord.adminNotes && (
                      <div className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Dispatch update: {ord.adminNotes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="sm:text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Grand Total</span>
                      <span className="text-lg font-black text-[#0F5A2F] font-display">
                        {formatCurrency(ord.grandTotal)}
                      </span>
                    </div>

                    <div className="text-slate-400 p-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/30 text-xs">
                    {/* Status Step Indicator */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Fulfillment Workflow Status
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        {['Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered'].map((st, i) => {
                          const orderStatusIndex = ['Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered'].indexOf(ord.status);
                          const isDone = orderStatusIndex >= i;
                          const isCurrent = ord.status === st;

                          return (
                            <div key={st} className="flex flex-col items-center gap-1 text-center flex-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-colors ${
                                isCurrent
                                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                  : isDone
                                  ? 'bg-[#0F5A2F] text-white'
                                  : 'bg-slate-200 text-slate-500'
                              }`}>
                                {isDone ? '✓' : i + 1}
                              </div>
                              <span className={`font-semibold ${isCurrent ? 'text-emerald-800 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                                {st}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2">
                      <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                        Ordered SKUs & Quantities
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={it.imageUrl}
                                alt={it.itemName}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900">{it.itemName}</div>
                                <div className="text-[11px] text-slate-500">
                                  Pack: {it.packSize} • Code: {it.itemCode}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-slate-800">
                                {it.quantity} x {formatCurrency(it.rate)}
                              </div>
                              <div className="text-[11px] text-[#0F5A2F] font-bold">
                                = {formatCurrency(it.total)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary & Reorder footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <div className="text-slate-500 text-[11px]">
                        Subtotal: {formatCurrency(ord.subTotal)} + GST: {formatCurrency(ord.gstTotal)}
                      </div>

                      <button
                        onClick={() => handleReorder(ord)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Re-Order All Items
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
