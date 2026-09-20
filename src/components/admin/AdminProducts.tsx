import React, { useState, useMemo } from 'react';
import { useAgro } from '../../context/AgroContext';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/presets';
import { PRODUCT_PHOTO_PRESETS } from '../../utils/presets';
import { StockBadge } from '../common/Badge';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Package,
  Filter,
  Image as ImageIcon
} from 'lucide-react';

interface AdminProductsProps {
  initialOpenAdd?: boolean;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ initialOpenAdd = false }) => {
  const {
    products,
    companies,
    saveProduct,
    toggleProductActive,
    deleteProduct
  } = useAgro();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(initialOpenAdd);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const categories = ['ALL', 'Fungicides', 'Insecticides', 'Fertilizers', 'Seeds', 'Herbicides', 'Bio-Nutrients'];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.alias.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesComp = selectedCompany === 'ALL' || p.company === selectedCompany;

      return matchesSearch && matchesCat && matchesComp;
    });
  }, [products, searchQuery, selectedCategory, selectedCompany]);

  const handleOpenAdd = () => {
    setEditingProduct({
      itemCode: `AGR-${Math.floor(1000 + Math.random() * 9000)}`,
      itemName: '',
      alias: '',
      company: companies[0]?.name || 'Bayer CropScience',
      category: 'Fungicides',
      subCategory: '',
      unit: 'Bottle',
      packSize: '500 ml',
      packing: 'Box',
      purchaseRate: 500,
      sellingRate: 560,
      mrp: 650,
      gstPercent: 18,
      hsnCode: '38089190',
      barcode: '',
      openingStock: 100,
      currentStock: 100,
      description: '',
      imageUrl: PRODUCT_PHOTO_PRESETS[0].url,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct({ ...p });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.itemName || !editingProduct?.itemCode) {
      alert('Please fill Item Name and Item Code');
      return;
    }
    saveProduct(editingProduct);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            Product Master Catalog
          </h1>
          <p className="text-xs text-slate-500">
            Manage your inventory, pricing, pack sizes, and SKU images ({products.length} items)
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F5A2F] hover:bg-[#0c4725] text-white font-semibold text-xs shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, code, company, or technical alias..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">All Companies</option>
              {companies.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#0F5A2F] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Company & Category</th>
                <th className="py-3 px-4">Pack & Unit</th>
                <th className="py-3 px-4 text-right">Selling Rate</th>
                <th className="py-3 px-4 text-right">MRP</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Item Details */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.itemName}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{p.itemName}</div>
                          <div className="text-[11px] text-emerald-800 font-mono font-medium">{p.itemCode}</div>
                          {p.alias && (
                            <div className="text-[10px] text-slate-400 italic">{p.alias}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Company & Category */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{p.company}</div>
                      <span className="inline-block mt-0.5 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {p.category}
                      </span>
                    </td>

                    {/* Pack */}
                    <td className="py-3 px-4 text-slate-600">
                      <div>{p.packSize}</div>
                      <div className="text-[10px] text-slate-400">{p.unit} ({p.packing})</div>
                    </td>

                    {/* Rate */}
                    <td className="py-3 px-4 text-right font-bold text-[#0F5A2F] text-sm">
                      {formatCurrency(p.sellingRate)}
                      <div className="text-[10px] text-slate-400 font-normal">+{p.gstPercent}% GST</div>
                    </td>

                    {/* MRP */}
                    <td className="py-3 px-4 text-right text-slate-500 font-medium">
                      {formatCurrency(p.mrp)}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4 text-center">
                      <StockBadge stock={p.currentStock} unit={p.unit} />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleProductActive(p.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                          p.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {p.isActive ? (
                          <><CheckCircle className="w-3 h-3 text-emerald-600" /> Active</>
                        ) : (
                          <><XCircle className="w-3 h-3 text-slate-400" /> Inactive</>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${p.itemName}?`)) deleteProduct(p.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#0F5A2F] text-white flex items-center justify-between">
              <h3 className="font-semibold text-base font-display">
                {editingProduct.id ? 'Edit Product' : 'Add New Product to Catalog'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Item Code *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.itemCode || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, itemCode: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-mono uppercase focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="e.g. BAY-NAT-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.itemName || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, itemName: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="e.g. Nativo Fungicide"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Technical Alias</label>
                  <input
                    type="text"
                    value={editingProduct.alias || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, alias: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="e.g. Tebuconazole + Trifloxystrobin"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Brand</label>
                  <select
                    value={editingProduct.company || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, company: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category || 'Fungicides'}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    {categories.filter(c => c !== 'ALL').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pack Size & Unit</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editingProduct.packSize || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, packSize: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      placeholder="e.g. 500 ml / 1 Kg"
                    />
                    <input
                      type="text"
                      value={editingProduct.unit || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      placeholder="Bottle / Bag"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling Rate (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.sellingRate ?? ''}
                    onChange={e => setEditingProduct({ ...editingProduct, sellingRate: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.mrp ?? ''}
                    onChange={e => setEditingProduct({ ...editingProduct, mrp: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GST %</label>
                  <select
                    value={editingProduct.gstPercent ?? 18}
                    onChange={e => setEditingProduct({ ...editingProduct, gstPercent: parseFloat(e.target.value) })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value={0}>0% (Seeds / Exempt)</option>
                    <option value={5}>5% (Fertilizers)</option>
                    <option value={12}>12% (Organic)</option>
                    <option value={18}>18% (Pesticides / Fungicides)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.currentStock ?? ''}
                    onChange={e => setEditingProduct({ ...editingProduct, currentStock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Image / Photo Preset
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="url"
                    value={editingProduct.imageUrl || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  {editingProduct.imageUrl && (
                    <img
                      src={editingProduct.imageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded object-cover border border-slate-200"
                    />
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mb-1.5">Or choose from agricultural presets:</div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRODUCT_PHOTO_PRESETS.map(preset => (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => setEditingProduct({ ...editingProduct, imageUrl: preset.url })}
                      className={`p-1 rounded-lg border text-left flex flex-col items-center gap-1 transition-all ${
                        editingProduct.imageUrl === preset.url
                          ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded object-cover"
                      />
                      <span className="text-[9px] text-slate-600 truncate w-full text-center">
                        {preset.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Application Notes</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="Dosage, target pests/crops, packing details..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F5A2F] text-white text-xs font-bold hover:bg-[#0c4725] shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
