import React, { useState } from 'react';
import { 
  Link as LinkIcon, Copy, Check, QrCode, Plus, Trash2, 
  RefreshCw, ShieldCheck, Globe, Users, Building, ExternalLink 
} from 'lucide-react';
import { shortUrlService, PublicShortUrlRecord } from '../../services/shortUrlService';

export const PublicShortUrlManager: React.FC = () => {
  const [links, setLinks] = useState<PublicShortUrlRecord[]>(() => shortUrlService.getShortUrls());
  const [brandId, setBrandId] = useState('india-post');
  const [brandName, setBrandName] = useState('India Post (Dadabari HPO/SO)');
  const [scope, setScope] = useState<'CUSTOMER' | 'STAFF' | 'BOTH'>('BOTH');
  const [label, setLabel] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const created = shortUrlService.generateShortUrl({
      brandId,
      brandName,
      scope,
      label: label.trim() || `${brandName} Shared Portal`,
    });
    setLinks(shortUrlService.getShortUrls());
    setLabel('');
    setSuccessMsg(`Generated short link: ${created.shortCode}`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleCopy = (shortCode: string) => {
    const fullUrl = shortUrlService.getFullPublicUrl(shortCode);
    navigator.clipboard.writeText(fullUrl);
    setCopiedCode(shortCode);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleToggle = (id: string) => {
    shortUrlService.toggleRevokeStatus(id);
    setLinks(shortUrlService.getShortUrls());
  };

  const handleDelete = (id: string) => {
    shortUrlService.deleteShortUrl(id);
    setLinks(shortUrlService.getShortUrls());
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-600">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Public Short URL Manager</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate &amp; manage secure public short links for Customers (Lead Capture) &amp; Staff (Field Sign-In).
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <Check size={14} className="text-emerald-600" />
        </div>
      )}

      {/* Generator Form */}
      <form onSubmit={handleGenerate} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Plus size={16} className="text-red-600" />
          <span>Create New Public Short Link</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Target India Post Portal / Desk *</label>
            <select
              value={brandId}
              onChange={(e) => {
                const val = e.target.value;
                setBrandId(val);
                if (val === 'india-post') setBrandName('India Post (Kota Division / Dadabari S.O.)');
                else if (val === 'india-post-bulk') setBrandName('India Post Bulk Customer & Product Showcase');
                else setBrandName('India Post Master Command OS');
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-red-500"
            >
              <option value="india-post">India Post (Kota Division / Dadabari S.O.)</option>
              <option value="india-post-bulk">India Post Bulk Customer &amp; Product Showcase</option>
              <option value="PLATFORM_ADMIN">India Post Master Command OS</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Audience Scope *</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-red-500"
            >
              <option value="BOTH">Both Customers &amp; Staff (Dual Portal)</option>
              <option value="CUSTOMER">Customers Only (Lead Capture &amp; Status)</option>
              <option value="STAFF">Staff Only (Field Operations Sign-In)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Campaign / Label / Purpose *</label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Dadabari Beat 2 Doorstep QR"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>Generate Secure Public Short URL</span>
        </button>
      </form>

      {/* Active Links Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Active Public Short URLs ({links.length})</h3>
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Short Code / URL</th>
                <th className="py-3 px-4">Brand / Workspace</th>
                <th className="py-3 px-4">Audience Scope</th>
                <th className="py-3 px-4">Clicks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {links.map((link) => {
                const fullUrl = shortUrlService.getFullPublicUrl(link.shortCode);
                const isCopied = copiedCode === link.shortCode;
                return (
                  <tr key={link.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold">
                      <div className="text-red-700 flex items-center gap-1.5">
                        <span>{link.shortCode}</span>
                        <a
                          href={`/s/${link.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-700"
                          title="Open Link"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans truncate max-w-xs">{link.label}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold">{link.brandName}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        link.scope === 'BOTH' ? 'bg-purple-100 text-purple-800' :
                        link.scope === 'CUSTOMER' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {link.scope}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold tabular-nums">{link.clicksCount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        link.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {link.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleCopy(link.shortCode)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition cursor-pointer inline-flex items-center gap-1"
                      >
                        {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(link.id)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg transition cursor-pointer"
                      >
                        {link.status === 'Active' ? 'Revoke' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(link.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer inline-block"
                        title="Delete Link"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
