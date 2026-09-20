import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  User,
  Package,
  Clock,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AssetMovementsView: React.FC = () => {
  const { assetMovements, navigate, currentCentre } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMovements = assetMovements.filter(
    (m) =>
      m.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.toLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.performedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('assets')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Back to Assets"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Asset Movement Audit Log</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Immutable chain-of-custody audit trail for hardware swaps, booth re-allocations, and spares movements.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search movements, technicians..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg w-64 focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Movements Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Movement ID</th>
                <th className="px-4 py-3">Asset Tag & Description</th>
                <th className="px-4 py-3">Source Location</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Reason / Justification</th>
                <th className="px-4 py-3">Technician</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ArrowLeftRight className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">No asset movement records found</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {searchQuery ? 'Try adjusting your search query.' : 'Hardware reallocations will appear here automatically.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">{m.id}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-slate-900 dark:text-white block">{m.assetId}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{m.assetName}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">{m.fromLocation}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                        {m.toLocation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{m.reason}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{m.performedBy}</td>
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-500 font-mono text-[11px]">{m.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
