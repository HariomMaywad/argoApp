import React, { useState, useMemo } from 'react';
import { useAgro } from '../../context/AgroContext';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDateFull, formatDateShort } from '../../utils/presets';
import { OrderStatusBadge } from '../common/Badge';
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Box,
  CheckCheck,
  Ban,
  Filter,
  FileText,
  User,
  Phone,
  Calendar,
  X
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus } = useAgro();

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');
  const [adminNotes, setAdminNotes] = useState('');

  const statuses: (OrderStatus | 'ALL')[] = [
    'ALL',
    'Pending',
    'Confirmed',
    'Packed',
    'Dispatched',
    'Delivered',
    'Cancelled'
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      const matchesStatus = selectedStatus === 'ALL' || ord.status === selectedStatus;
      const matchesSearch =
        ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.retailerBusinessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.retailerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.retailerMobile.includes(searchQuery);

      return matchesStatus && matchesSearch;
    });
  }, [orders, selectedStatus, searchQuery]);

  const handleOpenDetails = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setAdminNotes(ord.adminNotes || '');
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, newStatus, adminNotes);
    setSelectedOrder(prev => prev ? { ...prev, status: newStatus, adminNotes } : null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            Retailer Order Management
          </h1>
          <p className="text-xs text-slate-500">
            Track, confirm, pack, dispatch and invoice orders placed by your retail network
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Dealer Name, or Phone..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? 'bg-[#0F5A2F] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? `All Orders (${orders.length})` : `${st} (${orders.filter(o => o.status === st).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No orders found matching the criteria.</p>
          </div>
        ) : (
          filteredOrders.map(ord => (
            <div
              key={ord.id}
              onClick={() => handleOpenDetails(ord)}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-[#0F5A2F] font-mono tracking-tight">
                    {ord.id}
                  </span>
                  <OrderStatusBadge status={ord.status} />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {ord.retailerBusinessName}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {ord.retailerName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {ord.retailerMobile}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDateShort(ord.dateTime)}
                  </span>
                </div>
                <div className="text-xs text-slate-600 pt-1">
                  <span className="font-semibold">{ord.items.length} items: </span>
                  {ord.items.map(i => `${i.itemName} (${i.quantity} ${i.packSize})`).join(', ')}
                </div>
              </div>

              <div className="sm:text-right border-t sm:border-0 pt-3 sm:pt-0 border-slate-100 flex sm:flex-col items-center sm:items-end justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Grand Total</div>
                  <div className="text-lg font-black text-[#0F5A2F] font-display">
                    {formatCurrency(ord.grandTotal)}
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg hover:bg-emerald-100">
                  Manage Status & Notes →
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details & Status Manager Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#0F5A2F] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base font-display">Order {selectedOrder.id}</h3>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
                <p className="text-xs text-emerald-100">
                  Placed {formatDateFull(selectedOrder.dateTime)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Dealer info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Business Name</span>
                  <span className="font-bold text-slate-800">{selectedOrder.retailerBusinessName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Proprietor</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.retailerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile Phone</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.retailerMobile}</span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                  Ordered Items & SKUs
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.imageUrl}
                          alt={it.itemName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0"
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
                          = {formatCurrency(it.total)} <span className="text-[10px] text-slate-400 font-normal">(incl. {it.gstPercent}% GST)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary totals */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-1.5 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(selectedOrder.subTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total GST:</span>
                  <span className="font-semibold">{formatCurrency(selectedOrder.gstTotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#0F5A2F] pt-2 border-t border-emerald-200">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(selectedOrder.grandTotal)}</span>
                </div>
              </div>

              {/* Retailer notes */}
              {selectedOrder.notes && (
                <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold block text-[11px] mb-1">Retailer Instructions / Transport Note:</span>
                  <p className="text-xs italic">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Status Update Control */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Update Order Workflow Status</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">New Status</label>
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Packed">Packed</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dispatch / LR / Admin Notes</label>
                    <input
                      type="text"
                      value={adminNotes}
                      onChange={e => setAdminNotes(e.target.value)}
                      placeholder="e.g. Dispatched via Karnal Transport, LR #89123"
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleUpdateStatus}
                    className="px-4 py-2 rounded-xl bg-[#0F5A2F] text-white font-bold text-xs hover:bg-[#0c4725] transition-all shadow-xs"
                  >
                    Save Status & Notify Retailer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
