import React, { useState, useEffect } from 'react';
import { Building, MapPin, Users, Search, Home, ExternalLink } from 'lucide-react';
import { Property, Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import CustomerProfileModal from '../customers/CustomerProfileModal';

export default function PropertiesView() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleEditProperty = (prop: Property) => {
    setSelectedProperty(prop);
    setIsEditModalOpen(true);
  };

  const handleRemoveResident = (residentName: string) => {
    if (!selectedProperty) return;
    const updatedResidents = selectedProperty.residentNames.filter(r => r !== residentName);
    const updatedProperty = { ...selectedProperty, residentNames: updatedResidents };
    customerService.updateProperty(updatedProperty);
    setSelectedProperty(updatedProperty);
    setProperties(properties.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  };

  useEffect(() => {
    const loadProperties = () => {
      let data = customerService.getProperties();
      if (data.length === 0) {
        // Mock data
        data = [
          {
            id: 'mock-1',
            propertyCode: 'PROP-S6-H101',
            housePlotNumber: '101',
            address: '101, Sector 6, Dadabari, Kota',
            sector: 'Sector 6',
            area: 'Dadabari',
            pincode: '324009',
            status: 'Occupied',
            residentNames: ['Mahesh Kumar'],
            verificationStatus: true
          },
          {
            id: 'mock-2',
            propertyCode: 'PROP-S4-H202',
            housePlotNumber: '202',
            address: '202, Sector 4, Keshavpura, Kota',
            sector: 'Sector 4',
            area: 'Keshavpura',
            pincode: '324009',
            status: 'Vacant',
            residentNames: [],
            verificationStatus: false
          }
        ];
      }
      setProperties(data);
    };
    
    loadProperties();
    const unsub = customerService.subscribe(loadProperties);
    return () => unsub();
  }, []);

  const filteredProperties = properties.filter(p => {
    const s = search.toLowerCase().replace(/\s+/g, '');
    const matchesSearch = !search ||
      p.propertyCode.toLowerCase().includes(s) ||
      p.housePlotNumber.toLowerCase().includes(s) ||
      p.address.toLowerCase().includes(s) ||
      p.residentNames.some(r => r.toLowerCase().includes(s));
    
    const matchesType = filterType === 'All' || p.status === filterType; // simplistic filter based on current field
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6" id="properties-view-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building size={22} className="text-red-700" />
            <span>Property & Land Parcel Registry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical plots, houses, and building units mapped to delivery beats ({properties.length} Properties)
          </p>
        </div>

        <div className="flex gap-2">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
          >
            <option value="All">All Types</option>
            <option value="Occupied">Occupied</option>
            <option value="Vacant">Vacant</option>
          </select>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search house no, sector, property ID..."
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600"
            />
          </div>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-semibold hover:bg-red-800"
          >
            + Add Property
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((prop) => (
          <div
            key={prop.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  {prop.propertyCode}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                  prop.status === 'Occupied' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {prop.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-1">
                House/Plot {prop.housePlotNumber}
              </h3>
              <p className="text-xs text-slate-600 mb-3 flex items-start gap-1">
                <MapPin size={13} className="text-red-600 shrink-0 mt-0.5" />
                <span>{prop.address}</span>
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Beat: <strong>Beat {prop.beatNo || 'N/A'}</strong></span>
                  <span className="text-slate-500 font-medium">Sector: <strong>{prop.sector}</strong></span>
                </div>
                <div className="text-xs text-slate-700 font-medium pt-1 border-t border-slate-200">
                  Residents ({prop.residentNames?.length || 0}):
                </div>
                <div className="flex flex-wrap gap-1">
                  {prop.residentNames.map((name, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white border border-slate-200 text-slate-800 rounded text-xs"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <button onClick={() => handleEditProperty(prop)} className="font-semibold text-slate-600 hover:text-slate-900">
                Edit
              </button>
              <button
                onClick={() => setSelectedProperty(prop)}
                className="font-semibold text-red-700 hover:text-red-800"
              >
                View Info →
              </button>
            </div>
          </div>
        ))}
      </div>

      {isEditModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Edit Property: {selectedProperty.propertyCode}</h3>
            <form className="space-y-3">
              <input defaultValue={selectedProperty.address} placeholder="Address" className="w-full p-2 border rounded text-xs" />
              <input defaultValue={selectedProperty.sector} placeholder="Sector" className="w-full p-2 border rounded text-xs" />
              <input defaultValue={selectedProperty.colony} placeholder="Colony" className="w-full p-2 border rounded text-xs" />
              
              <div className="pt-4 border-t">
                <h4 className="text-xs font-bold text-slate-900 mb-2">Residents</h4>
                <div className="space-y-2 mb-3">
                  {selectedProperty.residents && selectedProperty.residents.map((r, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded text-xs">
                      {r.name} - <span className="text-slate-500 italic">{r.relationshipWithHead}</span>
                      <button type="button" onClick={() => handleRemoveResident(r.name)} className="text-red-600 font-bold">X</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input placeholder="Add Member Name..." className="flex-1 p-2 border rounded text-xs" />
                  <input placeholder="Relation (e.g., Wife, Son)..." className="flex-1 p-2 border rounded text-xs" />
                  <button type="button" className="px-3 py-2 bg-slate-900 text-white rounded text-xs">+</button>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="button" onClick={() => {setIsEditModalOpen(false);}} className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-semibold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Add New Property</h3>
            <form className="space-y-3">
              <input placeholder="House/Plot No" className="w-full p-2 border rounded text-xs" />
              <input placeholder="Sector" className="w-full p-2 border rounded text-xs" />
              <input placeholder="Area" className="w-full p-2 border rounded text-xs" />
              <input placeholder="Colony" className="w-full p-2 border rounded text-xs" />
              <input placeholder="Landmark" className="w-full p-2 border rounded text-xs" />
              <input placeholder="Pincode" className="w-full p-2 border rounded text-xs" />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {alert('Property added successfully!'); setIsAddModalOpen(false);}}
                  className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-semibold"
                >
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
