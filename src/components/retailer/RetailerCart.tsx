import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { formatCurrency } from '../../utils/presets';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Truck,
  FileText,
  AlertCircle
} from 'lucide-react';

interface RetailerCartProps {
  onBackToShopping: () => void;
  onViewOrders: () => void;
}

export const RetailerCart: React.FC<RetailerCartProps> = ({
  onBackToShopping,
  onViewOrders
}) => {
  const {
    cart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    currentRetailer
  } = useAgro();

  const [notes, setNotes] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  // Calculations
  const subTotal = cart.reduce((acc, item) => acc + (item.product.sellingRate * item.quantity), 0);
  const gstTotal = cart.reduce((acc, item) => {
    const itemSub = item.product.sellingRate * item.quantity;
    return acc + (itemSub * item.product.gstPercent / 100);
  }, 0);
  const grandTotal = subTotal + gstTotal;

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    const order = placeOrder(notes);
    if (order) {
      setPlacedOrderId(order.id);
    }
  };

  if (placedOrderId) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs text-center max-w-lg mx-auto space-y-6 my-8">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0F5A2F] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">
            Order Placed Successfully!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Order Reference: <strong className="font-mono text-[#0F5A2F] text-sm">{placedOrderId}</strong>
          </p>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-950 text-left space-y-2">
          <div className="flex justify-between font-semibold">
            <span>Bill To:</span>
            <span>{currentRetailer?.businessName}</span>
          </div>
          <div className="flex justify-between font-black text-sm text-[#0F5A2F] pt-2 border-t border-emerald-200">
            <span>Estimated Total:</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
          <p className="text-[11px] text-emerald-800 pt-1 leading-relaxed">
            Your distributor has received your booking. You will receive an instant notification once goods are confirmed and packed for transport dispatch.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onBackToShopping}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Order More Products
          </button>
          <button
            onClick={onViewOrders}
            className="px-5 py-2 rounded-xl bg-[#0F5A2F] text-white text-xs font-bold hover:bg-[#0c4725] shadow-xs"
          >
            Track Order Status
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-xs text-center max-w-md mx-auto space-y-4 my-8">
        <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 font-display">Your Order Cart is Empty</h2>
        <p className="text-xs text-slate-500">
          Browse our wholesale agricultural catalog and add seeds, pesticides, or fertilizers to your order.
        </p>
        <button
          onClick={onBackToShopping}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F5A2F] text-white text-xs font-bold hover:bg-[#0c4725] shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToShopping}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-900">
              Shopping Cart & Checkout
            </h1>
            <p className="text-xs text-slate-500">
              Review your ordered items, GST breakup, and dispatch instructions ({cart.length} items)
            </p>
          </div>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => {
            const itemSub = item.product.sellingRate * item.quantity;
            const itemGst = (itemSub * item.product.gstPercent) / 100;
            const itemTotal = itemSub + itemGst;

            return (
              <div
                key={item.productId}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.itemName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {item.product.itemName}
                    </h3>
                    <div className="text-xs text-slate-500">
                      Pack: <span className="font-semibold text-slate-700">{item.product.packSize}</span> • Brand: {item.product.company}
                    </div>
                    <div className="text-xs text-emerald-800 font-bold mt-1">
                      {formatCurrency(item.product.sellingRate)} <span className="text-[10px] text-slate-400 font-normal">+{item.product.gstPercent}% GST</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0 border-slate-100">
                  {/* Quantity stepper */}
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                    <button
                      onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-slate-700 font-bold hover:bg-slate-200 shadow-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-xs text-slate-900 font-mono px-3">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-slate-700 font-bold hover:bg-slate-200 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Total */}
                  <div className="text-right min-w-[90px]">
                    <div className="text-sm font-black text-[#0F5A2F] font-display">
                      {formatCurrency(itemTotal)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Incl. {formatCurrency(itemGst)} GST
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Transport & Dispatch Notes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Transport / Delivery Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Send goods through Karnal Golden Transport, please send bilty on WhatsApp..."
              className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-bold text-base text-slate-900 font-display border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-bold text-slate-800">{formatCurrency(subTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST:</span>
                <span className="font-bold text-slate-800">{formatCurrency(gstTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Freight / Delivery:</span>
                <span className="text-emerald-700 font-bold">To Pay / As per LR</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Grand Total:</span>
                <span className="text-2xl font-black text-[#0F5A2F] font-display">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full py-3 rounded-xl bg-[#0F5A2F] hover:bg-[#0c4725] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Confirm & Place Order
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Upon booking, distributor will pack and issue the Tax Invoice. Balance will reflect in your dealer ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
