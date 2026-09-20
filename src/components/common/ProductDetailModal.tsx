import React from 'react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/presets';
import { StockBadge } from './Badge';
import { useAgro } from '../../context/AgroContext';
import {
  X,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { cart, addToCart, updateCartItemQuantity } = useAgro();

  if (!product) return null;

  const cartItem = cart.find(c => c.productId === product.id);
  const qty = cartItem ? cartItem.quantity : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="relative h-60 bg-slate-900 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.itemName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 p-2 rounded-full transition-all backdrop-blur-xs"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-5 right-5 text-white">
            <span className="text-[10px] font-bold bg-[#0F5A2F] text-white px-2 py-0.5 rounded shadow-xs mb-1.5 inline-block">
              {product.company}
            </span>
            <h2 className="text-xl font-bold font-display leading-tight text-white">
              {product.itemName}
            </h2>
            {product.alias && (
              <p className="text-xs text-emerald-200/90 italic font-mono mt-0.5">
                {product.alias}
              </p>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Pricing & Stock Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Wholesale Rate</span>
              <div className="text-2xl font-black text-[#0F5A2F] font-display">
                {formatCurrency(product.sellingRate)}
              </div>
              <span className="text-[10px] text-slate-400">
                MRP {formatCurrency(product.mrp)} • +{product.gstPercent}% GST
              </span>
            </div>

            <div className="text-right">
              <StockBadge stock={product.currentStock} unit={product.unit} />
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                HSN: {product.hsnCode}
              </div>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Pack Size</span>
              <span className="font-bold text-slate-800 text-xs">{product.packSize}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Unit</span>
              <span className="font-bold text-slate-800 text-xs">{product.unit}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
              <span className="font-bold text-slate-800 text-xs">{product.category}</span>
            </div>
          </div>

          {/* Description & Technical notes */}
          {product.description && (
            <div className="space-y-1">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Technical Application & Pest Control
              </span>
              <p className="text-slate-600 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/80 leading-relaxed text-xs">
                {product.description}
              </p>
            </div>
          )}

          {/* Cart action footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>

            {qty === 0 ? (
              <button
                onClick={() => addToCart(product, 1)}
                disabled={product.currentStock <= 0}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all ${
                  product.currentStock <= 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-[#0F5A2F] text-white hover:bg-[#0c4725]'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {product.currentStock <= 0 ? 'Out of Stock' : 'Add to Purchase Order'}
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-50 rounded-xl p-1 border border-emerald-200">
                <button
                  onClick={() => updateCartItemQuantity(product.id, qty - 1)}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-emerald-800 font-bold hover:bg-emerald-100 shadow-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-black text-xs text-emerald-950 font-mono px-3">
                  {qty} in Order
                </span>
                <button
                  onClick={() => updateCartItemQuantity(product.id, qty + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-[#0F5A2F] rounded-lg text-white font-bold hover:bg-[#0c4725] shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
