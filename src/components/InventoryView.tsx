import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  X,
  PackageCheck,
  PackageX,
  Building2,
  Tag,
  DollarSign,
  Layers,
} from 'lucide-react';
import { InventoryItem, GSTType } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onAddInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  onUpdateInventoryItem: (item: InventoryItem) => void;
  onDeleteInventoryItem: (id: string) => void;
  onAdjustStockQuantity: (id: string, delta: number, reason: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onAddInventoryItem,
  onUpdateInventoryItem,
  onDeleteInventoryItem,
  onAdjustStockQuantity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Modal States
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Stocktake audit correction');

  // Item Form Fields
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General Goods');
  const [quantityOnHand, setQuantityOnHand] = useState<number>(10);
  const [reorderLevel, setReorderLevel] = useState<number>(5);
  const [unitCost, setUnitCost] = useState<number>(25.0);
  const [sellingPrice, setSellingPrice] = useState<number>(45.0);
  const [location, setLocation] = useState('Auckland Warehouse');
  const [supplier, setSupplier] = useState('NZ Wholesale Distro');
  const [gstType, setGstType] = useState<GSTType>('STANDARD_15');
  const [notes, setNotes] = useState('');

  const openAddItemModal = () => {
    setEditingItem(null);
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setName('');
    setCategory('General Goods');
    setQuantityOnHand(15);
    setReorderLevel(5);
    setUnitCost(20.0);
    setSellingPrice(39.99);
    setLocation('Auckland Warehouse - Bay A');
    setSupplier('Pacific Wholesale NZ');
    setGstType('STANDARD_15');
    setNotes('');
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: InventoryItem) => {
    setEditingItem(item);
    setSku(item.sku);
    setName(item.name);
    setCategory(item.category);
    setQuantityOnHand(item.quantityOnHand);
    setReorderLevel(item.reorderLevel);
    setUnitCost(item.unitCost);
    setSellingPrice(item.sellingPrice);
    setLocation(item.location || '');
    setSupplier(item.supplier || '');
    setGstType(item.gstType);
    setNotes(item.notes || '');
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    if (editingItem) {
      onUpdateInventoryItem({
        ...editingItem,
        sku,
        name,
        category,
        quantityOnHand,
        reorderLevel,
        unitCost,
        sellingPrice,
        location,
        supplier,
        gstType,
        notes,
      });
    } else {
      onAddInventoryItem({
        sku,
        name,
        category,
        quantityOnHand,
        reorderLevel,
        unitCost,
        sellingPrice,
        location,
        supplier,
        gstType,
        lastRestockedDate: new Date().toISOString().split('T')[0],
        notes,
      });
    }
    setIsItemModalOpen(false);
  };

  const openAdjustModal = (item: InventoryItem) => {
    setAdjustingItem(item);
    setAdjustDelta(0);
    setAdjustReason('Stocktake adjustment');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || adjustDelta === 0) return;
    onAdjustStockQuantity(adjustingItem.id, adjustDelta, adjustReason);
    setIsAdjustModalOpen(false);
  };

  // Calculations
  const totalCostValuation = inventory.reduce((acc, i) => acc + i.quantityOnHand * i.unitCost, 0);
  const totalRetailValuation = inventory.reduce((acc, i) => acc + i.quantityOnHand * i.sellingPrice, 0);
  const lowStockItems = inventory.filter((i) => i.quantityOnHand > 0 && i.quantityOnHand <= i.reorderLevel);
  const outOfStockItems = inventory.filter((i) => i.quantityOnHand <= 0);

  // Categories list
  const categories = Array.from(new Set(inventory.map((i) => i.category)));

  // Filter Logic
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;

    let matchesStatus = true;
    if (stockStatusFilter === 'LOW_STOCK') matchesStatus = item.quantityOnHand > 0 && item.quantityOnHand <= item.reorderLevel;
    if (stockStatusFilter === 'OUT_OF_STOCK') matchesStatus = item.quantityOnHand <= 0;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Reorder Level', 'Unit Cost (Excl GST)', 'Selling Price (Excl GST)', 'Total Cost Valuation'];
    const rows = inventory.map((i) => [
      i.sku,
      `"${i.name.replace(/"/g, '""')}"`,
      i.category,
      i.quantityOnHand,
      i.reorderLevel,
      i.unitCost.toFixed(2),
      i.sellingPrice.toFixed(2),
      (i.quantityOnHand * i.unitCost).toFixed(2),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventory_Stocktake_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[11px] font-bold border border-teal-500/30">
              Asset & Stock Control
            </span>
            <span className="text-xs text-slate-400">• NZ GST Excl / Incl Pricing</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-teal-400" /> Inventory & Stock Valuation Manager
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Track stock quantities on hand, reorder thresholds, inventory asset valuation, unit margins, and stocktake audit adjustments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button
            type="button"
            onClick={openAddItemModal}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Stock Item
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Stock Cost Valuation</span>
          <div className="text-2xl font-black text-slate-900">${totalCostValuation.toLocaleString('en-NZ', { minimumFractionDigits: 2 })} NZD</div>
          <span className="text-xs text-slate-500 mt-1 block">Asset value at cost (Excl GST)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Retail Value Potential</span>
          <div className="text-2xl font-black text-emerald-600">${totalRetailValuation.toLocaleString('en-NZ', { minimumFractionDigits: 2 })} NZD</div>
          <span className="text-xs text-slate-500 mt-1 block">Projected sales value</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Active SKUs</span>
          <div className="text-2xl font-black text-slate-900">{inventory.length} SKUs</div>
          <span className="text-xs text-slate-500 mt-1 block">{categories.length} product categories</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Low / Out of Stock</span>
          <div className={`text-2xl font-black ${lowStockItems.length + outOfStockItems.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {lowStockItems.length + outOfStockItems.length} Items
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {lowStockItems.length} low • {outOfStockItems.length} depleted
          </span>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length + outOfStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-amber-900 text-xs">Low Stock & Reorder Alert Triggered</h4>
              <p className="text-[11px] text-amber-700">
                {lowStockItems.map((i) => i.name).join(', ')} need replenishment from suppliers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStockStatusFilter('LOW_STOCK')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shrink-0"
          >
            Filter Low Stock Items
          </button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, product name or category..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="LOW_STOCK">Low Stock Warning</option>
            <option value="OUT_OF_STOCK">Out of Stock Only</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Stock Catalog ({filteredInventory.length} Items)</h3>
          <span className="text-xs text-slate-500">Unit prices shown Excl. GST</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">SKU / Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Qty on Hand</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Gross Margin</th>
                <th className="py-3 px-4 text-right">Total Valuation</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No inventory items found. Click "Add Stock Item" above to add your products or raw materials.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLow = item.quantityOnHand > 0 && item.quantityOnHand <= item.reorderLevel;
                  const isOut = item.quantityOnHand <= 0;
                  const marginPct = item.sellingPrice > 0 ? (((item.sellingPrice - item.unitCost) / item.sellingPrice) * 100).toFixed(1) : '0';
                  const totalItemVal = item.quantityOnHand * item.unitCost;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[10px] text-teal-700 font-bold">{item.sku}</div>
                        <div className="font-bold text-slate-900">{item.name}</div>
                        {item.location && <div className="text-[10px] text-slate-400">Loc: {item.location}</div>}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-bold">
                          <span
                            className={`text-sm ${
                              isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                            }`}
                          >
                            {item.quantityOnHand}
                          </span>
                          {isOut && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-100 text-rose-800 font-bold">
                              OUT
                            </span>
                          )}
                          {isLow && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-800 font-bold">
                              LOW
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">Min: {item.reorderLevel}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-700">${item.unitCost.toFixed(2)}</td>

                      <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-bold">
                        ${item.sellingPrice.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold text-slate-800">{marginPct}%</td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                        ${totalItemVal.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openAdjustModal(item)}
                            title="Adjust / Restock stock quantity"
                            className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold"
                          >
                            <RefreshCw className="w-3 h-3" /> Adjust
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditItemModal(item)}
                            title="Edit stock item"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteInventoryItem(item.id)}
                            title="Delete item"
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Inventory Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Boxes className="w-5 h-5 text-teal-600" />
                {editingItem ? 'Edit Inventory Stock Item' : 'Add New Inventory Stock Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. SKU-1001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Organic Coffee Beans 1kg"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Beverages, IT Hardware, Merchandise"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="e.g. Pacific Wholesale NZ"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity on Hand</label>
                  <input
                    type="number"
                    required
                    value={quantityOnHand}
                    onChange={(e) => setQuantityOnHand(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reorder Warning Level</label>
                  <input
                    type="number"
                    required
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit Cost Price ($ Excl GST)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price ($ Excl GST)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Warehouse Location / Shelf</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Auckland Warehouse - Rack B4"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {editingItem ? 'Save Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Quantity Modal */}
      {isAdjustModalOpen && adjustingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-teal-600" /> Adjust Stock Quantity
              </h3>
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 text-xs">{adjustingItem.name}</div>
                <div className="text-[11px] text-slate-500">Current Qty on Hand: <span className="font-bold text-slate-900">{adjustingItem.quantityOnHand}</span></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adjustment Delta (+Restock / -Write-off)</label>
                <input
                  type="number"
                  required
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(parseInt(e.target.value) || 0)}
                  placeholder="e.g. +10 or -2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-black focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  New Quantity will be: <span className="font-bold text-teal-700">{adjustingItem.quantityOnHand + adjustDelta}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Audit Reason / Note</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g., Supplier delivery, Damaged goods write-off"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Apply Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
