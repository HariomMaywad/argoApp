import React from 'react';
import { useAgro } from '../../context/AgroContext';
import { formatDateShort } from '../../utils/presets';
import { History, FileSpreadsheet, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminImportHistoryProps {
  onBack: () => void;
}

export const AdminImportHistory: React.FC<AdminImportHistoryProps> = ({ onBack }) => {
  const { importHistory } = useAgro();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-900">
              Excel / ERP Import Audit Log
            </h1>
            <p className="text-xs text-slate-500">
              Historical records of all bulk uploads, row counts, and catalog sync events
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {importHistory.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <History className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No imports recorded yet in this session.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {importHistory.map(item => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 shrink-0">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.fileName}</h3>
                    <p className="text-xs text-slate-500">
                      Imported by {item.adminName} • {formatDateShort(item.timestamp)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                        {item.totalRows} Total Rows
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium">
                        +{item.imported} New
                      </span>
                      <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-medium">
                        {item.updated} Updated
                      </span>
                      {item.skipped > 0 && (
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium">
                          {item.skipped} Skipped
                        </span>
                      )}
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">
                        Stock: {item.stockImportMode}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold shrink-0">
                  <CheckCircle2 className="w-4 h-4" /> Successful Sync
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
