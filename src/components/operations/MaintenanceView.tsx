import React, { useState } from 'react';
import {
  Wrench,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  User,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MaintenanceRecord } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';

export const MaintenanceView: React.FC = () => {
  const { maintenance, systems, currentCentre, currentUser, scheduleMaintenance, updateMaintenanceStatus, navigate } = useApp();

  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);

  // New Maintenance Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSystemId, setNewSystemId] = useState('');
  const [newType, setNewType] = useState<'preventive' | 'corrective' | 'upgrade' | 'inspection'>('preventive');
  const [newDate, setNewDate] = useState('2026-09-05');

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleMaintenance({
      title: newTitle,
      description: newDesc,
      systemId: newSystemId || undefined,
      systemName: newSystemId ? systems.find((s) => s.id === newSystemId)?.name : undefined,
      type: newType,
      status: 'scheduled',
      scheduledDate: newDate,
      technician: currentUser.name
    });
    setScheduleModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Scheduled IT Maintenance</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
              Maintenance Windows
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage scheduled OS patch windows, hardware servicing, CCTV lens cleaning, and lockdown engine upgrades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Maintenance</span>
          </button>
        </div>
      </div>

      {/* Maintenance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {maintenance.map((m) => (
          <div
            key={m.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs font-bold text-indigo-900 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  {m.id}
                </span>
                <StatusBadge status={m.status} size="sm" />
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{m.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{m.description}</p>

              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="text-slate-400 dark:text-slate-500">Target</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {m.systemId ? `${m.systemId} (${m.systemName})` : 'Centre-Wide Workstations'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="text-slate-400 dark:text-slate-500">Category</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{m.type}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="text-slate-400 dark:text-slate-500">Scheduled Date</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{m.scheduledDate}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="text-slate-400 dark:text-slate-500">Assigned Tech</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{m.technician}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {m.status !== 'completed' ? (
                <button
                  onClick={() =>
                    updateMaintenanceStatus(
                      m.id,
                      m.status === 'scheduled' ? 'in_progress' : 'completed'
                    )
                  }
                  className={`w-full py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    m.status === 'scheduled'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white'
                  }`}
                >
                  {m.status === 'scheduled' ? 'Start Maintenance Window' : 'Sign Off as Completed'}
                </button>
              ) : (
                <div className="w-full text-center text-xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center justify-center gap-1.5 py-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Completed & Signed Off</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Schedule Maintenance */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Preventive / Corrective Maintenance"
        subtitle={`Planning maintenance task for ${currentCentre.name}`}
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Maintenance Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Windows OS Patching & Lockdown Test"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Maintenance Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white capitalize"
              >
                <option value="preventive">Preventive Servicing</option>
                <option value="corrective">Corrective Hardware Repair</option>
                <option value="upgrade">Software / OS Upgrade</option>
                <option value="inspection">Security & CCTV Inspection</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target System</label>
              <select
                value={newSystemId}
                onChange={(e) => setNewSystemId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              >
                <option value="">Centre-Wide (All Workstations)</option>
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} ({s.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Scheduled Date</label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Scope of Work</label>
            <textarea
              rows={3}
              required
              placeholder="Detail the procedural steps, reboot windows, and verification tests..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setScheduleModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg font-semibold cursor-pointer"
            >
              Schedule Maintenance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
