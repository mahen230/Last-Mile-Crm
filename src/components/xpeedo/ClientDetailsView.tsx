import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Download,
  ExternalLink,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { exportCsvWithBom, xpeedoOpsService } from '../../services/xpeedoOpsService';
import { staffPermissionService } from '../../services/staffPermissionService';
import ProjectsAndTasksView from './ProjectsAndTasksView';
import {
  ClientCommunicationEntry,
  ClientDeliverableEntry,
  ClientRequirementEntry,
  OpsDocumentEntry,
} from '../../types/xpeedoOps';

type ClientDetailTab =
  | 'OVERVIEW'
  | 'PROJECTS'
  | 'TASKS'
  | 'EMPLOYEES'
  | 'DOCUMENTS'
  | 'COMMUNICATION'
  | 'REQUIREMENTS'
  | 'DELIVERABLES'
  | 'REPORTS'
  | 'ACTIVITY';

const TABS: Array<{ key: ClientDetailTab; label: string }> = [
  { key: 'OVERVIEW', label: 'Overview' },
  { key: 'PROJECTS', label: 'Projects' },
  { key: 'TASKS', label: 'Tasks' },
  { key: 'EMPLOYEES', label: 'Employees' },
  { key: 'DOCUMENTS', label: 'Documents' },
  { key: 'COMMUNICATION', label: 'Communication' },
  { key: 'REQUIREMENTS', label: 'Requirements' },
  { key: 'DELIVERABLES', label: 'Deliverables' },
  { key: 'REPORTS', label: 'Reports' },
  { key: 'ACTIVITY', label: 'Activity History' },
];

