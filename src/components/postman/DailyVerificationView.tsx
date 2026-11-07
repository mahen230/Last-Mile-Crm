import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, MapPin, Building, ShieldCheck, 
  AlertCircle, Navigation, RefreshCw, Send, Check, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { verificationService, DailyVerificationTask } from '../../services/verificationService';
import { nativeDeviceService } from '../../services/nativeSyncService';

export default function DailyVerificationView() {
  const { userProfile } = useAuth();
  const [tasks, setTasks] = useState<DailyVerificationTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<DailyVerificationTask | null>(null);
  const [occupancy, setOccupancy] = useState<DailyVerificationTask['occupancyStatus']>('Occupied');
  const [propertyType, setPropertyType] = useState<DailyVerificationTask['propertyType']>('House');
  const [houseNo, setHouseNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat?: number; lng?: number; captured: boolean }>({ captured: false });
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const empId = userProfile?.employeeId || userProfile?.id || '50510312';
  const beatNo = userProfile?.beat || 'Beat 2';

  const loadTasks = () => {
    const list = verificationService.getDailyVerificationTasks(empId, beatNo);
    setTasks(list);
  };

  useEffect(() => {
    loadTasks();
    const unsub = verificationService.subscribe(loadTasks);
    return () => unsub();
  }, [empId, beatNo]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenTask = (task: DailyVerificationTask) => {
    setSelectedTask(task);
    setOccupancy(task.occupancyStatus);
    setPropertyType(task.propertyType);
    setHouseNo(task.houseNo);
    setRemarks(task.remarks || '');
    setGpsCoords({
      lat: task.latitude,
      lng: task.longitude,
      captured: task.gpsCaptured,
    });
    setGpsError(null);
  };

  const handleCaptureGps = async () => {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const pos = await nativeDeviceService.getCurrentPosition();
      if (pos) {
        setGpsCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          captured: true,
        });
        showToast('📍 GPS coordinates captured successfully!');
      } else {
        setGpsError('GPS location unavailable. You can still submit without GPS.');
      }
    } catch (e: any) {
      setGpsError('Location permission denied or device GPS offline.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSubmitVerification = (status: 'Verified' | 'Needs Review') => {
    if (!selectedTask) return;
    const res = verificationService.submitVerification(selectedTask.id, {
      status,
      occupancyStatus: occupancy,
      propertyType,
      houseNo: houseNo.trim() || selectedTask.houseNo,
      remarks: remarks.trim(),
      latitude: gpsCoords.lat,
      longitude: gpsCoords.lng,
      gpsCaptured: gpsCoords.captured,
    });

    if (res.success) {
      showToast(status === 'Verified' ? '✅ Property verified & recorded in postal registry!' : '⚠️ Property marked for Admin Review.');
      setSelectedTask(null);
    }
  };

  const completedCount = tasks.filter(t => t.status === 'Verified').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold shadow-md flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Header & Target Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 mb-2">
              <ShieldCheck size={14} /> Daily 10-Property Doorstep Verification
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              My Daily Verification Tasks
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned Beat: <strong>{beatNo}</strong> • Target: <strong>10 Properties / Day</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Completed Today</div>
              <div className="text-xl font-black text-slate-900">{completedCount} / {tasks.length}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-700 text-white font-black text-sm flex items-center justify-center">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Verification Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task, idx) => (
          <div
            key={task.id}
            onClick={() => handleOpenTask(task)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
              selectedTask?.id === task.id
                ? 'border-red-500 bg-red-50/40 shadow-sm ring-2 ring-red-500/20'
                : task.status === 'Verified'
                ? 'border-emerald-200 bg-emerald-50/30'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                {idx + 1}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                  task.status === 'Verified'
                    ? 'bg-emerald-100 text-emerald-800'
                    : task.status === 'Needs Review'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {task.status}
              </span>
            </div>

            <div>
              <div className="font-bold text-slate-900 text-sm">
                House / Plot: {task.houseNo}
              </div>
              <div className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                {typeof task.address === 'string'
                  ? task.address
                  : (task.address as any)?.fullAddress ||
                    `${task.houseNo || 'Plot'}, Sector ${task.sector || ''}, ${task.colony || 'Dadabari'}`}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>Colony: <strong>{task.colony}</strong></span>
              <span>Status: <strong>{task.occupancyStatus}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Verification Action Drawer / Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs text-red-700 font-bold">{selectedTask.propertyCode}</span>
                <h3 className="text-lg font-bold text-slate-900">Doorstep Verification</h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div>
                <strong>Recorded Address:</strong>{' '}
                {typeof selectedTask.address === 'string'
                  ? selectedTask.address
                  : (selectedTask.address as any)?.fullAddress ||
                    `${selectedTask.houseNo || 'Plot'}, Sector ${selectedTask.sector || ''}, ${selectedTask.colony || 'Dadabari'}`}
              </div>
              <div><strong>Colony & Sector:</strong> {selectedTask.colony}, Sector {selectedTask.sector}</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">House / Plot Number</label>
                <input
                  type="text"
                  value={houseNo}
                  onChange={e => setHouseNo(e.target.value)}
                  placeholder="Verify House / Plot No..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Occupancy Status</label>
                  <select
                    value={occupancy}
                    onChange={e => setOccupancy(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Occupied">Occupied (Residents Present)</option>
                    <option value="Vacant">Vacant (No Resident)</option>
                    <option value="Rented">Rented (Tenant Residing)</option>
                    <option value="Commercial">Commercial / Shop</option>
                    <option value="Address Left">Address Left / Shifted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                  >
                    <option value="House">Residential House</option>
                    <option value="Flat">Apartment / Flat</option>
                    <option value="Shop">Shop / Retail</option>
                    <option value="Office">Office / Commercial</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* GPS Geolocation Tagging */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Navigation size={14} className="text-red-700" />
                    GPS Geo-Tagging (Doorstep Location)
                  </span>
                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    disabled={gpsLoading}
                    className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {gpsLoading ? 'Acquiring GPS...' : 'Capture GPS'}
                  </button>
                </div>

                {gpsCoords.captured && gpsCoords.lat ? (
                  <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Lat: {gpsCoords.lat.toFixed(5)}, Lng: {gpsCoords.lng?.toFixed(5)}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500">
                    Captures actual device coordinates to tag the property gate for postal delivery navigation.
                  </div>
                )}

                {gpsError && (
                  <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    {gpsError}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Field Remarks / Delivery Notes</label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. Verified with electricity bill. Owner resides with family. Door bell active."
                  rows={2}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleSubmitVerification('Verified')}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition"
              >
                <CheckCircle2 size={16} />
                Confirm & Mark Verified
              </button>
              <button
                type="button"
                onClick={() => handleSubmitVerification('Needs Review')}
                className="py-3 px-4 bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <AlertTriangle size={15} />
                Flag for Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
