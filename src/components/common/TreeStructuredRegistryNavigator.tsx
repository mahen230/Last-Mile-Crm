import React, { useState } from 'react';
import { 
  Folder, FolderOpen, ChevronRight, ChevronDown, Database, Search, Users, 
  Building2, Home, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Layers, MapPin 
} from 'lucide-react';

interface TreeNodeItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
  description?: string;
  actionKey?: string;
}

interface TreeNodeCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: TreeNodeItem[];
}

interface TreeStructuredRegistryNavigatorProps {
  brandId?: string;
  brandName?: string;
  onSelectNode: (actionKey: string) => void;
  selectedActionKey?: string;
}

const TREE_CATEGORIES: TreeNodeCategory[] = [
  {
    id: 'central-directory',
    label: 'Central Directory & Entities',
    icon: Folder,
    children: [
      { id: 'dir-staff', label: 'Staff Registry & Profiles', icon: Users, description: 'Unified staff profiles, beats, and permissions', actionKey: 'STAFF_REGISTRY' },
      { id: 'dir-customers', label: 'Customers & Citizens CRM', icon: Users, description: 'PAN-aligned citizen ledger and lead records', actionKey: 'CUSTOMERS_CRM' },
      { id: 'dir-properties', label: 'Properties & Geo Hub', icon: Home, description: 'Household register, sequence tags, and PIN maps', actionKey: 'PROPERTIES_REGISTRY' },
      { id: 'dir-offices', label: 'Offices & Stores Master', icon: Building2, description: 'HPO, SO, BO, and retail storefront nodes', actionKey: 'OFFICES_MASTER' },
    ],
  },
  {
    id: 'status-metrics',
    label: 'Status & Operational Health',
    icon: Layers,
    children: [
      { id: 'status-health', label: 'System & Database Health', icon: ShieldCheck, description: 'Backup sync, audit trails, and reconciliation logs', actionKey: 'SYSTEM_HEALTH' },
      { id: 'status-beats', label: 'Beat & Territory Coverage', icon: MapPin, description: 'Allotted beat assignments and delivery jurisdiction', actionKey: 'BEAT_COVERAGE' },
      { id: 'status-approvals', label: 'Pending Approvals & Regs', icon: CheckCircle2, description: 'New staff registration requests and role promotions', actionKey: 'PENDING_APPROVALS' },
    ],
  },
  {
    id: 'master-databases',
    label: 'Master Databases (Single Source of Truth)',
    icon: Database,
    children: [
      { id: 'db-props', label: 'Properties Master Database', icon: Database, description: 'Normalized property ledger across all beats', actionKey: 'MASTER_PROPERTIES_DB' },
      { id: 'db-cust', label: 'Customers Master Database', icon: Database, description: 'Citizen CRM and scheme enrolment database', actionKey: 'MASTER_CUSTOMERS_DB' },
      { id: 'db-rbac', label: 'RBAC & Permissions Matrix', icon: ShieldCheck, description: 'Role-based access control and module rules', actionKey: 'RBAC_MATRIX' },
    ],
  },
  {
    id: 'search-console',
    label: 'Search Console & Duplicate Gate',
    icon: Search,
    children: [
      { id: 'search-dup', label: 'Duplicate / Already-Exists Detection', icon: AlertTriangle, description: 'Live similarity check and remark requirement', actionKey: 'SEARCH_CONSOLE_DUP' },
      { id: 'search-3layer', label: '3-Layer Verification Audit', icon: CheckCircle2, description: 'Staff attribution, geo-tagging, and master commit', actionKey: 'SEARCH_CONSOLE_3LAYER' },
    ],
  },
];

export const TreeStructuredRegistryNavigator: React.FC<TreeStructuredRegistryNavigatorProps> = ({
  brandName = 'India Post',
  onSelectNode,
  selectedActionKey,
}) => {
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    'central-directory': true,
    'status-metrics': true,
    'master-databases': true,
    'search-console': true,
  });

  const toggleCategory = (catId: string) => {
    setExpandedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Database size={18} className="text-amber-400" />
          <div>
            <div className="font-black text-sm">{brandName} — Tree Registry</div>
            <div className="text-[11px] text-slate-300">Hierarchical Central Data Explorer</div>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2 text-xs">
        {TREE_CATEGORIES.map((cat) => {
          const isExpanded = expandedCats[cat.id];
          const CatIcon = cat.icon;
          return (
            <div key={cat.id} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="w-full p-2.5 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <FolderOpen size={15} className="text-red-600" /> : <Folder size={15} className="text-slate-500" />}
                  <span>{cat.label}</span>
                </div>
                {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
              </button>

              {isExpanded && (
                <div className="p-2 pt-0 space-y-1 bg-white border-t border-slate-100">
                  {cat.children.map((item) => {
                    const ItemIcon = item.icon;
                    const isSelected = selectedActionKey === item.actionKey;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectNode(item.actionKey)}
                        className={`w-full text-left p-2 rounded-xl transition flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-red-50 border border-red-200 text-red-900 font-bold'
                            : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                        }`}
                      >
                        <ItemIcon size={14} className={`mt-0.5 shrink-0 ${isSelected ? 'text-red-600' : 'text-slate-500'}`} />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold leading-tight">{item.label}</div>
                          {item.description && (
                            <div className="text-[10px] text-slate-500 leading-normal truncate mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
