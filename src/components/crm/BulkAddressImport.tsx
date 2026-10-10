import React, { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { BEATS } from '../../data/beatsData';

interface Props {
  onClose: () => void;
}

export default function BulkAddressImport({ onClose }: Props) {
  const [rawData, setRawData] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });

  const handleImport = () => {
    const lines = rawData.split('\n');
    let importedCount = 0;
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(',');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const contact = parts[1].trim();
        const addressPart = parts[2] ? parts[2].trim() : '';
        const beatMatch = line.match(/(?:beat)\s+(\d+)/i);
        const beatValue = beatMatch ? `Beat ${beatMatch[1]}` : '';

        // Validate beat
        if (beatValue && !BEATS.includes(beatValue)) {
            errors.push(`Line ${index + 1}: Invalid beat "${beatValue}"`);
            return;
        }

        const sectorMatch = line.match(/(?:sector)\s+([^,]+)/i);

        customerService.addOrUpdateCustomer({
          name,
          mobile: contact,
          beatNo: beatValue || 'Beat 1',
          address: {
            houseNumber: addressPart,
            sectorLocality: sectorMatch ? sectorMatch[1].trim() : 'Unknown',
            area: 'Unknown',
            pincode: '324009',
          }
        }, 'Bulk Import Tool');
        
        importedCount++;
      }
    });

    if (errors.length > 0) {
        setStatus({ type: 'error', message: `Imported ${importedCount} records. Errors: ${errors.join(', ')}` });
    } else {
        setStatus({ type: 'success', message: `Successfully imported ${importedCount} records.` });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Upload size={20} className="text-red-700" />
            Bulk Address Import
          </h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <textarea
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
          placeholder="Paste raw data here (Format: Name, Contact, Address, Beat X)..."
          className="w-full h-64 p-4 border rounded-xl text-xs mb-4"
        />
        {status.message && (
            <div className={`text-xs mb-4 p-2 rounded flex items-center gap-2 ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {status.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                {status.message}
            </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500"></span>
          <button 
            onClick={handleImport}
            className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-semibold"
          >
            Import Data
          </button>
        </div>
      </div>
    </div>
  );
}
