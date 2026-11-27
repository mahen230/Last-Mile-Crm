import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ExternalLink, Plus, Search, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { xpeedoOpsService } from '../../services/xpeedoOpsService';
import { ClientModuleScope, WorkspaceClient, WorkspaceClientStatus } from '../../types/xpeedoOps';

export default function ClientsDirectoryView() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | ClientModuleScope>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create/Edit Client Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [industry, setIndustry] = useState('');
  const [accountManager, setAccountManager] = useState(userProfile?.name || 'Mahendra Kumar Meena');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [city, setCity] = useState('Kota');
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => xpeedoOpsService.subscribe(() => setTick((t) => t + 1)), []);

  const canManageClients = xpeedoOpsService.canPerform(userProfile, 'manageClients');
  const canToggleModules = xpeedoOpsService.canPerform(userProfile, 'toggleFutureModules');
  const role = xpeedoOpsService.resolvePlatformRole(userProfile);
  const clients = xpeedoOpsService.getClients(userProfile);

  const filtered = clients.filter((c) => {
    if (scopeFilter !== 'ALL' && c.moduleScope !== scopeFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.accountManager.toLowerCase().includes(q)
    );
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const cleanWorkspaceKey = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_');
    const created = xpeedoOpsService.upsertClient(
      {
        code: code.trim() || `${cleanWorkspaceKey.slice(0, 6)}-${clients.length + 1}`,
        name: name.trim(),
        workspaceKey: cleanWorkspaceKey,
        industry: industry.trim() || 'Operations & Services',
        status: 'Basic Profile Only' as WorkspaceClientStatus,
        moduleScope: 'BASIC_PROFILE_ONLY',
        futureModuleEnabled: false,
        accountManager: accountManager.trim() || 'Mahendra Kumar Meena',
        contactName: contactName.trim() || `${name.trim()} Contact`,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        city: city.trim() || 'Kota',
        regionLabel: 'Rajasthan',
        notes: notes.trim() || 'Client listing & basic profile created.',
      },
      userProfile?.name || 'Admin',
      role
    );
    setShowCreateModal(false);
    setName('');
    setCode('');
    setIndustry('');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setNotes('');
    setNotice(`Client "${created.name}" registered with isolated workspace ${created.workspaceKey}.`);
    setTimeout(() => setNotice(null), 5000);
  };

  return (
    <div className="space-y-6" id="clients-directory-view">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-semibold text-blue-600 uppercase">
            Client Operations Directory
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Client Listing &amp; Workspace Governance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            India Post (Full Postal Management System) and Bulk Customer / Division Operations Workspaces.
          </p>
        </div>

        {canManageClients && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <Plus size={15} />
            <span>Register New Client</span>
          </button>
        )}
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-xs font-medium flex items-center justify-between">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="text-emerald-700 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search & Scope Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client name, code, industry, or account manager..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(
            [
              { key: 'ALL', label: 'All Clients' },
              { key: 'FULL_INDIA_POST', label: 'India Post Full System' },
              { key: 'EV_WORK_MGMT', label: 'Division Operations Mgmt' },
              { key: 'BASIC_PROFILE_ONLY', label: 'Basic Profile Only' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setScopeFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                scopeFilter === tab.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Client Listing Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Client &amp; Code</th>
                <th className="py-3 px-4">Industry / Vertical</th>
                <th className="py-3 px-4">Module Scope</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Account Manager</th>
                <th className="py-3 px-4 text-right">Projects</th>
                <th className="py-3 px-4 text-right">Open Tasks</th>
                <th className="py-3 px-4">Future Readiness</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((client: WorkspaceClient) => {
                const clientProjects = xpeedoOpsService.getProjects('ALL', client.id);
                const clientTasks = xpeedoOpsService.getTasks('ALL', client.id);
                const openTasks = clientTasks.filter(
                  (t) => t.status !== 'Completed' && t.status !== 'Cancelled'
                ).length;

                return (
                  <tr key={client.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/clients/${client.id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 block"
                      >
                        {client.name}
                      </Link>
                      <span className="font-mono text-[11px] text-slate-500">
                        {client.code} · {client.workspaceKey}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{client.industry}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">
                        {client.moduleScope === 'FULL_INDIA_POST'
                          ? 'Full Postal Management'
                          : client.moduleScope === 'EV_WORK_MGMT'
                          ? 'Work Management System'
                          : 'Listing & Basic Profile Only'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          client.status === 'Active System'
                            ? 'text-emerald-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{client.accountManager}</td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {clientProjects.length}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {openTasks}
                    </td>
                    <td className="py-3.5 px-4">
                      {client.moduleScope === 'BASIC_PROFILE_ONLY' ? (
                        <button
                          type="button"
                          disabled={!canToggleModules}
                          onClick={() =>
                            xpeedoOpsService.toggleClientFutureModule(
                              client.id,
                              !client.futureModuleEnabled,
                              userProfile?.name || 'Owner',
                              role
                            )
                          }
                          className={`text-xs font-medium px-2.5 py-1 rounded border transition cursor-pointer disabled:opacity-50 ${
                            client.futureModuleEnabled
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Mark client readiness for future module activation"
                        >
                          <SlidersHorizontal size={11} className="inline mr-1" />
                          {client.futureModuleEnabled ? 'Future Flag: On' : 'Future Flag: Off'}
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <ShieldCheck size={13} /> Active Module
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold cursor-pointer"
                      >
                        10-Tab Profile
                      </button>
                      {client.workspaceKey === 'INDIA_POST' && (
                        <Link
                          to="/india-post"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-700 hover:bg-red-800 text-white text-[11px] font-semibold"
                        >
                          <span>Workspace</span>
                          <ExternalLink size={11} />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <Building2 size={18} className="text-blue-600" />
                <span>Register New Client Profile</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client Name *</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Apex Logistics"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client Code</label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Auto-generated if blank"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Industry / Vertical</label>
                  <input
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Retail & Logistics"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Manager</label>
                  <input
                    value={accountManager}
                    onChange={(e) => setAccountManager(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Name</label>
                  <input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Profile Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer"
                >
                  Save Client Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
