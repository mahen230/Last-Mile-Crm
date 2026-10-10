import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { customerService } from '../../services/customerService';
import { Customer } from '../../types/models';

export default function BeatMap() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedBeat, setSelectedBeat] = useState('1');

    useEffect(() => {
        const allCust = customerService.getCustomers();
        setCustomers(allCust);
    }, []);

    const filteredCustomers = customers.filter(c => c.beatNo === selectedBeat);

    return (
        <div className="h-screen w-full p-4">
            <h1 className="text-2xl font-bold mb-4">Beat Delivery Route Visualization</h1>
            <select 
                value={selectedBeat} 
                onChange={(e) => setSelectedBeat(e.target.value)}
                className="p-2 border rounded mb-4"
            >
                {Array.from({ length: 33 }, (_, i) => i + 1).map(b => (
                    <option key={b} value={b.toString()}>Beat {b}</option>
                ))}
            </select>
            
            <div className="h-3/4 w-full bg-slate-100 rounded-xl overflow-hidden">
                <APIProvider apiKey={(import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'DEMO_MAP_ID'}>
                    <Map
                        defaultCenter={{ lat: 25.18, lng: 75.83 }} // Kota coordinates
                        defaultZoom={13}
                        mapId="DEMO_MAP_ID"
                    >
                        {filteredCustomers.map(c => (
                            <AdvancedMarker key={c.id} position={{ lat: 25.18 + Math.random() * 0.05, lng: 75.83 + Math.random() * 0.05 }}>
                                <Pin title={c.name} />
                            </AdvancedMarker>
                        ))}
                    </Map>
                </APIProvider>
            </div>
            <p className="mt-2 text-sm text-slate-500">Note: Markers are randomized as addresses need geocoding.</p>
        </div>
    );
}
