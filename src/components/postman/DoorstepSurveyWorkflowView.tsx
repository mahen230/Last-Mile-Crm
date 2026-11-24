import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  MapPin,
  Save,
  Send,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/FirebaseAuthProvider';
import {
  DOORSTEP_SURVEY_STAGES,
  locationSurveyService,
} from '../../services/locationSurveyService';
import {
  DoorstepSurveyRecord,
  DoorstepSurveyStatus,
  HouseMasterRecord,
} from '../../types/models';

export default function DoorstepSurveyWorkflowView() {
  const { userProfile } = useAuth();
  const location = useLocation();
  const initialHouseId = (location.state as { houseId?: string } | null)?.houseId || '';

  const [houses, setHouses] = useState<HouseMasterRecord[]>([]);
  const [surveys, setSurveys] = useState<DoorstepSurveyRecord[]>([]);
  const [stageFilter, setStageFilter] = useState<'ALL' | DoorstepSurveyStatus>('ALL');
  const [notice, setNotice] = useState<string | null>(null);

  // Mobile-First Doorstep Survey Form State
  const draftKey = `SURVEY_DRAFT_${userProfile?.id || 'STAFF'}`;
  const [selectedHouseId, setSelectedHouseId] = useState<string>(initialHouseId);
  const [manualAddress, setManualAddress] = useState('');
  const [colony, setColony] = useState('Keshavpura');
  const [pincode, setPincode] = useState('324009');
  const [residentName, setResidentName] = useState('');
  const [residentMobile, setResidentMobile] = useState('');
  const [membersCount, setMembersCount] = useState<number>(3);
  const [occupancyVerified, setOccupancyVerified] =
    useState<DoorstepSurveyRecord['occupancyVerified']>('Occupied');
  const [consentCaptured, setConsentCaptured] = useState(false);
  const [fieldNotes, setFieldNotes] = useState('');
  const [gpsStatus, setGpsStatus] = useState<DoorstepSurveyRecord['gpsStatus']>('NOT_REQUESTED');
  const [coords, setCoords] = useState<{ lat?: number; lng?: number; acc?: number }>({});
  const [gpsMessage, setGpsMessage] = useState('GPS not requested yet.');
  const [rejectRemarksById, setRejectRemarksById] = useState<Record<string, string>>({});

  const canVerify = locationSurveyService.canSupervisorVerifySurvey(userProfile);

  useEffect(() => {
    const sync = () => {
      setHouses(locationSurveyService.getHouses(userProfile));
      setSurveys(locationSurveyService.getSurveys(userProfile));
    };
    sync();
    const unsub = locationSurveyService.subscribe(sync);
    return () => unsub();
  }, [userProfile]);

  // Load saved offline draft on mount
  useEffect(() => {
    const draft = locationSurveyService.getDraft(draftKey);
    if (draft) {
      if (!initialHouseId && draft.houseId) setSelectedHouseId(draft.houseId);
      if (draft.houseDisplayAddress) setManualAddress(draft.houseDisplayAddress);
      if (draft.colony) setColony(draft.colony);
      if (draft.pincode) setPincode(draft.pincode);
      if (draft.residentName) setResidentName(draft.residentName);
      if (draft.residentMobile) setResidentMobile(draft.residentMobile);
      if (draft.fieldNotes) setFieldNotes(draft.fieldNotes);
      if (typeof draft.consentCaptured === 'boolean') setConsentCaptured(draft.consentCaptured);
    }
  }, [draftKey, initialHouseId]);

  useEffect(() => {
    if (selectedHouseId) {
      const h = houses.find((item) => item.id === selectedHouseId);
      if (h) {
        setManualAddress(`${h.houseNumber} (${h.floorUnit || 'Ground'}), ${h.streetName}`);
        setColony(h.colony);
        setPincode(h.pincode);
        if (h.headResidentName) setResidentName(h.headResidentName);
      }
    }
  }, [selectedHouseId, houses]);

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice((p) => (p === msg ? null : p)), 4000);
  };

  const handleCaptureGps = async () => {
    setGpsMessage('Requesting device location...');
    const res = await locationSurveyService.captureSurveyGps();
    setGpsStatus(res.gpsStatus);
    setCoords({ lat: res.latitude, lng: res.longitude, acc: res.accuracyMeters });
    setGpsMessage(res.message);
  };

  const handleSaveDraft = () => {
    locationSurveyService.saveDraft(draftKey, {
      houseId: selectedHouseId || 'UNLINKED',
      houseDisplayAddress: manualAddress,
      colony,
      pincode,
      residentName,
      residentMobile,
      consentCaptured,
      fieldNotes,
      gpsStatus,
      latitude: coords.lat,
      longitude: coords.lng,
    });
    showToast('Survey draft saved locally (offline-ready).');
  };

  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAddress.trim() || !colony.trim() || !/^\d{6}$/.test(pincode.trim())) {
      showToast('Enter House Address, Colony, and valid 6-digit PIN.');
      return;
    }
    const created = locationSurveyService.createOrSubmitSurvey(
      {
        houseId: selectedHouseId || `HSE-DIRECT-${Date.now().toString(36).toUpperCase()}`,
        houseDisplayAddress: manualAddress.trim(),
        colony: colony.trim(),
        pincode: pincode.trim(),
        officeName: userProfile?.subOffice || userProfile?.assignedOffice || 'Dadabari S.O.',
        beatNo: userProfile?.beat,
        assignedStaffId: userProfile?.employeeId || userProfile?.id || 'STAFF-FIELD',
        assignedStaffName: userProfile?.name || 'Field Staff',
        status: 'Submitted',
        isDraft: false,
        consentCaptured,
        gpsStatus,
        latitude: coords.lat,
        longitude: coords.lng,
        gpsAccuracyMeters: coords.acc,
        residentName: residentName.trim() || undefined,
        residentMobile: residentMobile.trim() || undefined,
        householdMembersCount: membersCount,
        occupancyVerified,
        fieldNotes: fieldNotes.trim() || 'Doorstep survey submitted.',
      },
      draftKey
    );
    setFieldNotes('');
    setResidentName('');
    setResidentMobile('');
    setConsentCaptured(false);
    showToast(`Survey ${created.id} submitted -> "${created.status}".`);
  };

  const handleSupervisorTransition = (
    surveyId: string,
    nextStatus: DoorstepSurveyStatus
  ) => {
    const res = locationSurveyService.transitionSurveyStatus(
      surveyId,
      nextStatus,
      userProfile,
      rejectRemarksById[surveyId]
    );
    showToast(res.message);
  };

  const stageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    DOORSTEP_SURVEY_STAGES.forEach((st) => {
      map[st] = surveys.filter((s) => s.status === st).length;
    });
    return map;
  }, [surveys]);

  const filteredSurveys = useMemo(() => {
    if (stageFilter === 'ALL') return surveys;
    return surveys.filter((s) => s.status === stageFilter);
  }, [surveys, stageFilter]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-[#0A1628] text-white rounded-xl border border-slate-800 p-5 sm:p-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-orange-400 font-bold">
          FIELD SURVEY &amp; VERIFICATION ENGINE
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
          Doorstep Survey Workflow
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Offline draft persistence, consent capture, non-blocking GPS status, and 7-stage supervisor verification.
        </p>

        {/* 7-Stage Pipeline Filter Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-4 pt-4 border-t border-slate-800">
          {DOORSTEP_SURVEY_STAGES.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => setStageFilter((prev) => (prev === stage ? 'ALL' : stage))}
              className={`text-left px-3 py-2 rounded-lg border transition cursor-pointer ${
                stageFilter === stage
                  ? 'bg-[#1D4ED8] border-blue-500 text-white'
                  : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="text-[10px] font-semibold truncate">{stage}</div>
              <div className="text-base font-black tabular-nums mt-0.5">{stageCounts[stage] || 0}</div>
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <div className="bg-blue-50 border border-blue-200 text-blue-950 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={15} className="text-[#1D4ED8]" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Mobile-First Field Survey Form */}
        <form
          onSubmit={handleSubmitSurvey}
          className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 text-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ClipboardCheck size={16} className="text-[#EA580C]" />
              <span>Field Doorstep Survey Form</span>
            </h2>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 cursor-pointer"
            >
              <Save size={12} /> Save Draft
            </button>
          </div>

          {houses.length > 0 && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Link House Master Record</label>
              <select
                value={selectedHouseId}
                onChange={(e) => setSelectedHouseId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">-- Select Registered House (Optional) --</option>
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.id} · {h.houseNumber} ({h.floorUnit || 'Ground'}) · {h.colony}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">House / Building &amp; Street *</label>
            <input
              type="text"
              required
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="House No, Floor/Unit, Street Name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Colony *</label>
              <input
                type="text"
                required
                value={colony}
                onChange={(e) => setColony(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">6-Digit PIN *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Resident Name</label>
              <input
                type="text"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                placeholder="Head / Respondent"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile (Optional)</label>
              <input
                type="tel"
                maxLength={10}
                value={residentMobile}
                onChange={(e) => setResidentMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="10 digits"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Occupancy Verified</label>
              <select
                value={occupancyVerified}
                onChange={(e) => setOccupancyVerified(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Occupied">Occupied</option>
                <option value="Rented">Rented</option>
                <option value="Commercial">Commercial</option>
                <option value="Vacant">Vacant</option>
                <option value="Shifted">Shifted</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Household Members</label>
              <input
                type="number"
                min={0}
                max={30}
                value={membersCount}
                onChange={(e) => setMembersCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Non-blocking GPS Permission Handler */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Compass size={14} className="text-[#1D4ED8]" /> GPS Capture ({gpsStatus})
              </span>
              <button
                type="button"
                onClick={handleCaptureGps}
                className="px-2.5 py-1 bg-[#1D4ED8] text-white rounded font-bold text-[11px] hover:bg-blue-700 cursor-pointer"
              >
                Capture GPS
              </button>
            </div>
            <div className="text-[11px] text-slate-600">{gpsMessage}</div>
          </div>

          <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={consentCaptured}
              onChange={(e) => setConsentCaptured(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="font-semibold text-slate-800">
              Citizen verbal/written consent recorded for survey data
            </span>
          </label>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Field Observation Notes</label>
            <textarea
              rows={2}
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              placeholder="Landmark, parcel/scheme interest, correction notes..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#EA580C] hover:bg-orange-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send size={14} /> Submit for Supervisor Verification
          </button>
        </form>

        {/* Right: Verification & Survey Queue */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#1D4ED8]" />
              <span>Survey Queue ({filteredSurveys.length})</span>
            </h2>
            {stageFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setStageFilter('ALL')}
                className="text-xs font-bold text-[#1D4ED8] hover:underline cursor-pointer"
              >
                Show All Stages
              </button>
            )}
          </div>

          {filteredSurveys.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300 text-xs text-slate-600">
              No doorstep surveys recorded for this stage yet. Submit a survey from the mobile-first form on the left.
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
              {filteredSurveys.map((srv) => (
                <div key={srv.id} className="p-4 rounded-lg border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-[#1D4ED8] mr-2">{srv.id}</span>
                      <span className="font-bold text-slate-900">{srv.houseDisplayAddress}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-bold text-slate-800 text-[11px]">
                      {srv.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Colony: <strong>{srv.colony}</strong> (PIN {srv.pincode})
                    </span>
                    <span>
                      Staff: <strong>{srv.assignedStaffName}</strong>
                    </span>
                    <span>
                      Consent: <strong>{srv.consentCaptured ? 'Recorded' : 'Pending'}</strong>
                    </span>
                    <span>
                      GPS: <strong>{srv.gpsStatus}</strong>
                    </span>
                  </div>

                  <p className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                    {srv.fieldNotes}
                  </p>

                  {srv.correctionRemarks && (
                    <div className="p-2 rounded bg-orange-50 border border-orange-200 text-orange-900 flex items-center gap-1.5 text-[11px] font-semibold">
                      <AlertTriangle size={13} /> Correction Note: {srv.correctionRemarks}
                    </div>
                  )}

                  {canVerify && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="Correction remark (if rejecting)..."
                        value={rejectRemarksById[srv.id] || ''}
                        onChange={(e) =>
                          setRejectRemarksById((prev) => ({ ...prev, [srv.id]: e.target.value }))
                        }
                        className="flex-1 min-w-[160px] px-2.5 py-1.5 border border-slate-300 rounded text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSupervisorTransition(srv.id, 'Verified')}
                        className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 size={12} /> Verify
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleSupervisorTransition(srv.id, 'Rejected/Correction Required')
                        }
                        className="px-2.5 py-1.5 bg-[#EA580C] hover:bg-orange-700 text-white rounded font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle size={12} /> Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSupervisorTransition(srv.id, 'Completed')}
                        className="px-2.5 py-1.5 bg-[#0A1628] hover:bg-slate-800 text-white rounded font-bold cursor-pointer"
                      >
                        Complete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
