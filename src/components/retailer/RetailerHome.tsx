import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/presets';
import { StockBadge } from '../common/Badge';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  ChevronRight,
  Sparkles,
  Info,
  Layers
} from 'lucide-react';

interface RetailerHomeProps {
  onNavigateToCatalog: (category?: string) => void;
  onNavigateToCart: () => void;
  onOpenProductDetail: (product: Product) => void;
}

export const RetailerHome: React.FC<RetailerHomeProps> = ({
  onNavigateToCatalog,
  onNavigateToCart,
  onOpenProductDetail
}) => {
  const {
    currentRetailer,
    products,
    posters,
    cart,
    addToCart,
    updateCartItemQuantity,
    cartCount
  } = useAgro();

  const [activePosterIndex, setActivePosterIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const activePosters = posters.filter(p => p.isActive);
  const categories = ['ALL', 'Fungicides', 'Insecticides', 'Fertilizers', 'Seeds', 'Herbicides', 'Bio-Nutrients'];

  const filteredProducts = products.filter(p => {
    if (!p.isActive) return false;
    const matchesSearch =
      p.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.alias.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getItemCartQty = (productId: string) => {
    const item = cart.find(c => c.productId === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-6">
      {/* Retailer Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0F5A2F] to-[#1b7a42] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-200 uppercase tracking-wider font-semibold">
            <span>Welcome, {currentRetailer?.retailerName}</span>
            <span>•</span>
            <span>{currentRetailer?.city}</span>
          </div>
          <h1 className="text-2xl font-black font-display mt-0.5">
            {currentRetailer?.businessName}
          </h1>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
            Browse our wholesale agricultural catalog, place direct orders, and track your dispatches & ledger.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-black/15 p-3 rounded-xl backdrop-blur-xs border border-white/10 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Ledger Outstanding</span>
            <span className="text-lg font-black text-white">
              {formatCurrency(currentRetailer?.outstandingAmount || 0)}
            </span>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Credit Limit</span>
            <span className="text-lg font-black text-amber-300">
              {formatCurrency(currentRetailer?.creditLimit || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Promotional Schemes Carousel */}
      {activePosters.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-200 bg-slate-900 group">
          <div className="relative h-48 sm:h-64 w-full">
            <img
              src={activePosters[activePosterIndex].imageUrl}
              alt={activePosters[activePosterIndex].title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full w-fit mb-2">
                <Sparkles className="w-3 h-3" /> Special Scheme Offer
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display">
                {activePosters[activePosterIndex].title}
              </h2>
              <p className="text-xs text-slate-200 max-w-2xl mt-1 line-clamp-2">
                {activePosters[activePosterIndex].description}
              </p>
            </div>
          </div>

          {/* Carousel dots */}
          {activePosters.length > 1 && (
            <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
              {activePosters.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActivePosterIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    activePosterIndex === i ? 'w-6 bg-white' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Search & Category Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search pesticide, fungicide, seed, herbicide or brand..."
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0F5A2F] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Items' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              Wholesale Product Catalog
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredProducts.length} items with direct distributor pricing
            </p>
          </div>
          {cartCount > 0 && (
            <button
              onClick={onNavigateToCart}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              View Cart ({cartCount})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(p => {
            const qty = getItemCartQty(p.id);

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    onClick={() => onOpenProductDetail(p)}
                    className="relative h-44 bg-slate-100 overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.itemName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold bg-white/95 text-slate-800 px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs">
                        {p.company}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <StockBadge stock={p.currentStock} unit={p.unit} />
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div
                      onClick={() => onOpenProductDetail(p)}
                      className="cursor-pointer"
                    >
                      <h3 className="font-bold text-sm text-slate-900 leading-snug hover:text-emerald-800 transition-colors">
                        {p.itemName}
                      </h3>
                      {p.alias && (
                        <p className="text-[11px] text-slate-500 italic line-clamp-1 mt-0.5">
                          {p.alias}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        Pack: {p.packSize}
                      </span>
                      <span className="text-slate-400 line-through text-[11px]">
                        MRP {formatCurrency(p.mrp)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Dealer Rate</span>
                        <span className="text-base font-extrabold text-[#0F5A2F] font-display">
                          {formatCurrency(p.sellingRate)}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">
                        +{p.gstPercent}% GST
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Footer */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                  {qty === 0 ? (
                    <button
                      onClick={() => addToCart(p, 1)}
                      disabled={p.currentStock <= 0}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        p.currentStock <= 0
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-[#0F5A2F] hover:bg-[#0c4725] text-white shadow-xs'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      {p.currentStock <= 0 ? 'Out of Stock' : 'Add to Order'}
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-1 border border-emerald-200">
                      <button
                        onClick={() => updateCartItemQuantity(p.id, qty - 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-emerald-800 font-bold hover:bg-emerald-100 transition-colors shadow-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-black text-xs text-emerald-950 font-mono px-2">
                        {qty} in Cart
                      </span>
                      <button
                        onClick={() => updateCartItemQuantity(p.id, qty + 1)}
                        className="w-7 h-7 flex items-center justify-center bg-[#0F5A2F] rounded-lg text-white font-bold hover:bg-[#0c4725] transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
