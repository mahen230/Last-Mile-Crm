import React, { useState, useEffect } from 'react';
import { Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import { X, AlertTriangle, MapPin, Sparkles } from 'lucide-react';
import { normalizeMobile } from '../../data/initialMasterData';
import { UPDATED_STAFF_LIST } from '../../data/updatedStaffData';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { staffPermissionService } from '../../services/staffPermissionService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
  onSaved?: (customer: Customer) => void;
  onLinkToExisting?: (customer: Customer) => void;
}

export default function AddCustomerModal({
  isOpen,
  onClose,
  customerToEdit,
  onSaved,
}: Props) {
  const { userProfile } = useAuth();
  const defaultBeatNo =
    userProfile?.beat && userProfile.beat !== 'All Beats'
      ? userProfile.beat.replace('Beat ', '')
      : '2';

  const [formData, setFormData] = useState<
    Partial<
      Customer & {
        postmanName?: string;
        postmanPhone?: string;
        landmark?: string;
        pincode?: string;
        subOfficeMapping?: string;
      }
    >
  >({
    name: '',
    mobile: '',
    whatsapp: '',
    alternateMobile: '',
    fatherHusbandName: '',
    occupation: '',
    area: 'Keshavpura',
    sector: 'Sector 7',
    landmark: '',
    pincode: '324009',
    subOfficeMapping: 'Dadabari SO',
    houseNo: '',
    beatNo: defaultBeatNo,
    officeId: 'DADABARI_SO',
    verificationStatus: 'Field Confirmed',
    financialInterest: '',
    remarks: '',
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ mobile?: string }>({});
  const [autoMappedNotice, setAutoMappedNotice] = useState<string | null>(null);

  const quotaCheck = userProfile
    ? staffPermissionService.canUserEnterRecord(userProfile.email)
    : { allowed: true, limit: 0, todayCount: 0 };

  // Automatic Colony + Sector -> Beat, Pincode & Sub Office Mapping Engine
  useEffect(() => {
    if (!formData.area && !formData.sector) return;
    const matched = staffPermissionService.resolveColonyBeat(
      formData.area || '',
      formData.sector || '',
      formData.pincode || '324009'
    );
    if (matched) {
      const cleanBeat = matched.assignedBeatNumber.replace(/^Beat\s+/i, '').trim();
      setFormData((prev) => ({
        ...prev,
        beatNo: cleanBeat || prev.beatNo,
        pincode: matched.areaPincode || prev.pincode || '324009',
        subOfficeMapping: matched.subOrHeadOffice || prev.subOfficeMapping || 'Dadabari SO',
        landmark: prev.landmark || matched.landmark || '',
        postmanName: matched.assignedPostmanName || prev.postmanName || 'Mahendra Kumar Meena',
        postmanPhone: matched.assignedPostmanMobile || prev.postmanPhone || '8769706002',
      }));
      setAutoMappedNotice(
        `Auto-Mapped: ${matched.colonyName}${matched.sectorOrPhase ? ` (${matched.sectorOrPhase})` : ''} → ${matched.assignedBeatNumber} • ${matched.subOrHeadOffice} (${matched.areaPincode})`
      );
    } else {
      const staff = UPDATED_STAFF_LIST.find((s) => s.beat === `Beat ${formData.beatNo}`);
      if (staff) {
        setFormData((prev) => ({
          ...prev,
          postmanName: staff.name,
          postmanPhone: staff.contact,
        }));
      }
      setAutoMappedNotice(null);
    }
  }, [formData.area, formData.sector]);

  useEffect(() => {
    const newErrors: { mobile?: string } = {};
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits.';
    }
    setErrors(newErrors);
  }, [formData.mobile]);

  const isFormValid = formData.name && formData.mobile && !errors.mobile;

  useEffect(() => {
    if (customerToEdit) {
      setFormData({
        ...customerToEdit,
        name: customerToEdit.name || '',
        mobile: customerToEdit.mobile || '',
        whatsapp: customerToEdit.whatsapp || '',
        alternateMobile: customerToEdit.alternateMobile || '',
        fatherHusbandName: customerToEdit.fatherHusbandName || '',
        occupation: customerToEdit.occupation || '',
        area: customerToEdit.area || customerToEdit.address?.area || 'Keshavpura',
        sector: customerToEdit.sector || customerToEdit.address?.sectorLocality || '',
        landmark: customerToEdit.address?.landmark || '',
        pincode: customerToEdit.address?.pincode || '324009',
        subOfficeMapping: 'Dadabari SO',
        houseNo: customerToEdit.houseNo || customerToEdit.address?.houseNumber || '',
        beatNo: customerToEdit.beatNo || '2',
        officeId: customerToEdit.officeId || 'DADABARI_SO',
        verificationStatus: customerToEdit.verificationStatus || 'Field Confirmed',
        financialInterest: customerToEdit.financialInterest || '',
        remarks: customerToEdit.remarks || '',
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        name: '',
        mobile: '',
        whatsapp: '',
        alternateMobile: '',
        fatherHusbandName: '',
        occupation: '',
        houseNo: '',
        area: 'Keshavpura',
        sector: 'Sector 7',
        landmark: '',
        pincode: '324009',
        subOfficeMapping: 'Dadabari SO',
        beatNo: defaultBeatNo,
        officeId: 'DADABARI_SO',
        verificationStatus: 'Field Confirmed',
        financialInterest: '',
        remarks: '',
      }));
    }
  }, [customerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSaving(true);
    const norm = normalizeMobile(formData.mobile!);
    const pin = formData.pincode || '324009';
    const so = formData.subOfficeMapping || 'Dadabari SO';
    const fullAddr = `${formData.houseNo ? formData.houseNo + ', ' : ''}${
      formData.sector ? formData.sector + ', ' : ''
    }${formData.area || 'Keshavpura'}${
      formData.landmark ? ` (Near ${formData.landmark})` : ''
    }, ${so} - ${pin}`;

    // Also register/sync this Colony-Sector-Beat mapping in the Colony-Beat Mapping Engine
    if (formData.area) {
      staffPermissionService.addOrUpdateColonyMapping({
        colonyName: formData.area,
        sectorOrPhase: formData.sector || undefined,
        landmark: formData.landmark || undefined,
        areaPincode: pin,
        subOrHeadOffice: so,
        assignedBeatNumber: `Beat ${String(formData.beatNo || '2').replace(/^Beat\s+/i, '')}`,
        assignedPostmanName: formData.postmanName,
        assignedPostmanMobile: formData.postmanPhone,
      });
    }

    const customerPayload: Partial<Customer> = {
      ...formData,
      mobile: norm,
      whatsapp: formData.whatsapp ? normalizeMobile(formData.whatsapp) : norm,
      address: {
        houseNumber: formData.houseNo || '',
        sectorLocality: formData.sector || formData.area || 'Keshavpura',
        area: formData.area || 'Keshavpura',
        landmark: formData.landmark || '',
        pincode: pin,
        fullAddress: fullAddr,
      },
    };

    if (!customerToEdit && !quotaCheck.allowed) {
      setSaving(false);
      return;
    }

    if (customerToEdit) {
      customerPayload.id = customerToEdit.id;
      customerPayload.masterId = customerToEdit.masterId;
    } else if (userProfile) {
      customerPayload.enteredBy = userProfile.email;
      customerPayload.enteredByName = userProfile.name;
      customerPayload.assignedStaffId = userProfile.id;
      customerPayload.assignedStaffName = userProfile.name;
      customerPayload.assignedStaffEmail = userProfile.email;
    }

    const res = customerService.addOrUpdateCustomer(
      customerPayload,
      customerToEdit ? 'CRM Customer Edit' : 'CRM Structured Colony-Beat Customer Entry'
    );

    setSaving(false);
    if (onSaved) onSaved(res.customer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-black text-lg text-slate-900">
              {customerToEdit
                ? `Edit Customer: ${customerToEdit.name} (${customerToEdit.masterId || customerToEdit.id})`
                : 'Add New Customer with Structured Colony-Beat Routing'}
            </h3>
            {userProfile && !customerToEdit && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                Staff: <span className="font-semibold text-slate-700">{userProfile.name}</span> • Beat:{' '}
                <span className="font-semibold text-slate-700">{userProfile.beat}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {!customerToEdit && !quotaCheck.allowed && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{quotaCheck.reason}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Number (10 Digits) *</label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className={`w-full p-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-red-600 ${
                  errors.mobile ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.mobile && <p className="text-red-600 text-[10px] mt-1">{errors.mobile}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alternate / Landline</label>
              <input
                type="tel"
                value={formData.alternateMobile}
                onChange={(e) => setFormData({ ...formData, alternateMobile: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Father / Husband Name</label>
              <input
                type="text"
                value={formData.fatherHusbandName}
                onChange={(e) => setFormData({ ...formData, fatherHusbandName: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Structured Address & Colony-Beat Mapping Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-black text-slate-900 flex items-center gap-1.5">
                <MapPin size={15} className="text-red-700" />
                <span>Structured Address & Colony-Beat Mapping Engine</span>
              </div>
              {autoMappedNotice && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                  <Sparkles size={11} /> {autoMappedNotice}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">House / Plot / KH No.</label>
                <input
                  type="text"
                  placeholder="e.g. 412-A"
                  value={formData.houseNo}
                  onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Colony Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Keshavpura / Patel Nagar"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sector Number / Phase</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 7 / Phase 2"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Landmark</label>
                <input
                  type="text"
                  placeholder="Near Tejaji Mandir"
                  value={formData.landmark || ''}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Area Pincode *</label>
                <input
                  type="text"
                  required
                  value={formData.pincode || '324009'}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sub Office / HO Mapping *</label>
                <input
                  type="text"
                  required
                  value={formData.subOfficeMapping || 'Dadabari SO'}
                  onChange={(e) => setFormData({ ...formData, subOfficeMapping: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Beat Number *</label>
                <select
                  value={formData.beatNo}
                  onChange={(e) => setFormData({ ...formData, beatNo: e.target.value })}
                  className="w-full p-2.5 border border-red-300 rounded-xl text-xs bg-red-50 font-black text-red-800"
                >
                  {Array.from({ length: 33 }, (_, i) => i + 1).map((b) => (
                    <option key={b} value={b}>
                      Beat {b}
                    </option>
                  ))}
                  <option value="BO">Mandaliya BO</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Financial / Postal Scheme Interest</label>
              <input
                type="text"
                placeholder="PLI, SSA, IPPB, POSB..."
                value={formData.financialInterest}
                onChange={(e) => setFormData({ ...formData, financialInterest: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Remarks & Field Notes</label>
              <input
                type="text"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !isFormValid}
              className={`px-5 py-2 text-white font-black rounded-xl text-xs shadow-xs ${
                saving || !isFormValid ? 'bg-slate-400 cursor-not-allowed' : 'bg-red-700 hover:bg-red-800'
              }`}
            >
              {saving ? 'Processing...' : customerToEdit ? 'Save Changes' : 'Confirm & Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
