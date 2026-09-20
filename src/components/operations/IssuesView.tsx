import React, { useState } from 'react';
import {
  AlertCircle,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  User,
  MessageSquare,
  ChevronRight,
  LayoutGrid,
  List,
  Wrench,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Issue, IssueStatus, IssuePriority } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';

export const IssuesView: React.FC = () => {
  const { issues, systems, navigate, currentCentre, currentUser, createIssue, updateIssueStatus, addIssueComment } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedIssueForDetail, setSelectedIssueForDetail] = useState<Issue | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // New Issue Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSystemId, setNewSystemId] = useState('W001');
  const [newPriority, setNewPriority] = useState<IssuePriority>('high');
  const [newType, setNewType] = useState<any>('hardware');

  const filteredIssues = issues.filter((i) => {
    const matchesSearch =
      i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.systemId && i.systemId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = priorityFilter === 'all' || i.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || i.type === typeFilter;

    return matchesSearch && matchesPriority && matchesType;
  });

  const columns: { status: IssueStatus; label: string; bg: string }[] = [
    { status: 'open', label: 'Open Incidents', bg: 'bg-blue-50/60' },
    { status: 'in_progress', label: 'In Progress / Assigned', bg: 'bg-amber-50/60' },
    { status: 'resolved', label: 'Resolved / Testing', bg: 'bg-emerald-50/60' },
    { status: 'closed', label: 'Closed Archive', bg: 'bg-slate-50/60' }
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createIssue({
      title: newTitle,
      description: newDesc,
      type: newType,
      priority: newPriority,
      status: 'open',
      systemId: newSystemId,
      systemName: systems.find((s) => s.id === newSystemId)?.name,
      reportedBy: currentUser.name
    });
    setCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIssueForDetail && newCommentText.trim()) {
      addIssueComment(selectedIssueForDetail.id, currentUser.name, newCommentText.trim());
      setNewCommentText('');
      // refresh local copy
      const updated = issues.find((i) => i.id === selectedIssueForDetail.id);
      if (updated) setSelectedIssueForDetail(updated);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Issues & Incident Management</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-700">
              {issues.filter((i) => i.status === 'open' || i.status === 'in_progress').length} Active Tickets
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track hardware faults, exam client issues, network drops, and peripheral replacements for {currentCentre.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="all">All Categories</option>
            <option value="hardware">Hardware Fault</option>
            <option value="software">Software / OS</option>
            <option value="exam_app">Exam Delivery Engine</option>
            <option value="network">Network & Switch</option>
            <option value="peripheral">Peripherals</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search tickets, W005, error..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-52 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 transition-colors ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-2xs' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Kanban Board"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-2xs' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colIssues = filteredIssues.filter((i) => i.status === col.status);

            const laneBgDark =
              col.status === 'open'
                ? 'dark:bg-blue-950/20'
                : col.status === 'in_progress'
                ? 'dark:bg-amber-950/20'
                : col.status === 'resolved'
                ? 'dark:bg-emerald-950/20'
                : 'dark:bg-slate-900/60';

            return (
              <div key={col.status} className={`p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 ${col.bg} ${laneBgDark} flex flex-col`}>
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide uppercase">{col.label}</span>
                  <span className="text-xs font-mono font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                    {colIssues.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                  {colIssues.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                      No tickets in this lane
                    </div>
                  ) : (
                    colIssues.map((issue) => (
                      <div
                        key={issue.id}
                        onClick={() => setSelectedIssueForDetail(issue)}
                        className="p-3.5 bg-white dark:bg-slate-850 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md cursor-pointer transition-all space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400">
                              {issue.id}
                            </span>
                            {issue.systemId && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-mono font-bold">
                                {issue.systemId}
                              </span>
                            )}
                          </div>
                          <StatusBadge status={issue.priority} size="sm" />
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                          {issue.title}
                        </h4>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{issue.description}</p>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                          <span>By: {issue.reportedBy}</span>
                          <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                            <MessageSquare className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                            <span>{issue.comments?.length || 1}</span>
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">System / Booth</th>
                  <th className="px-4 py-3">Title & Summary</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Reported</th>
                  <th className="px-4 py-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => setSelectedIssueForDetail(issue)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{issue.id}</td>
                    <td className="px-4 py-3 font-mono text-emerald-800 dark:text-emerald-400 font-bold">
                      {issue.systemId || 'Centre-Wide'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{issue.title}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 capitalize">{issue.type.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={issue.priority} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{issue.assignedTo || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-500 text-[11px]">{issue.reportedAt}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 font-bold">Inspect →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Report Incident */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Report New Incident / Hardware Fault"
        subtitle="Log operational disruption for immediate technician response"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Affected Workstation</label>
              <select
                value={newSystemId}
                onChange={(e) => setNewSystemId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
              >
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} ({s.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Severity Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-rose-700 dark:text-rose-400 font-bold"
              >
                <option value="critical">Critical (Blocking Candidate Delivery)</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Incident Category</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="hardware">Hardware Fault</option>
                <option value="software">Operating System / Software</option>
                <option value="exam_app">Exam Delivery Engine</option>
                <option value="network">Network & Switch</option>
                <option value="peripheral">Peripheral (Keyboard/Mouse/Headset)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reported By</label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Summary Title</label>
            <input
              type="text"
              required
              placeholder="e.g. SSD disk I/O warning on Pearson VUE launch"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Symptoms & Diagnostics</label>
            <textarea
              rows={3}
              required
              placeholder="Describe what occurred, error dialog codes, and steps taken..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-700 text-white rounded-lg font-semibold"
            >
              Log Incident Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Ticket Detail & Conversation Thread */}
      {selectedIssueForDetail && (
        <Modal
          isOpen={!!selectedIssueForDetail}
          onClose={() => setSelectedIssueForDetail(null)}
          title={`Ticket ${selectedIssueForDetail.id}: ${selectedIssueForDetail.title}`}
          subtitle={`Reported on ${selectedIssueForDetail.reportedAt} by ${selectedIssueForDetail.reportedBy}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Status & Priority Ribbon */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 dark:text-slate-400 text-[11px]">Status:</span>
                  <StatusBadge status={selectedIssueForDetail.status} size="sm" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 dark:text-slate-400 text-[11px]">Priority:</span>
                  <StatusBadge status={selectedIssueForDetail.priority} size="sm" />
                </div>
                {selectedIssueForDetail.systemId && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 dark:text-slate-400 text-[11px]">Workstation:</span>
                    <button
                      onClick={() => {
                        navigate('system-detail', selectedIssueForDetail.systemId);
                        setSelectedIssueForDetail(null);
                      }}
                      className="font-mono font-bold text-emerald-800 dark:text-emerald-400 hover:underline"
                    >
                      {selectedIssueForDetail.systemId}
                    </button>
                  </div>
                )}
              </div>

              {/* Status change actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    updateIssueStatus(selectedIssueForDetail.id, 'in_progress', currentUser.name);
                    setSelectedIssueForDetail({
                      ...selectedIssueForDetail,
                      status: 'in_progress',
                      assignedTo: currentUser.name
                    });
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 rounded border border-amber-300 dark:border-amber-700"
                >
                  Take Ticket
                </button>
                <button
                  onClick={() => {
                    updateIssueStatus(selectedIssueForDetail.id, 'resolved');
                    setSelectedIssueForDetail({ ...selectedIssueForDetail, status: 'resolved' });
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-300 dark:border-emerald-700"
                >
                  Mark Resolved
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Incident Description
              </span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{selectedIssueForDetail.description}</p>
            </div>

            {/* Comment Thread */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Technician Activity & Updates
              </span>

              <div className="space-y-2.5 max-h-52 overflow-y-auto">
                {selectedIssueForDetail.comments && selectedIssueForDetail.comments.length > 0 ? (
                  selectedIssueForDetail.comments.map((c) => (
                    <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">{c.author}</span>
                        <span className="text-slate-400 dark:text-slate-500 font-mono">{c.timestamp}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{c.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 text-center py-2">No comments yet</p>
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add technician update or resolution note..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-emerald-700"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