export default function ClientDetailsView() {
  const { clientId } = useParams<{ clientId: string }>();
  const { userProfile } = useAuth();
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<ClientDetailTab>('OVERVIEW');

  // Inline creation drafts for sub-tabs
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<OpsDocumentEntry['category']>('MoU / Contract');
  const [docVersion, setDocVersion] = useState('v1.0');

  const [commChannel, setCommChannel] = useState<ClientCommunicationEntry['channel']>('Meeting');
  const [commSubject, setCommSubject] = useState('');
  const [commSummary, setCommSummary] = useState('');

  const [reqTitle, setReqTitle] = useState('');
  const [reqArea, setReqArea] = useState('Core Operations');
  const [reqPriority, setReqPriority] = useState<ClientRequirementEntry['priority']>('High');
  const [reqCriteria, setReqCriteria] = useState('');

  const [delivTitle, setDelivTitle] = useState('');
  const [delivDue, setDelivDue] = useState(() => new Date().toISOString().split('T')[0]);
  const [delivOwner, setDelivOwner] = useState(userProfile?.name || 'Mahendra Kumar Meena');

  useEffect(() => xpeedoOpsService.subscribe(() => setTick((t) => t + 1)), []);

  const role = xpeedoOpsService.resolvePlatformRole(userProfile);
  const client = clientId ? xpeedoOpsService.getClientById(clientId) : undefined;

  if (!client) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
        <div className="text-base font-bold text-slate-900">Client Not Found</div>
        <Link to="/clients" className="text-xs font-semibold text-blue-600 hover:underline">
          ← Back to Client Directory
        </Link>
      </div>
    );
  }

  const projects = xpeedoOpsService.getProjects(client.workspaceKey, client.id);
  const tasks = xpeedoOpsService.getTasks(client.workspaceKey, client.id);
  const docs = xpeedoOpsService.getDocuments(client.workspaceKey, client.id);
  const comms = xpeedoOpsService.getClientCommunications(client.id);
  const requirements = xpeedoOpsService.getClientRequirements(client.id);
  const deliverables = xpeedoOpsService.getClientDeliverables(client.id);
  const activity = xpeedoOpsService.getActivityLogs(client.workspaceKey, client.id);
  const staff = staffPermissionService.getAllStaffProfiles().filter((s) => {
    if (client.workspaceKey === 'INDIA_POST') {
      return (s.brandId || 'india-post') === 'india-post' || s.vendorScope?.assignedVendorId === 'INDIA_POST';
    }
    if (client.workspaceKey === 'XPEEDO_EV') {
      return (s.brandId || '').toUpperCase().includes('EV') || s.vendorScope?.assignedVendorId === 'EV_MOBILITY';
    }
    return false;
  });

  const isBasicOnly = client.moduleScope === 'BASIC_PROFILE_ONLY';

  return (
    <div className="space-y-6" id="client-details-view">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              to="/clients"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft size={13} />
              <span>All Clients</span>
            </Link>
            <div className="flex items-center gap-3">
              <Building2 size={22} className="text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">{client.name}</h1>
                <div className="text-xs text-slate-500 font-mono">
                  {client.code} · {client.workspaceKey} · {client.industry} · {client.status}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {client.workspaceKey === 'INDIA_POST' && (
              <Link
                to="/india-post"
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Open India Post Management System</span>
                <ExternalLink size={13} />
              </Link>
            )}
            {client.workspaceKey === 'XPEEDO_EV' && (
              <Link
                to="/xpeedo-ev"
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Open Xpeedo EV Work Management</span>
                <ExternalLink size={13} />
              </Link>
            )}
            {isBasicOnly && (
              <button
                type="button"
                onClick={() =>
                  xpeedoOpsService.toggleClientFutureModule(
                    client.id,
                    !client.futureModuleEnabled,
                    userProfile?.name || 'Owner',
                    role
                  )
                }
                className="px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold cursor-pointer"
              >
                Future Module Readiness: {client.futureModuleEnabled ? 'Enabled' : 'Disabled'}
              </button>
            )}
          </div>
        </div>

        {/* 10 Tabs Navigation */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === t.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Client Profile &amp; Governance Summary</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{client.notes}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <div className="text-slate-500">Account Manager</div>
                <div className="font-semibold text-slate-900 mt-0.5">{client.accountManager}</div>
              </div>
              <div>
                <div className="text-slate-500">Primary Contact</div>
                <div className="font-semibold text-slate-900 mt-0.5">{client.contactName}</div>
              </div>
              <div>
                <div className="text-slate-500">Contact Email</div>
                <div className="font-mono text-slate-800 mt-0.5">{client.contactEmail || '—'}</div>
              </div>
              <div>
                <div className="text-slate-500">City / Region</div>
                <div className="font-semibold text-slate-900 mt-0.5">
                  {client.city} · {client.regionLabel}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Module Scope</div>
                <div className="font-semibold text-blue-700 mt-0.5">{client.moduleScope}</div>
              </div>
              <div>
                <div className="text-slate-500">Last Updated</div>
                <div className="font-mono text-slate-700 mt-0.5 tabular-nums">
                  {new Date(client.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <ShieldCheck size={16} className="text-blue-600" />
              <span>Workspace Metrics</span>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Projects</span>
                <span className="font-mono font-bold tabular-nums">{projects.length}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Tasks</span>
                <span className="font-mono font-bold tabular-nums">{tasks.length}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Documents</span>
                <span className="font-mono font-bold tabular-nums">{docs.length}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Requirements</span>
                <span className="font-mono font-bold tabular-nums">{requirements.length}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Deliverables</span>
                <span className="font-mono font-bold tabular-nums">{deliverables.length}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Audit Events</span>
                <span className="font-mono font-bold tabular-nums">{activity.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 & 3: PROJECTS & TASKS */}
      {activeTab === 'PROJECTS' && (
        <ProjectsAndTasksView
          mode="PROJECTS"
          lockedClientId={client.id}
          lockedWorkspaceId={client.workspaceKey}
        />
      )}
      {activeTab === 'TASKS' && (
        <ProjectsAndTasksView
          mode="TASKS"
          lockedClientId={client.id}
          lockedWorkspaceId={client.workspaceKey}
        />
      )}

      {/* TAB 4: EMPLOYEES */}
      {activeTab === 'EMPLOYEES' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Assigned Workforce ({staff.length})
            </h2>
            <Link to="/employees" className="text-xs font-semibold text-blue-600 hover:underline">
              Open Full Employee Directory
            </Link>
          </div>
          {staff.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              No employees currently assigned to {client.name}.
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Employee ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Designation / Role</th>
                    <th className="py-2.5 px-3">Office / Unit</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff.slice(0, 50).map((s) => (
                    <tr key={s.id}>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{s.employeeId || s.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{s.name}</td>
                      <td className="py-2.5 px-3 text-slate-700">{s.designationType || s.role}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.assignedOffice}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-medium">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DOCUMENTS */}
      {activeTab === 'DOCUMENTS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!docTitle.trim()) return;
              xpeedoOpsService.addDocument(
                {
                  clientId: client.id,
                  workspaceId: client.workspaceKey,
                  title: docTitle.trim(),
                  category: docCategory,
                  version: docVersion.trim() || 'v1.0',
                  uploadedBy: userProfile?.name || 'Admin',
                  status: 'Active',
                },
                userProfile?.name || 'Admin',
                role
              );
              setDocTitle('');
            }}
            className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200"
          >
            <input
              required
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Document title (e.g., SLA Agreement)"
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value as OpsDocumentEntry['category'])}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="MoU / Contract">MoU / Contract</option>
              <option value="SOP / Playbook">SOP / Playbook</option>
              <option value="Technical Spec">Technical Spec</option>
              <option value="Statutory Record">Statutory Record</option>
              <option value="Report">Report</option>
            </select>
            <input
              value={docVersion}
              onChange={(e) => setDocVersion(e.target.value)}
              placeholder="Version"
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Register Document</span>
            </button>
          </form>
          <div className="divide-y divide-slate-100 text-xs">
            {docs.length === 0 ? (
              <div className="py-6 text-center text-slate-500">No documents logged for {client.name}.</div>
            ) : (
              docs.map((d) => (
                <div key={d.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{d.title}</div>
                    <div className="text-slate-500 font-mono">
                      {d.category} · {d.version} · By {d.uploadedBy}
                    </div>
                  </div>
                  <span className="font-medium text-emerald-700">{d.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: COMMUNICATION */}
      {activeTab === 'COMMUNICATION' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!commSubject.trim()) return;
              xpeedoOpsService.addClientCommunication(
                {
                  clientId: client.id,
                  workspaceId: client.workspaceKey,
                  channel: commChannel,
                  subject: commSubject.trim(),
                  summary: commSummary.trim() || commSubject.trim(),
                  participants: client.contactName,
                  loggedBy: userProfile?.name || 'Admin',
                },
                userProfile?.name || 'Admin',
                role
              );
              setCommSubject('');
              setCommSummary('');
            }}
            className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200"
          >
            <select
              value={commChannel}
              onChange={(e) => setCommChannel(e.target.value as ClientCommunicationEntry['channel'])}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="Meeting">Meeting</option>
              <option value="Phone Call">Phone Call</option>
              <option value="Email">Email</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="System Note">System Note</option>
            </select>
            <input
              required
              value={commSubject}
              onChange={(e) => setCommSubject(e.target.value)}
              placeholder="Communication subject"
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
            <input
              value={commSummary}
              onChange={(e) => setCommSummary(e.target.value)}
              placeholder="Key summary / outcome"
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer"
            >
              Log Communication
            </button>
          </form>
          <div className="divide-y divide-slate-100 text-xs">
            {comms.length === 0 ? (
              <div className="py-6 text-center text-slate-500">No communication records yet.</div>
            ) : (
              comms.map((c) => (
                <div key={c.id} className="py-3 space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>
                      [{c.channel}] {c.subject}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {new Date(c.occurredAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-600">{c.summary}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: REQUIREMENTS */}
      {activeTab === 'REQUIREMENTS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!reqTitle.trim()) return;
              xpeedoOpsService.addClientRequirement(
                {
                  clientId: client.id,
                  workspaceId: client.workspaceKey,
                  title: reqTitle.trim(),
                  moduleArea: reqArea.trim(),
                  priority: reqPriority,
                  status: 'In Review',
                  ownerName: userProfile?.name || 'Admin',
                  acceptanceCriteria: reqCriteria.trim() || 'Verified against workspace scope',
                },
                userProfile?.name || 'Admin',
                role
              );
              setReqTitle('');
              setReqCriteria('');
            }}
            className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200"
          >
            <input
              required
              value={reqTitle}
              onChange={(e) => setReqTitle(e.target.value)}
              placeholder="Requirement title"
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
            <input
              value={reqArea}
              onChange={(e) => setReqArea(e.target.value)}
              placeholder="Module area"
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
            <select
              value={reqPriority}
              onChange={(e) => setReqPriority(e.target.value as ClientRequirementEntry['priority'])}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <input
              value={reqCriteria}
              onChange={(e) => setReqCriteria(e.target.value)}
              placeholder="Acceptance criteria"
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer"
            >
              Add Requirement
            </button>
          </form>
          <div className="divide-y divide-slate-100 text-xs">
            {requirements.length === 0 ? (
              <div className="py-6 text-center text-slate-500">No requirements captured yet.</div>
            ) : (
              requirements.map((r) => (
                <div key={r.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900">
                      {r.title} · <span className="text-blue-600">{r.priority}</span>
                    </div>
                    <div className="text-slate-500">
                      {r.moduleArea} · {r.acceptanceCriteria}
                    </div>
                  </div>
                  <select
                    value={r.status}
                    onChange={(e) =>
                      xpeedoOpsService.updateClientRequirementStatus(
                        r.id,
                        e.target.value as ClientRequirementEntry['status'],
                        userProfile?.name || 'Admin',
                        role
                      )
                    }
                    className="px-2.5 py-1 border border-slate-200 rounded-md bg-white font-semibold"
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Review">In Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Implemented">Implemented</option>
                  </select>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 8: DELIVERABLES */}
      {activeTab === 'DELIVERABLES' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!delivTitle.trim()) return;
              xpeedoOpsService.addClientDeliverable(
                {
                  clientId: client.id,
                  workspaceId: client.workspaceKey,
                  title: delivTitle.trim(),
                  dueDate: delivDue,
                  ownerName: delivOwner.trim(),
                  status: 'Pending',
                },
                userProfile?.name || 'Admin',
                role
              );
              setDelivTitle('');
            }}
            className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200"
          >
            <input
              required
              value={delivTitle}
              onChange={(e) => setDelivTitle(e.target.value)}
              placeholder="Deliverable title"
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
            <input
              type="date"
              value={delivDue}
              onChange={(e) => setDelivDue(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
            <input
              value={delivOwner}
              onChange={(e) => setDelivOwner(e.target.value)}
              placeholder="Owner"
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer"
            >
              Add Deliverable
            </button>
          </form>
          <div className="divide-y divide-slate-100 text-xs">
            {deliverables.length === 0 ? (
              <div className="py-6 text-center text-slate-500">No deliverables scheduled yet.</div>
            ) : (
              deliverables.map((d) => (
                <div key={d.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900">{d.title}</div>
                    <div className="text-slate-500 font-mono">
                      Due {d.dueDate} · Owner: {d.ownerName}
                    </div>
                  </div>
                  <select
                    value={d.status}
                    onChange={(e) =>
                      xpeedoOpsService.updateDeliverableStatus(
                        d.id,
                        e.target.value as ClientDeliverableEntry['status'],
                        userProfile?.name || 'Admin',
                        role
                      )
                    }
                    className="px-2.5 py-1 border border-slate-200 rounded-md bg-white font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Client Approved">Client Approved</option>
                    <option value="Revision Requested">Revision Requested</option>
                  </select>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 9: REPORTS */}
      {activeTab === 'REPORTS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Client Operational Summary Report</h2>
              <p className="text-xs text-slate-500">
                Export live workspace metrics with UTF-8 BOM encoding for Excel compatibility.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                exportCsvWithBom(
                  `${client.workspaceKey}_summary_report`,
                  ['Client', 'Workspace', 'Projects', 'Tasks', 'Completed Tasks', 'Requirements', 'Deliverables'],
                  [
                    [
                      client.name,
                      client.workspaceKey,
                      projects.length,
                      tasks.length,
                      tasks.filter((t) => t.status === 'Completed').length,
                      requirements.length,
                      deliverables.length,
                    ],
                  ]
                )
              }
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              <span>Export CSV (UTF-8 BOM)</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-slate-500">Total Projects</div>
              <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{projects.length}</div>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-slate-500">Total Tasks</div>
              <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{tasks.length}</div>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-slate-500">Approved Deliverables</div>
              <div className="text-xl font-bold text-emerald-700 tabular-nums mt-1">
                {deliverables.filter((d) => d.status === 'Client Approved').length}
              </div>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-slate-500">Activity Events</div>
              <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{activity.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: ACTIVITY HISTORY */}
      {activeTab === 'ACTIVITY' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Client Activity History ({activity.length})</h2>
          {activity.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">No activity recorded for {client.name} yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {activity.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900">{log.action}</span>{' '}
                    <span className="text-slate-600">— {log.summary}</span>
                    <div className="text-[11px] font-mono text-slate-400">
                      {log.actor} ({log.actorRole}) · {log.entityType} {log.entityId}
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
