import React, { useState, useEffect, useMemo } from 'react';
import { Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import { X, AlertTriangle, MapPin, Sparkles, Layers } from 'lucide-react';
import { normalizeMobile } from '../../data/initialMasterData';
import { UPDATED_STAFF_LIST } from '../../data/updatedStaffData';
import { KOTA_POST_OFFICE_OPTIONS } from '../../data/officesData';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { staffPermissionService } from '../../services/staffPermissionService';
import { 
  OFFICIAL_MAJOR_COLONIES,
  getHierarchyColoniesList,
  getHierarchySectorsForColony,
  resolveColonySectorDetails
} from '../../data/colonyHierarchyData';
import {
  getAuditedPincodeForColony,
  normalizeAndCleanColony,
  isSector6House3Or4
} from '../../utils/dataAuditNormalization';

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
  const isAdminUser =
    userProfile?.role === 'SUPER_ADMIN' ||
    userProfile?.role === 'ADMIN' ||
    userProfile?.beat === 'All Beats';
  const defaultBeatNo =
    userProfile?.beat && userProfile.beat !== 'All Beats'
      ? userProfile.beat.replace(/^Beat\s+/i, '').trim()
      : '2';
  const defaultSubOffice = userProfile?.subOffice || userProfile?.assignedOffice || 'Dadabari S.O.';
  const defaultPincode = userProfile?.officePincode || '324009';

  const [formData, setFormData] = useState<
    Partial<
      Customer & {
        colony?: string;
        sector?: string;
        block?: string;
        houseNo?: string;
        postmanName?: string;
        postmanPhone?: string;
        street?: string;
        landmark?: string;
        pincode?: string;
        subOfficeMapping?: string;
        sameAsResidential?: boolean;
        permHouseNo?: string;
        permStreet?: string;
        permLandmark?: string;
        permArea?: string;
        permPincode?: string;
      }
    >
  >({
    name: '',
    mobile: '',
    whatsapp: '',
    alternateMobile: '',
    fatherHusbandName: '',
    occupation: '',
    colony: 'Keshavpura',
    area: 'Keshavpura',
    sector: 'Sector 7',
    block: 'Sector 7',
    street: '',
    landmark: '',
    pincode: defaultPincode,
    subOfficeMapping: defaultSubOffice,
    houseNo: '',
    sameAsResidential: true,
    permHouseNo: '',
    permStreet: '',
    permLandmark: '',
    permArea: 'Keshavpura',
    permPincode: defaultPincode,
    beatNo: defaultBeatNo,
    officeId: userProfile?.officeId || 'DADABARI_SO',
    verificationStatus: 'Field Confirmed',
    financialInterest: '',
    remarks: '',
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ mobile?: string }>({});
  const [autoMappedNotice, setAutoMappedNotice] = useState<string | null>(null);
  const [isCustomColony, setIsCustomColony] = useState(false);
  const [isCustomSector, setIsCustomSector] = useState(false);
  const [isCustomBlock, setIsCustomBlock] = useState(false);
  const [customBlockText, setCustomBlockText] = useState('');

  const quotaCheck = userProfile
    ? staffPermissionService.canUserEnterRecord(userProfile.email)
    : { allowed: true, limit: 0, todayCount: 0 };

  const currentActiveColony = formData.colony || formData.area || 'Keshavpura';

  const sectorOptions = useMemo(() => {
    const rawSectors = getHierarchySectorsForColony(currentActiveColony);
    return [...rawSectors, 'Not Applicable / Not Available'];
  }, [currentActiveColony]);

  const blockOptions = useMemo(() => {
    const col = currentActiveColony;
    const sec = formData.sector || '';
    const list: string[] = ['Not Applicable / None'];

    if (col === 'Keshavpura') {
      list.push('Sector 6 Block', 'Sector 7 Block', 'KH Series', 'UIT Series', 'Chhoti Basti', 'Main Market');
    } else if (col === 'Santoshi Nagar') {
      list.push('Block A', 'Block B', 'Phase 1', 'Phase 2', 'Nala Road', 'Main Road');
    } else if (col === 'Mahaveer Nagar') {
      list.push('Extension 1', 'Extension 2', 'Pocket A', 'Pocket B', 'Commercial Belt');
    } else if (col === 'Talwandi') {
      list.push('Sector A', 'Sector B', 'Block 1', 'Block 2', 'Commerce Center');
    } else if (col === 'Vigyan Nagar') {
      list.push('Block A', 'Block B', 'Block C', 'Block D', 'Industrial Belt');
    } else if (col === 'Shreenathpuram') {
      list.push('Sector A', 'Sector B', 'Sector C', 'Sector D');
    } else if (col === 'RK Puram') {
      list.push('Block A', 'Block B', 'Main Road');
    } else {
      list.push('Block A', 'Block B', 'Phase 1', 'Phase 2', 'Main Street');
    }

    if (sec && !list.includes(sec) && sec !== 'Not Applicable / Not Available') {
      list.push(sec);
    }
    return list;
  }, [currentActiveColony, formData.sector]);

  const handleColonyChange = (newColony: string) => {
    if (newColony === '__custom__') {
      setIsCustomColony(true);
      setFormData((prev) => ({ ...prev, colony: '', area: '' }));
      return;
    }
    setIsCustomColony(false);
    const sectors = getHierarchySectorsForColony(newColony);
    const defaultSector = sectors[0] || 'Not Applicable / Not Available';
    setIsCustomSector(false);
    setIsCustomBlock(false);
    setCustomBlockText('');

    const auditedPin = getAuditedPincodeForColony(newColony, defaultSector);
    const details = resolveColonySectorDetails(newColony, defaultSector);
    setFormData((prev) => ({
      ...prev,
      colony: newColony,
      area: newColony,
      sector: defaultSector,
      block: 'Not Applicable / None',
      beatNo: isAdminUser ? details.cleanBeatNo : defaultBeatNo,
      pincode: auditedPin || details.pincode,
      subOfficeMapping: details.subOffice,
      postmanName: isAdminUser ? details.staffName : (userProfile?.name || details.staffName),
      postmanPhone: isAdminUser ? details.staffContact : (userProfile?.contact || details.staffContact),
    }));
    setAutoMappedNotice(
      isAdminUser
        ? details.jurisdictionBadge
        : `Beat-Locked Entry: Beat ${defaultBeatNo} (${userProfile?.name || 'Staff'})`
    );
  };

  const handleSectorChange = (newSector: string) => {
    if (newSector === '__custom__') {
      setIsCustomSector(true);
      setFormData((prev) => ({ ...prev, sector: '' }));
      return;
    }
    setIsCustomSector(false);
    const colony = formData.colony || formData.area || 'Keshavpura';
    const auditedPin = getAuditedPincodeForColony(colony, newSector);
    const details = resolveColonySectorDetails(colony, newSector);
    setFormData((prev) => ({
      ...prev,
      sector: newSector,
      beatNo: isAdminUser ? details.cleanBeatNo : defaultBeatNo,
      pincode: auditedPin || details.pincode,
      subOfficeMapping: details.subOffice,
      postmanName: isAdminUser ? details.staffName : (userProfile?.name || details.staffName),
      postmanPhone: isAdminUser ? details.staffContact : (userProfile?.contact || details.staffContact),
    }));
    setAutoMappedNotice(
      isAdminUser
        ? details.jurisdictionBadge
        : `Beat-Locked Entry: Beat ${defaultBeatNo} (${userProfile?.name || 'Staff'})`
    );
  };

  const handleBlockChange = (newBlock: string) => {
    if (newBlock === '__custom__') {
      setIsCustomBlock(true);
      setFormData((prev) => ({ ...prev, block: '' }));
      return;
    }
    setIsCustomBlock(false);
    setFormData((prev) => ({ ...prev, block: newBlock }));
  };

  // Automatic Colony + Sector -> Beat, Pincode & Sub Office Mapping Engine
  useEffect(() => {
    const colony = formData.colony || formData.area;
    if (!colony && !formData.sector) return;
    const details = resolveColonySectorDetails(colony || 'Keshavpura', formData.sector);
    const auditedPin = getAuditedPincodeForColony(colony || 'Keshavpura', formData.sector);
    setFormData((prev) => ({
      ...prev,
      beatNo: isAdminUser ? details.cleanBeatNo : defaultBeatNo,
      pincode: auditedPin || prev.pincode || details.pincode,
      subOfficeMapping: prev.subOfficeMapping || details.subOffice,
      postmanName: isAdminUser ? details.staffName : (userProfile?.name || details.staffName),
      postmanPhone: isAdminUser ? details.staffContact : (userProfile?.contact || details.staffContact),
    }));
    setAutoMappedNotice(
      isAdminUser
        ? details.jurisdictionBadge
        : `Beat-Locked Entry: Beat ${defaultBeatNo} (${userProfile?.name || 'Staff'})`
    );
  }, [formData.colony, formData.area, formData.sector, isAdminUser, defaultBeatNo]);

  useEffect(() => {
    const newErrors: { mobile?: string } = {};
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits.';
    }
    setErrors(newErrors);
  }, [formData.mobile]);

  const isFormValid = formData.name && formData.mobile && !errors.mobile;

  // Sector 6 House 3 & 4 shared plot check
  const isSector6DhanrajPlot = useMemo(() => {
    return isSector6House3Or4(
      formData.colony || formData.area || '',
      formData.sector || '',
      formData.houseNo || ''
    );
  }, [formData.colony, formData.area, formData.sector, formData.houseNo]);

  useEffect(() => {
    if (customerToEdit) {
      const rawCol = customerToEdit.colony || customerToEdit.area || customerToEdit.address?.colony || customerToEdit.address?.area || 'Keshavpura';
      const cleanCol = normalizeAndCleanColony(rawCol).colony;
      const sec = customerToEdit.sector || customerToEdit.address?.sector || customerToEdit.address?.sectorLocality || '';
      const blk = customerToEdit.block || customerToEdit.address?.block || '';
      const hNo = customerToEdit.houseNo || customerToEdit.address?.houseNo || customerToEdit.address?.houseNumber || '';
      const pin = customerToEdit.pincode || customerToEdit.address?.pincode || getAuditedPincodeForColony(cleanCol, sec);

      setFormData({
        ...customerToEdit,
        name: customerToEdit.name || '',
        mobile: customerToEdit.mobile || '',
        whatsapp: customerToEdit.whatsapp || '',
        alternateMobile: customerToEdit.alternateMobile || '',
        fatherHusbandName: customerToEdit.fatherHusbandName || '',
        occupation: customerToEdit.occupation || '',
        colony: cleanCol,
        area: cleanCol,
        sector: sec,
        block: blk,
        houseNo: hNo,
        street: customerToEdit.street || customerToEdit.residentialAddress?.street || customerToEdit.address?.street || '',
        landmark: customerToEdit.landmark || customerToEdit.residentialAddress?.landmark || customerToEdit.address?.landmark || '',
        pincode: pin,
        subOfficeMapping: customerToEdit.subOfficeMapping || 'Dadabari S.O.',
        sameAsResidential: customerToEdit.sameAsResidential ?? true,
        permHouseNo: customerToEdit.permanentAddress?.houseNo || customerToEdit.permanentAddress?.houseNumber || hNo,
        permStreet: customerToEdit.permanentAddress?.street || customerToEdit.street || '',
        permLandmark: customerToEdit.permanentAddress?.landmark || customerToEdit.landmark || '',
        permArea: customerToEdit.permanentAddress?.area || cleanCol,
        permPincode: customerToEdit.permanentAddress?.pincode || pin,
        beatNo: customerToEdit.beatNo || '2',
        officeId: customerToEdit.officeId || 'DADABARI_SO',
        verificationStatus: customerToEdit.verificationStatus || 'Field Confirmed',
        financialInterest: customerToEdit.financialInterest || '',
        remarks: customerToEdit.remarks || '',
      });
    } else {
      const defaultCol = 'Keshavpura';
      const defaultSec = 'Sector 7';
      const defaultPin = getAuditedPincodeForColony(defaultCol, defaultSec);
      setFormData((prev) => ({
        ...prev,
        name: '',
        mobile: '',
        whatsapp: '',
        alternateMobile: '',
        fatherHusbandName: '',
        occupation: '',
        colony: defaultCol,
        area: defaultCol,
        sector: defaultSec,
        block: 'Sector 7 Block',
        houseNo: '',
        street: '',
        landmark: '',
        pincode: defaultPin,
        subOfficeMapping: 'Dadabari S.O.',
        sameAsResidential: true,
        permHouseNo: '',
        permStreet: '',
        permLandmark: '',
        permArea: defaultCol,
        permPincode: defaultPin,
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
    const rawColony = formData.colony || formData.area || 'Keshavpura';
    const colonyClean = normalizeAndCleanColony(rawColony).colony;
    const sectorClean = formData.sector && formData.sector !== 'Not Applicable / Not Available' ? formData.sector : '';
    const blockClean = formData.block && formData.block !== 'Not Applicable / None' ? formData.block : '';
    const houseNoClean = formData.houseNo ? formData.houseNo.trim() : '';

    const pin = getAuditedPincodeForColony(colonyClean, `${sectorClean} ${blockClean}`) || formData.pincode || '324009';
    const so = formData.subOfficeMapping || 'Dadabari S.O.';

    const fullAddr = `${houseNoClean ? houseNoClean + ', ' : ''}${
      blockClean ? blockClean + ', ' : ''
    }${formData.street ? formData.street + ', ' : ''}${
      sectorClean ? sectorClean + ', ' : ''
    }${colonyClean}${
      formData.landmark ? ` (Near ${formData.landmark})` : ''
    }, ${so} - ${pin}`;

    // Also register/sync this Colony-Sector-Beat mapping in the Colony-Beat Mapping Engine
    if (colonyClean) {
      staffPermissionService.addOrUpdateColonyMapping({
        colonyName: colonyClean,
        sectorOrPhase: sectorClean || undefined,
        landmark: formData.landmark || undefined,
        areaPincode: pin,
        subOrHeadOffice: so,
        assignedBeatNumber: `Beat ${String(formData.beatNo || '2').replace(/^Beat\s+/i, '')}`,
        assignedPostmanName: formData.postmanName,
        assignedPostmanMobile: formData.postmanPhone,
      });
    }

    const resAddressObj = {
      colony: colonyClean,
      sector: sectorClean,
      block: blockClean,
      houseNo: houseNoClean,
      houseNumber: houseNoClean,
      street: formData.street || '',
      sectorLocality: sectorClean || colonyClean,
      area: colonyClean,
      landmark: formData.landmark || '',
      pincode: pin,
      fullAddress: fullAddr,
    };

    const permAddressObj = formData.sameAsResidential
      ? { ...resAddressObj }
      : {
          colony: formData.permArea || colonyClean,
          sector: sectorClean,
          block: blockClean,
          houseNo: formData.permHouseNo || houseNoClean,
          houseNumber: formData.permHouseNo || houseNoClean,
          street: formData.permStreet || '',
          sectorLocality: formData.permArea || colonyClean,
          area: formData.permArea || colonyClean,
          landmark: formData.permLandmark || '',
          pincode: formData.permPincode || pin,
          fullAddress: `${formData.permHouseNo ? formData.permHouseNo + ', ' : ''}${
            formData.permStreet ? formData.permStreet + ', ' : ''
          }${formData.permArea || colonyClean}${
            formData.permLandmark ? ` (Near ${formData.permLandmark})` : ''
          } - ${formData.permPincode || pin}`,
        };

    const customerPayload: Partial<Customer> = {
      ...formData,
      colony: colonyClean,
      area: colonyClean,
      sector: sectorClean,
      block: blockClean,
      houseNo: houseNoClean,
      mobile: norm,
      whatsapp: formData.whatsapp ? normalizeMobile(formData.whatsapp) : norm,
      street: formData.street || '',
      landmark: formData.landmark || '',
      pincode: pin,
      subOfficeMapping: so,
      sameAsResidential: formData.sameAsResidential ?? true,
      residentialAddress: resAddressObj,
      permanentAddress: permAddressObj,
      address: resAddressObj,
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Occupation (व्यवसाय / पेशा)</label>
              <input
                type="text"
                placeholder="e.g. Government Service, Business, Retired, Farmer"
                value={formData.occupation || ''}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          {/* Structured Address & Colony-Beat Mapping Section (Strict Hierarchy: Colony -> Sector -> Block -> House No) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-black text-slate-900 flex items-center gap-1.5">
                <MapPin size={15} className="text-red-700" />
                <span>Hierarchical Address Architecture (Colony ➔ Sector ➔ Block ➔ House No.)</span>
              </div>
              {autoMappedNotice && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                  <Sparkles size={11} /> {autoMappedNotice}
                </span>
              )}
            </div>

            {/* Strict 4-Step Address Hierarchy Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200">
              {/* Step 1: Colony Name (Primary Dropdown) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-black text-slate-800 text-[11px]">
                    1. Colony Name *
                  </label>
                  {!isCustomColony ? (
                    <button
                      type="button"
                      onClick={() => setIsCustomColony(true)}
                      className="text-[10px] text-red-600 hover:underline font-bold"
                    >
                      + Custom
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomColony(false);
                        handleColonyChange('Keshavpura');
                      }}
                      className="text-[10px] text-slate-600 hover:underline font-bold"
                    >
                      ← Mapped List
                    </button>
                  )}
                </div>
                {isCustomColony ? (
                  <input
                    type="text"
                    required
                    placeholder="Type custom colony name..."
                    value={formData.colony || formData.area || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({ ...prev, colony: val, area: val }));
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-red-600"
                  />
                ) : (
                  <select
                    value={formData.colony || formData.area || 'Keshavpura'}
                    onChange={(e) => handleColonyChange(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-red-600"
                  >
                    <optgroup label="Official Major Colonies (Dadabari S.O. 324009)">
                      {OFFICIAL_MAJOR_COLONIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
                    <option value="__custom__">✍️ Custom Colony / Other...</option>
                  </select>
                )}
              </div>

              {/* Step 2: Sector / Sub-Sector (Dynamic Dropdown based on Colony) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-black text-slate-800 text-[11px]">
                    2. Sector / Sub-Sector
                  </label>
                  {!isCustomSector ? (
                    <button
                      type="button"
                      onClick={() => setIsCustomSector(true)}
                      className="text-[10px] text-red-600 hover:underline font-bold"
                    >
                      + Custom
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomSector(false);
                        const first = sectorOptions[0] || 'Not Applicable / Not Available';
                        handleSectorChange(first);
                      }}
                      className="text-[10px] text-slate-600 hover:underline font-bold"
                    >
                      ← Mapped List
                    </button>
                  )}
                </div>
                {isCustomSector ? (
                  <input
                    type="text"
                    placeholder="e.g. Sector 6 / Sector 7"
                    value={formData.sector || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({ ...prev, sector: val }));
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-red-600"
                  />
                ) : (
                  <select
                    value={formData.sector || (sectorOptions[0] || 'Not Applicable / Not Available')}
                    onChange={(e) => handleSectorChange(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-red-600"
                  >
                    {sectorOptions.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                    <option value="__custom__">✍️ Custom Sector...</option>
                  </select>
                )}
              </div>

              {/* Step 3: Block / Phase (Dedicated Selector / Input) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-black text-slate-800 text-[11px]">
                    3. Block / Phase
                  </label>
                  {!isCustomBlock ? (
                    <button
                      type="button"
                      onClick={() => setIsCustomBlock(true)}
                      className="text-[10px] text-red-600 hover:underline font-bold"
                    >
                      + Custom
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomBlock(false);
                        handleBlockChange('Not Applicable / None');
                      }}
                      className="text-[10px] text-slate-600 hover:underline font-bold"
                    >
                      ← Mapped List
                    </button>
                  )}
                </div>
                {isCustomBlock ? (
                  <input
                    type="text"
                    placeholder="e.g. Block A, KH Series, Phase 1"
                    value={formData.block || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({ ...prev, block: val }));
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-red-600"
                  />
                ) : (
                  <select
                    value={formData.block || 'Not Applicable / None'}
                    onChange={(e) => handleBlockChange(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-red-600"
                  >
                    {blockOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    <option value="__custom__">✍️ Custom Block / Phase...</option>
                  </select>
                )}
              </div>

              {/* Step 4: House / Plot / KH Number (Final Identifier) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-black text-slate-800 text-[11px]">
                    4. House / Plot / KH No. *
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Identifier</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. 412, KH-14, 3 & 4"
                  value={formData.houseNo || ''}
                  onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            {/* Street & Landmark Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street / Gali / Lane</label>
                <input
                  type="text"
                  placeholder="e.g. Main Market Road / Gali No. 3"
                  value={formData.street || ''}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Landmark (नजदीकी पहचान)</label>
                <input
                  type="text"
                  placeholder="e.g. Near Tejaji Mandir / Behind Govt School"
                  value={formData.landmark || ''}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Sector 6 House 3 & 4 Joint Property Notice */}
            {isSector6DhanrajPlot && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs flex items-start gap-2 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-indigo-950">
                    Joint Plot Linked: House No. 3 & 4 (Sector 6, Keshavpura)
                  </p>
                  <p className="text-[11px] text-indigo-800 mt-0.5">
                    Recognized as common shared property owned by <strong>Dhanraj Bairwa</strong> under Dadabari S.O. Beat 2. Duplicate validation conflict is waived for linked residents.
                  </p>
                </div>
              </div>
            )}

            {/* Live Jurisdiction & Beat Assignment Badge */}
            <div className="p-2.5 bg-amber-50/90 rounded-xl border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-700 text-white tracking-wide uppercase">
                  Beat {formData.beatNo}
                </span>
                <span className="font-bold text-slate-800">
                  {formData.colony || formData.area || 'Colony'} {formData.sector ? `• ${formData.sector}` : ''} {formData.block && formData.block !== 'Not Applicable / None' ? `(${formData.block})` : ''}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-medium flex items-center gap-2">
                <span>Postman: <strong className="text-slate-900">{formData.postmanName || 'Assigned Staff'}</strong></span>
                <span>•</span>
                <span>PIN: <strong className="font-mono text-slate-900">{formData.pincode || '324009'}</strong></span>
                <span>•</span>
                <span>SO: <strong className="text-slate-900">{formData.subOfficeMapping || 'Dadabari S.O.'}</strong></span>
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
                  list="kota-so-list"
                  required
                  value={formData.subOfficeMapping || defaultSubOffice}
                  onChange={(e) => {
                    const val = e.target.value;
                    const matchedOpt = KOTA_POST_OFFICE_OPTIONS.find(
                      (o) => o.officeName.toLowerCase() === val.toLowerCase() || o.postOfficeName.toLowerCase() === val.toLowerCase()
                    );
                    setFormData({
                      ...formData,
                      subOfficeMapping: val,
                      pincode: matchedOpt ? matchedOpt.pincode : formData.pincode,
                    });
                  }}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                />
                <datalist id="kota-so-list">
                  {KOTA_POST_OFFICE_OPTIONS.map((opt) => (
                    <option key={opt.officeId} value={opt.officeName}>
                      {opt.pincode} • {opt.mappedColonies.slice(0, 3).join(', ')}
                    </option>
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assigned Beat Number * {!isAdminUser && <span className="text-[9px] text-red-700">(Locked)</span>}
                </label>
                <select
                  value={formData.beatNo}
                  disabled={!isAdminUser}
                  onChange={(e) => setFormData({ ...formData, beatNo: e.target.value })}
                  className="w-full p-2.5 border border-red-300 rounded-xl text-xs bg-red-50 font-black text-red-800 disabled:opacity-80 disabled:cursor-not-allowed"
                >
                  {Array.from({ length: 33 }, (_, i) => i + 1).map((b) => (
                    <option key={b} value={b}>
                      Beat {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Permanent vs Residential Address Toggle */}
            <div className="pt-2 border-t border-slate-200 space-y-2.5">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.sameAsResidential ?? true}
                  onChange={(e) =>
                    setFormData({ ...formData, sameAsResidential: e.target.checked })
                  }
                  className="rounded border-slate-300 text-red-700 focus:ring-red-600"
                />
                <span>Permanent Address is same as Current Residential Address</span>
              </label>

              {!formData.sameAsResidential && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5">
                  <div className="text-[11px] font-bold text-red-800">
                    Permanent / Native Address Details (House No, Street, Landmark)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Perm. House No.
                      </label>
                      <input
                        type="text"
                        placeholder="House / Plot"
                        value={formData.permHouseNo || ''}
                        onChange={(e) => setFormData({ ...formData, permHouseNo: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Perm. Street / Lane
                      </label>
                      <input
                        type="text"
                        placeholder="Street / Gali"
                        value={formData.permStreet || ''}
                        onChange={(e) => setFormData({ ...formData, permStreet: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Perm. Landmark
                      </label>
                      <input
                        type="text"
                        placeholder="Landmark"
                        value={formData.permLandmark || ''}
                        onChange={(e) => setFormData({ ...formData, permLandmark: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Perm. Colony / City
                      </label>
                      <input
                        type="text"
                        placeholder="Colony / Village"
                        value={formData.permArea || ''}
                        onChange={(e) => setFormData({ ...formData, permArea: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Perm. Pincode
                      </label>
                      <input
                        type="text"
                        placeholder="324009"
                        value={formData.permPincode || ''}
                        onChange={(e) => setFormData({ ...formData, permPincode: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
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
