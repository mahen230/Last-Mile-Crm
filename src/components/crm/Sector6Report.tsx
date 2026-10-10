import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { customerService } from '../../services/customerService';
import { Customer } from '../../types/models';

export const calculateSector6Stats = (customers: Customer[]) => {
  const series = {
    'Standard (1-417)': { total: 417, found: new Set<string>() },
    'KH (1-252)': { total: 252, found: new Set<string>() },
    'B-Series (167-180)': { total: 14, found: new Set<string>() },
    'Shops (1-80)': { total: 80, found: new Set<string>() },
  };

  customers.forEach(c => {
    if (c.sectorLocality?.toString() === '6' || c.address?.sectorLocality === '6') {
      const houseNo = c.address?.houseNumber?.toString().toUpperCase() || '';
      
      // Standard
      if (/^\d+$/.test(houseNo) && parseInt(houseNo) <= 417) {
        series['Standard (1-417)'].found.add(houseNo);
      }
      // KH
      else if (/^KH\s*\d+$/i.test(houseNo)) {
        const num = parseInt(houseNo.replace('KH', '').trim());
        if (num <= 252) series['KH (1-252)'].found.add(houseNo);
      }
      // B-Series
      else if (/^(16[7-9]|1[7-8]0)\s*B$/i.test(houseNo)) {
        series['B-Series (167-180)'].found.add(houseNo);
      }
      // Shop
      else if (/^SHOP\s*\d+$/i.test(houseNo)) {
        const num = parseInt(houseNo.replace('SHOP', '').trim());
        if (num <= 80) series['Shops (1-80)'].found.add(houseNo);
      }
    }
  });

  return Object.entries(series).map(([name, data]) => ({
    name,
    Found: data.found.size,
    Pending: data.total - data.found.size,
  }));
};

export default function Sector6Report() {
  const customers = customerService.getCustomers();
  const reportData = useMemo(() => calculateSector6Stats(customers), [customers]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Sector 6 Household Progress Report</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={reportData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Found" stackId="a" fill="#10b981" />
            <Bar dataKey="Pending" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
