import React, { useEffect, useState } from 'react';
import {
  Building2,
  Check,
  Database,
  Layers,
  Plus,
  Shield,
  Sliders,
} from 'lucide-react';
import {
  ALL_GRANULAR_ACTIONS,
  ClusterMasterRecord,
  OfficialPostConfig,
  OrgHierarchyLevel,
  OrgHierarchyNode,
} from '../../types/models';
import {
  GovernanceAuditEntry,
  KOTA_MODULES_META,
  kotaOsHierarchyService,
} from '../../services/kotaOsHierarchyService';
import { useAuth } from '../auth/FirebaseAuthProvider';

export function GranularPermissionMatrixPanel() {
  const { userProfile } = useAuth();
  const [posts, setPosts] = useState<OfficialPostConfig[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string>('POST-CLUSTER-INC');
  const [, setTick] = useState(0);

  useEffect(() => {
    const sync = () => {
      setPosts([...kotaOsHierarchyService.getOfficialPosts()]);
      setTick((t) => t + 1);
    };
    sync();
    return kotaOsHierarchyService.subscribe(sync);
  }, []);

  const activePost = posts.find((p) => p.id === selectedPostId) || posts[0];

  if (!activePost) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Sliders size={18} className="text-[#1D4ED8]" />
            <span>Official Post &amp; 13-Action Granular Permission Matrix</span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Configure View, Create, Edit, Update, Assign, Reassign, Approve, Reject, Export, Import, Print, Delete, and Configure permissions per Official Post.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Select Official Post:</span>
          <select
            value={activePost.id}
            onChange={(e) => setSelectedPostId(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
          >
            {posts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.postTitle} (Rank {p.hierarchyRank} · {p.defaultRoleKey})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 flex flex-wrap gap-4">
        <span>
          <strong>Official Post:</strong> {activePost.postTitle}
        </span>
        <span>
          <strong>CRM Role Key:</strong> <span className="font-mono">{activePost.defaultRoleKey}</span>
        </span>
        <span>
          <strong>Default Workspace:</strong>{' '}
          <span className="font-mono text-[#1D4ED8]">{activePost.defaultWorkspacePath}</span>
        </span>
        <span>
          <strong>Cadre:</strong> {activePost.isPostalCadre ? 'Departmental Postal' : 'Divisional / Partner'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold">
              <th className="py-2.5 px-3 min-w-[190px]">Module</th>
              {ALL_GRANULAR_ACTIONS.map((act) => (
                <th key={act} className="py-2.5 px-2 text-center">
                  {act}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {KOTA_MODULES_META.map((mod) => {
              const rowPerms = activePost.defaultModuleMatrix[mod.key] || {};
              return (
                <tr key={mod.key} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{mod.label}</div>
                    <div className="text-[10px] text-slate-500">{mod.description}</div>
                  </td>
                  {ALL_GRANULAR_ACTIONS.map((act) => {
                    const enabled = Boolean(rowPerms[act]);
                    return (
                      <td key={act} className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            kotaOsHierarchyService.setPostModulePermission(
                              activePost.id,
                              mod.key,
                              act,
                              !enabled,
                              userProfile?.name || 'Master Admin'
                            )
                          }
                          className={`w-7 h-7 rounded border inline-flex items-center justify-center transition cursor-pointer ${
                            enabled
                              ? 'bg-[#1D4ED8] border-[#1D4ED8] text-white'
                              : 'bg-white border-slate-300 text-slate-300 hover:border-slate-400'
                          }`}
                          title={`${mod.label} · ${act}: ${enabled ? 'Allowed' : 'Denied'}`}
                        >
                          {enabled && <Check size={13} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function OrgHierarchyAndAuditPanel() {
  const { userProfile } = useAuth();
  const [nodes, setNodes] = useState<OrgHierarchyNode[]>([]);
  const [clusters, setClusters] = useState<ClusterMasterRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<GovernanceAuditEntry[]>([]);

  // Quick Add Org Node
  const [nodeLevel, setNodeLevel] = useState<OrgHierarchyLevel>('SUBDIVISION');
  const [nodeCode, setNodeCode] = useState('');
  const [nodeName, setNodeName] = useState('');
  const [nodePin, setNodePin] = useState('');
  const [nodeIncharge, setNodeIncharge] = useState('');

  // Quick Add Cluster
  const [clusterName, setClusterName] = useState('');
  const [clusterPins, setClusterPins] = useState('324009');
  const [clusterIncharge, setClusterIncharge] = useState('');

  useEffect(() => {
    const sync = () => {
      setNodes([...kotaOsHierarchyService.getOrgHierarchyNodes()]);
      setClusters([...kotaOsHierarchyService.getClusters()]);
      setAuditLogs([...kotaOsHierarchyService.getGovernanceAuditLogs()]);
    };
    sync();
    return kotaOsHierarchyService.subscribe(sync);
  }, []);

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeName.trim() || !nodeCode.trim()) return;
    kotaOsHierarchyService.upsertOrgNode(
      {
        code: nodeCode.trim().toUpperCase(),
        name: nodeName.trim(),
        level: nodeLevel,
        pincode: nodePin.trim() || undefined,
        inchargeName: nodeIncharge.trim() || undefined,
        status: 'ACTIVE',
      },
      userProfile?.name || 'Master Admin',
      userProfile?.role || 'MASTER_ADMIN'
    );
    setNodeCode('');
    setNodeName('');
    setNodePin('');
    setNodeIncharge('');
  };

  const handleAddCluster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clusterName.trim()) return;
    kotaOsHierarchyService.upsertCluster(
      {
        name: clusterName.trim(),
        division: 'Kota Division',
        inchargeName: clusterIncharge.trim() || undefined,
        officeIds: [],
        pincodes: clusterPins
          .split(',')
          .map((p) => p.trim())
          .filter((p) => /^\d{6}$/.test(p)),
        status: 'ACTIVE',
      },
      userProfile?.name || 'Master Admin'
    );
    setClusterName('');
    setClusterIncharge('');
  };

  return (
    <div className="space-y-5 text-xs">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Org Hierarchy Builder */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Layers size={16} className="text-[#1D4ED8]" />
            <span>Org Hierarchy Master (Circle &rarr; Region &rarr; Division &rarr; Subdivision &rarr; HPO &rarr; SO &rarr; BO)</span>
          </h3>
          <form onSubmit={handleAddNode} className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <select
              value={nodeLevel}
              onChange={(e) => setNodeLevel(e.target.value as OrgHierarchyLevel)}
              className="px-2.5 py-2 border border-slate-300 rounded-lg bg-white font-bold"
            >
              <option value="CIRCLE">CIRCLE</option>
              <option value="REGION">REGION</option>
              <option value="DIVISION">DIVISION</option>
              <option value="SUBDIVISION">SUBDIVISION</option>
              <option value="HPO">HPO</option>
              <option value="SO">SO</option>
              <option value="BO">BO</option>
            </select>
            <input
              type="text"
              required
              value={nodeCode}
              onChange={(e) => setNodeCode(e.target.value)}
              placeholder="Code (e.g. KOTA-SD-01)"
              className="px-2.5 py-2 border border-slate-300 rounded-lg font-mono"
            />
            <input
              type="text"
              required
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              placeholder="Unit / Office Name"
              className="col-span-2 px-2.5 py-2 border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              maxLength={6}
              value={nodePin}
              onChange={(e) => setNodePin(e.target.value.replace(/\D/g, ''))}
              placeholder="PIN (Optional)"
              className="px-2.5 py-2 border border-slate-300 rounded-lg font-mono"
            />
            <input
              type="text"
              value={nodeIncharge}
              onChange={(e) => setNodeIncharge(e.target.value)}
              placeholder="Incharge Name"
              className="px-2.5 py-2 border border-slate-300 rounded-lg"
            />
            <button
              type="submit"
              className="col-span-2 py-2 bg-[#0A1628] hover:bg-slate-800 text-white rounded-lg font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Add / Update Org Node
            </button>
          </form>

          <div className="max-h-64 overflow-y-auto space-y-1.5 custom-scrollbar">
            {nodes.map((n) => (
              <div key={n.id} className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-[#1D4ED8] mr-2">{n.level}</span>
                  <span className="font-bold text-slate-900">{n.name}</span>
                  <div className="text-[10px] text-slate-500">
                    Code: {n.code} {n.pincode ? `· PIN ${n.pincode}` : ''} {n.inchargeName ? `· Incharge: ${n.inchargeName}` : ''}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{n.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cluster Master Builder */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Building2 size={16} className="text-[#EA580C]" />
            <span>Cluster Master (Lead Boundary Enforcement)</span>
          </h3>
          <form onSubmit={handleAddCluster} className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <input
              type="text"
              required
              value={clusterName}
              onChange={(e) => setClusterName(e.target.value)}
              placeholder="Cluster Name (e.g. Kota Central Cluster)"
              className="col-span-2 px-2.5 py-2 border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              value={clusterIncharge}
              onChange={(e) => setClusterIncharge(e.target.value)}
              placeholder="Cluster Incharge Name"
              className="px-2.5 py-2 border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              value={clusterPins}
              onChange={(e) => setClusterPins(e.target.value)}
              placeholder="PINs comma-separated"
              className="px-2.5 py-2 border border-slate-300 rounded-lg font-mono"
            />
            <button
              type="submit"
              className="col-span-2 py-2 bg-[#EA580C] hover:bg-orange-700 text-white rounded-lg font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Save Cluster Boundary
            </button>
          </form>

          <div className="max-h-64 overflow-y-auto space-y-1.5 custom-scrollbar">
            {clusters.map((c) => (
              <div key={c.id} className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{c.name}</div>
                  <div className="text-[10px] text-slate-500">
                    ID: <span className="font-mono">{c.id}</span> · PINs: {c.pincodes.join(', ') || 'Configurable'}
                    {c.inchargeName ? ` · Incharge: ${c.inchargeName}` : ''}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700">{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Immutable Governance Audit Trail */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
          <Database size={16} className="text-slate-700" />
          <span>Immutable Governance &amp; Lead Reassignment Audit Trail ({auditLogs.length})</span>
        </h3>
        <div className="max-h-64 overflow-y-auto overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                <th className="py-2 pr-3">Timestamp</th>
                <th className="py-2 pr-3">Actor</th>
                <th className="py-2 pr-3">Action</th>
                <th className="py-2 pr-3">Target</th>
                <th className="py-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No governance changes logged yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2 pr-3 font-mono text-[11px] tabular-nums">
                      {log.timestamp.slice(0, 19).replace('T', ' ')}
                    </td>
                    <td className="py-2 pr-3 font-bold">
                      {log.performedBy} ({log.actorRole})
                    </td>
                    <td className="py-2 pr-3 font-mono text-[#1D4ED8]">{log.action}</td>
                    <td className="py-2 pr-3">{log.target}</td>
                    <td className="py-2 text-slate-600">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
