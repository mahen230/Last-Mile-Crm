import {
  DoorstepSurveyRecord,
  DoorstepSurveyStatus,
  HouseMasterRecord,
  StaffProfile,
  StreetMasterRecord,
} from '../types/models';
import { featureVisibilityService } from './featureVisibilityService';
import { staffPermissionService } from './staffPermissionService';

const STREETS_KEY = 'kota_os_street_master_v1';
const HOUSES_KEY = 'kota_os_house_master_v1';
const SURVEYS_KEY = 'kota_os_doorstep_surveys_v1';
const SURVEY_DRAFTS_KEY = 'kota_os_doorstep_survey_drafts_v1';

export const DOORSTEP_SURVEY_STAGES: DoorstepSurveyStatus[] = [
  'Assigned',
  'In Progress',
  'Submitted',
  'Verification Pending',
  'Verified',
  'Rejected/Correction Required',
  'Completed',
];

class LocationSurveyService {
  private streets: StreetMasterRecord[] = [];
  private houses: HouseMasterRecord[] = [];
  private surveys: DoorstepSurveyRecord[] = [];
  private drafts: Record<string, Partial<DoorstepSurveyRecord>> = {};
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    try {
      const sRaw = localStorage.getItem(STREETS_KEY);
      this.streets = sRaw ? JSON.parse(sRaw) : [];

      const hRaw = localStorage.getItem(HOUSES_KEY);
      this.houses = hRaw ? JSON.parse(hRaw) : [];

      const survRaw = localStorage.getItem(SURVEYS_KEY);
      this.surveys = survRaw ? JSON.parse(survRaw) : [];

      const draftRaw = localStorage.getItem(SURVEY_DRAFTS_KEY);
      this.drafts = draftRaw ? JSON.parse(draftRaw) : {};
    } catch {
      this.streets = [];
      this.houses = [];
      this.surveys = [];
      this.drafts = {};
    }
  }

  private saveAndNotify(): void {
    try {
      localStorage.setItem(STREETS_KEY, JSON.stringify(this.streets));
      localStorage.setItem(HOUSES_KEY, JSON.stringify(this.houses));
      localStorage.setItem(SURVEYS_KEY, JSON.stringify(this.surveys));
      localStorage.setItem(SURVEY_DRAFTS_KEY, JSON.stringify(this.drafts));
    } catch (e) {
      console.warn('LocationSurveyService persist error:', e);
    }
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  // Strict privacy guard: unauthorized users MUST NOT see live employee GPS telemetry
  public canViewLiveStaffLocation(viewer: StaffProfile | null | undefined): boolean {
    if (!viewer) return false;
    if (featureVisibilityService.isPlatformSuperUser(viewer)) return true;
    const role = (viewer.role || '').toUpperCase();
    return [
      'DIVISIONAL_HEAD',
      'ASST_DIVISIONAL_ADMIN',
      'SUBDIVISION_INCHARGE',
      'LAST_MILE_SUPERVISOR',
      'ADMIN',
    ].includes(role);
  }

  public canSupervisorVerifySurvey(viewer: StaffProfile | null | undefined): boolean {
    if (!viewer) return false;
    if (featureVisibilityService.isPlatformSuperUser(viewer)) return true;
    const role = (viewer.role || '').toUpperCase();
    return [
      'DIVISIONAL_HEAD',
      'ASST_DIVISIONAL_ADMIN',
      'SUBDIVISION_INCHARGE',
      'CLUSTER_INCHARGE',
      'LAST_MILE_SUPERVISOR',
      'POSTMASTER',
      'ASST_POSTMASTER',
      'SUB_POSTMASTER',
      'ADMIN',
    ].includes(role);
  }

  // STREET MASTER CRUD
  public getStreets(viewer?: StaffProfile | null): StreetMasterRecord[] {
    if (!viewer || !staffPermissionService.isPostmanOrGds(viewer)) {
      return this.streets;
    }
    return this.streets.filter((s) =>
      staffPermissionService.matchesUserBeatScope(viewer, {
        beatNo: s.beatNo,
        colonyName: s.colony,
        area: s.locality,
      })
    );
  }

  public upsertStreet(
    input: Omit<StreetMasterRecord, 'id' | 'streetCode' | 'createdAt' | 'updatedAt'> & {
      id?: string;
      streetCode?: string;
    }
  ): StreetMasterRecord {
    const now = new Date().toISOString();
    const id = input.id || `STR-${Date.now().toString(36).toUpperCase()}`;
    const streetCode = input.streetCode || `ST-${(this.streets.length + 1).toString().padStart(4, '0')}`;
    const existingIdx = this.streets.findIndex((s) => s.id === id);
    const saved: StreetMasterRecord = {
      ...input,
      id,
      streetCode,
      createdAt: existingIdx >= 0 ? this.streets[existingIdx].createdAt : now,
      updatedAt: now,
    };
    if (existingIdx >= 0) {
      this.streets[existingIdx] = saved;
    } else {
      this.streets.unshift(saved);
    }
    this.saveAndNotify();
    return saved;
  }

  // HOUSE MASTER CRUD
  public getHouses(viewer?: StaffProfile | null): HouseMasterRecord[] {
    if (!viewer || !staffPermissionService.isPostmanOrGds(viewer)) {
      return this.houses;
    }
    return this.houses.filter((h) =>
      staffPermissionService.matchesUserBeatScope(viewer, {
        beatNo: h.beatNo,
        colonyName: h.colony,
        area: h.locality,
      })
    );
  }

  public upsertHouse(
    input: Omit<HouseMasterRecord, 'id' | 'createdAt' | 'updatedAt' | 'linkedCustomerIds'> & {
      id?: string;
      linkedCustomerIds?: string[];
    }
  ): HouseMasterRecord {
    const now = new Date().toISOString();
    const id = input.id || `HSE-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`;
    const existingIdx = this.houses.findIndex((h) => h.id === id);
    const prev = existingIdx >= 0 ? this.houses[existingIdx] : undefined;

    // Protect verified survey records from silent downgrade unless explicit verification change occurs
    const nextStatus =
      prev?.surveyStatus === 'Verified' && input.surveyStatus === 'Unvisited'
        ? prev.surveyStatus
        : input.surveyStatus;

    const saved: HouseMasterRecord = {
      ...input,
      id,
      linkedCustomerIds: input.linkedCustomerIds ?? prev?.linkedCustomerIds ?? [],
      consentTimestamp:
        input.consentCaptured && !prev?.consentTimestamp
          ? now
          : input.consentTimestamp ?? prev?.consentTimestamp,
      surveyStatus: nextStatus,
      createdAt: prev?.createdAt || now,
      updatedAt: now,
    };

    if (existingIdx >= 0) {
      this.houses[existingIdx] = saved;
    } else {
      this.houses.unshift(saved);
    }
    this.saveAndNotify();
    return saved;
  }

  // GPS CAPTURE WITH EXPLICIT PERMISSION HANDLING
  public captureSurveyGps(): Promise<{
    gpsStatus: DoorstepSurveyRecord['gpsStatus'];
    latitude?: number;
    longitude?: number;
    accuracyMeters?: number;
    message: string;
  }> {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        resolve({
          gpsStatus: 'UNAVAILABLE',
          message: 'Device GPS geolocation API unavailable; manual landmark fallback active.',
        });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            gpsStatus: 'CAPTURED',
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            accuracyMeters: Math.round(pos.coords.accuracy),
            message: `GPS locked (±${Math.round(pos.coords.accuracy)}m)`,
          });
        },
        (err) => {
          const denied = err.code === 1;
          resolve({
            gpsStatus: denied ? 'DENIED' : 'UNAVAILABLE',
            message: denied
              ? 'Location permission denied by browser/device. Survey continues cleanly without blocking.'
              : 'GPS signal timeout/unavailable. Saved without coordinates.',
          });
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
      );
    });
  }

  // SURVEY DRAFTS (OFFLINE / LOW-NETWORK PERSISTENCE)
  public saveDraft(key: string, draft: Partial<DoorstepSurveyRecord>): void {
    this.drafts[key] = { ...draft, isDraft: true, updatedAt: new Date().toISOString() };
    this.saveAndNotify();
  }

  public getDraft(key: string): Partial<DoorstepSurveyRecord> | undefined {
    return this.drafts[key];
  }

  public clearDraft(key: string): void {
    if (this.drafts[key]) {
      delete this.drafts[key];
      this.saveAndNotify();
    }
  }

  // DOORSTEP SURVEY 7-STAGE WORKFLOW
  public getSurveys(viewer?: StaffProfile | null): DoorstepSurveyRecord[] {
    if (!viewer || !staffPermissionService.isPostmanOrGds(viewer)) {
      return this.surveys;
    }
    return this.surveys.filter(
      (s) =>
        s.assignedStaffId === viewer.id ||
        s.assignedStaffId === viewer.employeeId ||
        staffPermissionService.matchesUserBeatScope(viewer, {
          beatNo: s.beatNo,
          colonyName: s.colony,
        })
    );
  }

  public createOrSubmitSurvey(
    payload: Omit<DoorstepSurveyRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    draftKeyToClear?: string
  ): DoorstepSurveyRecord {
    const now = new Date().toISOString();
    const id = payload.id || `SRV-${Date.now().toString(36).toUpperCase()}`;
    const existingIdx = this.surveys.findIndex((s) => s.id === id);

    const resolvedStatus: DoorstepSurveyStatus = payload.isDraft
      ? 'In Progress'
      : payload.status === 'Submitted'
      ? 'Verification Pending'
      : payload.status;

    const saved: DoorstepSurveyRecord = {
      ...payload,
      id,
      status: resolvedStatus,
      submittedAt:
        !payload.isDraft && !payload.submittedAt ? now : payload.submittedAt,
      createdAt: existingIdx >= 0 ? this.surveys[existingIdx].createdAt : now,
      updatedAt: now,
    };

    if (existingIdx >= 0) {
      this.surveys[existingIdx] = saved;
    } else {
      this.surveys.unshift(saved);
    }

    // Sync House Master status cleanly via shared houseId
    const hIdx = this.houses.findIndex((h) => h.id === saved.houseId);
    if (hIdx >= 0) {
      this.houses[hIdx] = {
        ...this.houses[hIdx],
        surveyStatus: resolvedStatus,
        lastSurveyId: saved.id,
        consentCaptured: saved.consentCaptured || this.houses[hIdx].consentCaptured,
        consentTimestamp:
          saved.consentCaptured && !this.houses[hIdx].consentTimestamp
            ? now
            : this.houses[hIdx].consentTimestamp,
        latitude: saved.latitude ?? this.houses[hIdx].latitude,
        longitude: saved.longitude ?? this.houses[hIdx].longitude,
        updatedAt: now,
      };
    }

    if (draftKeyToClear) {
      delete this.drafts[draftKeyToClear];
    }
    this.saveAndNotify();
    return saved;
  }

  public transitionSurveyStatus(
    surveyId: string,
    nextStatus: DoorstepSurveyStatus,
    actor: StaffProfile | null | undefined,
    remarks?: string
  ): { success: boolean; message: string; record?: DoorstepSurveyRecord } {
    const idx = this.surveys.findIndex((s) => s.id === surveyId);
    if (idx < 0) return { success: false, message: 'Survey record not found.' };

    if (
      (nextStatus === 'Verified' ||
        nextStatus === 'Rejected/Correction Required' ||
        nextStatus === 'Completed') &&
      !this.canSupervisorVerifySurvey(actor)
    ) {
      return {
        success: false,
        message: 'Only authorized supervisors/postmasters/admins can verify or reject surveys.',
      };
    }

    const now = new Date().toISOString();
    const updated: DoorstepSurveyRecord = {
      ...this.surveys[idx],
      status: nextStatus,
      isDraft: nextStatus === 'In Progress',
      correctionRemarks:
        nextStatus === 'Rejected/Correction Required'
          ? remarks || 'Correction requested by supervisor'
          : this.surveys[idx].correctionRemarks,
      verifiedBy:
        nextStatus === 'Verified' || nextStatus === 'Completed'
          ? actor?.name || 'Supervisor'
          : this.surveys[idx].verifiedBy,
      verifiedAt:
        nextStatus === 'Verified' || nextStatus === 'Completed'
          ? now
          : this.surveys[idx].verifiedAt,
      updatedAt: now,
    };

    this.surveys[idx] = updated;

    const hIdx = this.houses.findIndex((h) => h.id === updated.houseId);
    if (hIdx >= 0) {
      this.houses[hIdx] = {
        ...this.houses[hIdx],
        surveyStatus: nextStatus,
        lastVerifiedBy: updated.verifiedBy,
        lastVerifiedAt: updated.verifiedAt,
        updatedAt: now,
      };
    }

    this.saveAndNotify();
    return { success: true, message: `Survey moved to "${nextStatus}".`, record: updated };
  }

  public exportState() {
    return {
      streets: this.streets,
      houses: this.houses,
      surveys: this.surveys,
      drafts: this.drafts,
    };
  }

  public restoreState(bundle: {
    streets?: StreetMasterRecord[];
    houses?: HouseMasterRecord[];
    surveys?: DoorstepSurveyRecord[];
    drafts?: Record<string, Partial<DoorstepSurveyRecord>>;
  }): void {
    if (Array.isArray(bundle.streets)) this.streets = bundle.streets;
    if (Array.isArray(bundle.houses)) this.houses = bundle.houses;
    if (Array.isArray(bundle.surveys)) this.surveys = bundle.surveys;
    if (bundle.drafts) this.drafts = bundle.drafts;
    this.saveAndNotify();
  }
}

export const locationSurveyService = new LocationSurveyService();
