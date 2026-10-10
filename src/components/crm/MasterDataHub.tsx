import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, onSnapshot, query, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Save, Search as SearchIcon, Plus, ChevronRight, Edit2, Upload, Download, FileSpreadsheet, Trash2, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { staffPermissionService } from '../../services/staffPermissionService';

export default function MasterDataHub() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', beat: '', area: '', staff: '' });
  const [entries, setEntries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [fileData, setFileData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [showMappingModal, setShowMappingModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'customers'));
    const unsub = onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    if (formData.name || formData.phone) {
        const isDuplicate = entries.some(e => 
            (formData.name && e.name === formData.name) || 
            (formData.phone && e.phone === formData.phone)
        );
        setDuplicateWarning(isDuplicate ? "Potential duplicate record found!" : null);
    } else {
        setDuplicateWarning(null);
    }
  }, [formData.name, formData.phone, entries]);

  const handleSave = async () => {
    if (formData.name && formData.phone) {
      await addDoc(collection(db, 'customers'), formData);
      setFormData({ name: '', phone: '', address: '', beat: '', area: '', staff: '' });
      setStep(1);
    }
  };

  const handleCleanup = async () => {
    if (!window.confirm("Are you sure you want to delete all incomplete entries? This action is irreversible.")) return;

    for (const entry of entries) {
        // Criteria: name, phone, address must exist
        if (!entry.name || !entry.phone || !entry.address) {
            await deleteDoc(doc(db, 'customers', entry.id));
        }
    }
    alert("Cleanup complete!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const [h, ...rows] = json as any[][];
      setHeaders(h);
      setFileData(rows);
      setShowMappingModal(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(entries);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, "MasterData.xlsx");
  };

  const downloadTemplate = () => {
    const template = [['Customer Name', 'Contact Number', 'House No', 'Street', 'Beat', 'Sector', 'Postman', 'Pincode']];
    const worksheet = XLSX.utils.aoa_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "ImportTemplate.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-20 bg-slate-50 py-3 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Master Data Hub</h2>
        <div className="flex gap-2">
            <button onClick={handleCleanup} className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-200 shadow-sm">
                <Trash2 size={16} /> Clean Data
            </button>
            <button onClick={handleExport} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-200 shadow-sm">
                <FileSpreadsheet size={16} /> Export
            </button>
            <button onClick={handleSave} className="bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-800 shadow-sm">
                <Save size={16} /> Save Entry
            </button>
        </div>
      </div>

      {/* File Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950">
                <Upload size={16} /> Upload Excel/CSV
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            <button onClick={downloadTemplate} className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950">
                <Download size={16} /> Download Template
            </button>
            <button 
                onClick={() => staffPermissionService.exportAllToExcel()} 
                className="flex items-center gap-2 text-sm font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition"
                title="Download Dadabari SO Staff & Beats Master Sheet (.xlsx)"
            >
                <Users size={16} /> Export Staff Data (Excel)
            </button>
        </div>
      </div>

      {/* Basic Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h3 className="font-bold">Add New Option</h3>
            <input placeholder="New Value" className="w-full p-2 border rounded-lg" />
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 p-2 bg-slate-100 rounded-lg">Cancel</button>
              <button className="flex-1 p-2 bg-red-700 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Mapping Modal */}
      {showMappingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-2xl space-y-4">
            <h3 className="font-bold">Map File Columns</h3>
            <div className="grid grid-cols-2 gap-4">
              {headers.map(h => (
                <div key={h} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-1/3 truncate">{h}</span>
                  <select 
                    className="flex-1 p-2 border rounded-lg text-sm"
                    value={mapping[h] || ''}
                    onChange={e => setMapping({...mapping, [h]: e.target.value})}
                  >
                    <option value="">Ignore</option>
                    <option value="name">Name</option>
                    <option value="phone">Phone</option>
                    <option value="address">Address</option>
                    <option value="beat">Beat</option>
                    <option value="area">Area</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowMappingModal(false)} className="flex-1 p-2 bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={async () => {
                const records = fileData.map(row => {
                  const obj: any = {};
                  headers.forEach((h, idx) => {
                    if (mapping[h]) {
                      obj[mapping[h]] = row[idx];
                    }
                  });
                  return obj;
                });
                
                for(const r of records) {
                    if(r.name) await addDoc(collection(db, 'customers'), r);
                }
                setShowMappingModal(false);
                setMapping({});
              }} className="flex-1 p-2 bg-red-700 text-white rounded-lg">Import</button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {duplicateWarning && (
            <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm font-bold border border-amber-200">
                ⚠️ {duplicateWarning}
            </div>
        )}
        {step === 1 ? (
          <div className="space-y-4">
            <h3 className="font-bold text-sm">Step 1: Basic Information</h3>
            <input placeholder="Customer Name" className="w-full p-3 rounded-lg border border-slate-200" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input placeholder="Contact Number (Mandatory)" className="w-full p-3 rounded-lg border border-slate-200" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <button onClick={() => formData.phone && setStep(2)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              Continue to Details <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-bold text-sm">Step 2: Linking & Association</h3>
            <div className="flex gap-2">
                <input placeholder="Address" className="flex-1 p-3 rounded-lg border border-slate-200" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <div className="flex items-center gap-2">
                <select className="flex-1 p-3 rounded-lg border border-slate-200" value={formData.beat} onChange={e => setFormData({...formData, beat: e.target.value})}>
                    <option value="">Select Beat</option>
                    <option value="B1">Beat 1</option>
                    <option value="B2">Beat 2</option>
                </select>
                <button onClick={() => setShowModal(true)} className="p-3 bg-slate-100 rounded-lg hover:bg-slate-200"><Plus size={16} /></button>
            </div>
            {/* Add more fields here */}
            <button onClick={() => setStep(1)} className="text-sm text-slate-500">Back</button>
          </div>
        )}
      </div>

      {/* Search & List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Existing Entries</h3>
            <div className="relative">
                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input placeholder="Search..." className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
        </div>
        <table className="w-full text-xs text-left">
            <thead>
                <tr className="border-b border-slate-200">
                    <th className="p-2">Name</th>
                    <th className="p-2">Phone</th>
                    <th className="p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                {entries.filter(e => e.name?.includes(searchTerm)).map(e => (
                    <tr key={e.id} className="border-b border-slate-200">
                        <td className="p-2">{e.name}</td>
                        <td className="p-2">{e.phone}</td>
                        <td className="p-2"><button className="text-slate-500 hover:text-slate-900"><Edit2 size={14} /></button></td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
