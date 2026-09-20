import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useAgro } from '../../context/AgroContext';
import { Product, ImportHistoryItem } from '../../types';
import { formatCurrency, formatDateShort } from '../../utils/presets';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  History,
  FileText,
  Table,
  Sparkles
} from 'lucide-react';

interface AdminExcelImportProps {
  onNavigateToHistory: () => void;
}

const SAMPLE_BUSY_ROWS = [
  {
    "Item Code": "BAY-ADMIRE-50",
    "Item Name": "Admire Insecticide",
    "Alias": "Imidacloprid 70% WG",
    "Company": "Bayer CropScience",
    "Item Group": "Insecticides",
    "Sub Group": "Systemic",
    "Unit": "Grams",
    "Pack Size": "50 gm",
    "Packing": "Bottle",
    "Purchase Rate": "285",
    "Selling Rate": "320",
    "MRP": "365",
    "GST Rate": "18",
    "HSN Code": "38089190",
    "Barcode": "890123456010",
    "Opening Stock": "60",
    "Current Stock": "60",
    "Description": "High concentration Imidacloprid for sucking pests in cotton and rice"
  },
  {
    "Item Code": "SYN-AMISTAR-250",
    "Item Name": "Amistar Top Fungicide",
    "Alias": "Azoxystrobin + Difenoconazole",
    "Company": "Syngenta India",
    "Item Group": "Fungicides",
    "Sub Group": "Broad Spectrum",
    "Unit": "ml",
    "Pack Size": "200 ml",
    "Packing": "Pet Bottle",
    "Purchase Rate": "890",
    "Selling Rate": "970",
    "MRP": "1120",
    "GST Rate": "18",
    "HSN Code": "38089290",
    "Barcode": "890123456011",
    "Opening Stock": "40",
    "Current Stock": "40",
    "Description": "Excellent preventive and curative control for fungal blights"
  },
  {
    "Item Code": "IFF-DAP-500",
    "Item Name": "IFFCO Nano DAP Liquid",
    "Alias": "Nano DAP 8% N 16% P",
    "Company": "IFFCO",
    "Item Group": "Fertilizers",
    "Sub Group": "Nano Technology",
    "Unit": "Bottle",
    "Pack Size": "500 ml",
    "Packing": "Box of 24",
    "Purchase Rate": "510",
    "Selling Rate": "550",
    "MRP": "600",
    "GST Rate": "5",
    "HSN Code": "31052000",
    "Barcode": "890123456012",
    "Opening Stock": "120",
    "Current Stock": "120",
    "Description": "Next-gen liquid phosphatic fertilizer for seed treatment and foliar spray"
  },
  {
    "Item Code": "UPL-ROUNDUP-1L",
    "Item Name": "Roundup Herbicide",
    "Alias": "Glyphosate 41% IPA",
    "Company": "UPL Limited",
    "Item Group": "Herbicides",
    "Sub Group": "Systemic Weedicide",
    "Unit": "Ltr",
    "Pack Size": "1 Ltr",
    "Packing": "Canister",
    "Purchase Rate": "480",
    "Selling Rate": "530",
    "MRP": "610",
    "GST Rate": "18",
    "HSN Code": "38089340",
    "Barcode": "890123456013",
    "Opening Stock": "75",
    "Current Stock": "75",
    "Description": "Non-selective systemic herbicide for annual and perennial weeds"
  }
];

export const AdminExcelImport: React.FC<AdminExcelImportProps> = ({ onNavigateToHistory }) => {
  const { executeImport } = useAgro();

  // Steps: 0 = Upload / File, 1 = Mapping, 2 = Preview & Confirm, 3 = Result
  const [currentStep, setCurrentStep] = useState(0);
  const [fileName, setFileName] = useState('');
  const [parsedRawRows, setParsedRawRows] = useState<Record<string, any>[]>([]);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);

  // Column Mapping
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    itemCode: 'Item Code',
    itemName: 'Item Name',
    alias: 'Alias',
    company: 'Company',
    category: 'Item Group',
    subCategory: 'Sub Group',
    unit: 'Unit',
    packSize: 'Pack Size',
    packing: 'Packing',
    purchaseRate: 'Purchase Rate',
    sellingRate: 'Selling Rate',
    mrp: 'MRP',
    gstPercent: 'GST Rate',
    hsnCode: 'HSN Code',
    barcode: 'Barcode',
    currentStock: 'Current Stock',
    description: 'Description'
  });

  const [importMode, setImportMode] = useState<'NEW_ONLY' | 'NEW_AND_UPDATE'>('NEW_AND_UPDATE');
  const [stockMode, setStockMode] = useState<'REPLACE' | 'ADD'>('REPLACE');
  const [lastResult, setLastResult] = useState<ImportHistoryItem | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        if (json.length > 0) {
          const headers = Object.keys(json[0]);
          setFileHeaders(headers);
          setParsedRawRows(json);

          // Auto-detect mappings
          const newMap: Record<string, string> = { ...columnMapping };
          headers.forEach(h => {
            const lower = h.toLowerCase();
            if (lower.includes('code')) newMap.itemCode = h;
            else if (lower.includes('name') || lower.includes('title')) newMap.itemName = h;
            else if (lower.includes('alias')) newMap.alias = h;
            else if (lower.includes('company') || lower.includes('brand')) newMap.company = h;
            else if (lower.includes('group') || lower.includes('cat')) newMap.category = h;
            else if (lower.includes('pack')) newMap.packSize = h;
            else if (lower.includes('unit')) newMap.unit = h;
            else if (lower.includes('sell') || lower.includes('rate') || lower.includes('price')) newMap.sellingRate = h;
            else if (lower.includes('mrp')) newMap.mrp = h;
            else if (lower.includes('gst') || lower.includes('tax')) newMap.gstPercent = h;
            else if (lower.includes('stock') || lower.includes('qty')) newMap.currentStock = h;
            else if (lower.includes('desc')) newMap.description = h;
          });
          setColumnMapping(newMap);
          setCurrentStep(1);
        } else {
          alert('Uploaded sheet is empty.');
        }
      } catch (err) {
        console.error(err);
        alert('Could not parse Excel/CSV file. Please check format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLoadSample = () => {
    setFileName('Busy_Accounting_Item_Master_Export.xlsx');
    const headers = Object.keys(SAMPLE_BUSY_ROWS[0]);
    setFileHeaders(headers);
    setParsedRawRows(SAMPLE_BUSY_ROWS);
    setCurrentStep(1);
  };

  const mapRowsToProducts = (): Partial<Product>[] => {
    return parsedRawRows.map(row => {
      const getVal = (field: string) => {
        const headerName = columnMapping[field];
        return headerName ? row[headerName] : undefined;
      };

      return {
        itemCode: String(getVal('itemCode') || '').trim(),
        itemName: String(getVal('itemName') || '').trim(),
        alias: String(getVal('alias') || '').trim(),
        company: String(getVal('company') || 'Bayer CropScience').trim(),
        category: String(getVal('category') || 'Fungicides').trim(),
        subCategory: String(getVal('subCategory') || '').trim(),
        unit: String(getVal('unit') || 'Bottle').trim(),
        packSize: String(getVal('packSize') || '500 ml').trim(),
        packing: String(getVal('packing') || 'Box').trim(),
        purchaseRate: parseFloat(getVal('purchaseRate')) || 0,
        sellingRate: parseFloat(getVal('sellingRate')) || 0,
        mrp: parseFloat(getVal('mrp')) || 0,
        gstPercent: parseFloat(getVal('gstPercent')) || 18,
        hsnCode: String(getVal('hsnCode') || '38089190').trim(),
        barcode: String(getVal('barcode') || '').trim(),
        currentStock: parseInt(getVal('currentStock'), 10) || 0,
        description: String(getVal('description') || '').trim()
      };
    });
  };

  const handleExecuteImport = () => {
    const productsToImport = mapRowsToProducts();
    const res = executeImport(productsToImport, importMode, stockMode, fileName);
    setLastResult(res);
    setCurrentStep(3);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            Excel & Busy Item Master Import
          </h1>
          <p className="text-xs text-slate-500">
            Seamlessly import or update products and inventory stock from your Busy or Tally ERP exports
          </p>
        </div>
        <button
          onClick={onNavigateToHistory}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shrink-0"
        >
          <History className="w-4 h-4 text-emerald-700" />
          View Import History
        </button>
      </div>

      {/* Stepper Wizard Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className={`flex items-center gap-2 font-bold ${currentStep >= 0 ? 'text-[#0F5A2F]' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${currentStep >= 0 ? 'bg-[#0F5A2F]' : 'bg-slate-300'}`}>
            1
          </span>
          <span>Upload File</span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
        <div className={`flex items-center gap-2 font-bold ${currentStep >= 1 ? 'text-[#0F5A2F]' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${currentStep >= 1 ? 'bg-[#0F5A2F]' : 'bg-slate-300'}`}>
            2
          </span>
          <span>Column Mapping</span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
        <div className={`flex items-center gap-2 font-bold ${currentStep >= 2 ? 'text-[#0F5A2F]' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${currentStep >= 2 ? 'bg-[#0F5A2F]' : 'bg-slate-300'}`}>
            3
          </span>
          <span>Preview & Sync</span>
        </div>
      </div>

      {/* STEP 0: Upload / Sample */}
      {currentStep === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs text-center max-w-xl mx-auto space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-50 text-[#0F5A2F] inline-block">
            <FileSpreadsheet className="w-12 h-12" />
          </div>

          <div>
            <h2 className="text-lg font-bold font-display text-slate-900">
              Select Excel or CSV Spreadsheet
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Supported formats: .xlsx, .xls, .csv. Supports default exports from Busy Accounting & Tally ERP.
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-emerald-600 transition-colors bg-slate-50/50">
            <input
              type="file"
              id="excel-file-input"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="excel-file-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <UploadCloud className="w-8 h-8 text-emerald-700" />
              <span className="text-xs font-bold text-slate-800">
                Click to browse or drop your spreadsheet here
              </span>
              <span className="text-[11px] text-slate-400">
                Auto-detects Item Code, Selling Rate, GST %, Pack Size, etc.
              </span>
            </label>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase">Or test with demo data</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button
            onClick={handleLoadSample}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            Load Sample Busy ERP Export (4 Agricultural Products)
          </button>
        </div>
      )}

      {/* STEP 1: Column Mapping */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold font-display text-slate-900">
                Map Spreadsheet Columns to Catalog Fields
              </h2>
              <p className="text-xs text-slate-500">
                File: <span className="font-semibold text-emerald-800">{fileName}</span> ({parsedRawRows.length} rows found)
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(0)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Choose different file
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {Object.keys(columnMapping).map(key => (
              <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-700 capitalize mb-1">
                  {key.replace(/([A-Z])/g, ' $1')} {['itemCode', 'itemName', 'sellingRate'].includes(key) && '*'}
                </label>
                <select
                  value={columnMapping[key] || ''}
                  onChange={e => setColumnMapping({ ...columnMapping, [key]: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="">-- Do Not Map --</option>
                  {fileHeaders.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F5A2F] text-white font-bold text-xs hover:bg-[#0c4725] shadow-xs"
            >
              Continue to Preview <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Preview & Execution */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold font-display text-slate-900">
                Preview & Import Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Review how rows will be saved to your product master catalog
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Mapping
            </button>
          </div>

          {/* Import Modes Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-2">Duplicate Item Codes Handling</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'NEW_AND_UPDATE'}
                    onChange={() => setImportMode('NEW_AND_UPDATE')}
                    className="text-emerald-700"
                  />
                  <span><strong>Update Existing & Add New</strong> (Recommended)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'NEW_ONLY'}
                    onChange={() => setImportMode('NEW_ONLY')}
                    className="text-emerald-700"
                  />
                  <span><strong>Add New Only</strong> (Skip existing item codes)</span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-2">Stock Import Mode</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stockMode"
                    checked={stockMode === 'REPLACE'}
                    onChange={() => setStockMode('REPLACE')}
                    className="text-emerald-700"
                  />
                  <span><strong>Replace Current Stock</strong> (Set to sheet quantity)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stockMode"
                    checked={stockMode === 'ADD'}
                    onChange={() => setStockMode('ADD')}
                    className="text-emerald-700"
                  />
                  <span><strong>Add to Current Stock</strong> (Existing + Sheet quantity)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Preview Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
              Parsed Products Preview ({parsedRawRows.length} items)
            </div>
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">Item Code</th>
                    <th className="p-2.5">Item Name</th>
                    <th className="p-2.5">Company</th>
                    <th className="p-2.5">Pack Size</th>
                    <th className="p-2.5 text-right">Selling Rate</th>
                    <th className="p-2.5 text-center">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mapRowsToProducts().map((prod, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-emerald-800">{prod.itemCode}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{prod.itemName}</td>
                      <td className="p-2.5 text-slate-600">{prod.company}</td>
                      <td className="p-2.5 text-slate-600">{prod.packSize} ({prod.unit})</td>
                      <td className="p-2.5 text-right font-bold text-[#0F5A2F]">{formatCurrency(prod.sellingRate || 0)}</td>
                      <td className="p-2.5 text-center font-semibold">{prod.currentStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Ready to process {parsedRawRows.length} rows into AgroRetail database
            </span>
            <button
              onClick={handleExecuteImport}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F5A2F] text-white font-bold text-xs hover:bg-[#0c4725] shadow-xs"
            >
              Confirm & Execute Import <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Summary Result */}
      {currentStep === 3 && lastResult && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs text-center max-w-lg mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-slate-900">
              Import Completed Successfully!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              File: {lastResult.fileName}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Rows</span>
              <span className="text-lg font-bold text-slate-800">{lastResult.totalRows}</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900">
              <span className="text-[10px] font-bold text-emerald-700 block uppercase">New Items</span>
              <span className="text-lg font-bold text-emerald-800">+{lastResult.imported}</span>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-blue-900">
              <span className="text-[10px] font-bold text-blue-700 block uppercase">Updated</span>
              <span className="text-lg font-bold text-blue-800">{lastResult.updated}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Skipped</span>
              <span className="text-lg font-bold text-slate-800">{lastResult.skipped}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setCurrentStep(0)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Import Another File
            </button>
            <button
              onClick={onNavigateToHistory}
              className="px-5 py-2 rounded-xl bg-[#0F5A2F] text-white text-xs font-bold hover:bg-[#0c4725] shadow-xs"
            >
              View Import History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
