import React, { useState, useMemo } from 'react';
import {
  Building2,
  MapPin,
  Users,
  ChevronDown,
  ChevronRight,
  Search,
  CheckCircle2,
  Award,
  Filter,
  Layers,
  ArrowRight,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { staffPermissionService } from '../../services/staffPermissionService';
import { CONSOLIDATED_BEAT_MATRIX } from '../../data/consolidatedBeatMatrix';
import { KOTA_DIVISION_OFFICIAL_PINS } from '../../types/models';

export interface OfficeBeatStaffMappedTreeProps {
  onSelectStaff?: (staffId: string, staff: any) => void;
  onSelectOffice?: (officeName: string, pincode: string) => void;
  onSelectBeat?: (beatNumber: string, officeName?: string, pincode?: string) => void;
  selectedStaffId?: string;
  selectedOfficeName?: string;
  selectedBeat?: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

interface MappedBeatItem {
  beatNumber: string;
  beatName?: string;
  pincode: string;
  parentOffice: string;
  coverageColonies?: string[];
  staffMembers: any[];
}

interface MappedOfficeItem {
  officeId: string;
  officeName: string;
  pincode: string;
  division: string;
  circle: string;
  officeType: 'HO' | 'SO' | 'BO';
  beats: MappedBeatItem[];
  staffCount: number;
}

export default function OfficeBeatStaffMappedTree({
  onSelectStaff,
  onSelectOffice,
  onSelectBeat,
  selectedStaffId,
  selectedOfficeName,
  selectedBeat,
  title = 'Office-Wise Mapped Tree (Offices ➔ Beats ➔ Staff)',
  subtitle = 'Interactive hierarchy linking Kota Division offices, beats, and mapped staff members.',
  compact = false,
}: OfficeBeatStaffMappedTreeProps) {
  // Cascading Universal Search Console State
  const [selectedCircle, setSelectedCircle] = useState<string>('All');
  const [selectedDivision, setSelectedDivision] = useState<string>('All');
  const [selectedOfficeFilter, setSelectedOfficeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tree Expanded Offices state (defaults to primary offices expanded)
  const [expandedOffices, setExpandedOffices] = useState<Record<string, boolean>>({
    'Dadabari S.O.': true,
    'Kota H.O.': true,
    'P.I.P. S.O.': true,
    'Vigyan Nagar S.O.': true,
  });

  const [expandedBeats, setExpandedBeats] = useState<Record<string, boolean>>({
    'Beat 2': true,
    'Beat 1': true,
  });

  const dynamicOffices = useMemo(() => {
    return staffPermissionService.getDynamicOffices();
  }, []);

  const allStaff = useMemo(() => {
    return staffPermissionService.getAllStaffProfiles();
  }, []);

  // Circle options from data
  const circleOptions = useMemo(() => {
    const set = new Set<string>();
    dynamicOffices.forEach((o) => {
      if (o.circle) set.add(o.circle);
    });
    set.add('Rajasthan Circle');
    return ['All', ...Array.from(set)];
  }, [dynamicOffices]);

  // Division options cascading from circle
  const divisionOptions = useMemo(() => {
    const set = new Set<string>();
    dynamicOffices.forEach((o) => {
      if (selectedCircle === 'All' || o.circle === selectedCircle) {
        if (o.division) set.add(o.division);
      }
    });
    set.add('Kota Division');
    set.add('Baran Division');
    return ['All', ...Array.from(set)];
  }, [dynamicOffices, selectedCircle]);

  // Office options cascading from circle & division
  const officeDropdownOptions = useMemo(() => {
    const set = new Set<string>();
    dynamicOffices.forEach((o) => {
      const matchCircle = selectedCircle === 'All' || o.circle === selectedCircle;
      const matchDiv = selectedDivision === 'All' || o.division === selectedDivision;
      if (matchCircle && matchDiv) {
        set.add(o.officeName);
      }
    });
    // Ensure primary offices exist
    set.add('Dadabari S.O.');
    set.add('Kota H.O.');
    set.add('P.I.P. S.O.');
    set.add('Vigyan Nagar S.O.');
    set.add('Borkheda S.O.');
    set.add('Gumanpura S.O.');
    set.add('Kunhari S.O.');
    return ['All', ...Array.from(set)];
  }, [dynamicOffices, selectedCircle, selectedDivision]);

  // Build complete Mapped Tree: Offices -> Beats -> Staff
  const mappedOffices = useMemo(() => {
    const list: MappedOfficeItem[] = [];

    // Map all offices
    dynamicOffices.forEach((off) => {
      const offName = off.officeName.replace(/\s*\(\d{6}\)/g, '').trim();
      const pin = off.pincode || '324009';
      const div = off.division || 'Kota Division';
      const circle = off.circle || 'Rajasthan Circle';

      // Find beats belonging to this office from CONSOLIDATED_BEAT_MATRIX
      const matchedBeatsFromMatrix = CONSOLIDATED_BEAT_MATRIX.filter((b) => {
        const pOffice = (b.parentOffice || '').toLowerCase();
        const pPin = b.pincode || '';
        return pOffice.includes(offName.toLowerCase()) || (pPin && pPin === pin);
      });

      // Find staff mapped to this office
      const officeStaff = allStaff.filter((s) => {
        const staffOff = (s.subOffice || s.assignedOffice || s.postOfficeName || '').toLowerCase();
        const staffPin = s.officePincode || '';
        return staffOff.includes(offName.toLowerCase()) || (staffPin && staffPin === pin);
      });

      // Group staff by beat
      const beatsMap = new Map<string, MappedBeatItem>();

      matchedBeatsFromMatrix.forEach((b) => {
        const beatNum = b.beatNumber;
        const staffForBeat = officeStaff.filter((s) => {
          const sBeat = (s.beat || '').replace(/^Beat\s*/i, '').trim();
          const targetBeat = beatNum.replace(/^Beat\s*/i, '').trim();
          return sBeat === targetBeat || s.assignedBeats?.some((ab) => ab.replace(/^Beat\s*/i, '').trim() === targetBeat);
        });

        beatsMap.set(beatNum, {
          beatNumber: beatNum,
          beatName: b.colonyName || b.beatNumber,
          pincode: b.pincode || pin,
          parentOffice: offName,
          coverageColonies: b.coverageColonies || (b.colonyName ? [b.colonyName] : []),
          staffMembers: staffForBeat,
        });
      });

      // Add extra beats found directly on staff profiles for this office (e.g. Borabas Beat 1, Beat EC-2, Beat 33, etc.)
      officeStaff.forEach((s) => {
        const sBeat = s.beat || 'Beat 1';
        if (!beatsMap.has(sBeat)) {
          beatsMap.set(sBeat, {
            beatNumber: sBeat,
            beatName: `${offName} ${sBeat}`,
            pincode: pin,
            parentOffice: offName,
            coverageColonies: s.assignedColonies || [],
            staffMembers: [s],
          });
        }
      });

      // If office has no beats yet, provide default Beat 1
      if (beatsMap.size === 0) {
        beatsMap.set('Beat 1', {
          beatNumber: 'Beat 1',
          beatName: `${offName} Primary Beat`,
          pincode: pin,
          parentOffice: offName,
          coverageColonies: [],
          staffMembers: officeStaff,
        });
      }

      list.push({
        officeId: off.id || off.officeId,
        officeName: offName,
        pincode: pin,
        division: div,
        circle: circle,
        officeType: off.officeType === 'HO' ? 'HO' : off.officeType === 'BO' ? 'BO' : 'SO',
        beats: Array.from(beatsMap.values()).sort((a, b) => a.beatNumber.localeCompare(b.beatNumber, undefined, { numeric: true })),
        staffCount: officeStaff.length,
      });
    });

    return list;
  }, [dynamicOffices, allStaff]);

  // Filtered offices based on search console
  const filteredOffices = useMemo(() => {
    return mappedOffices.filter((off) => {
      if (selectedCircle !== 'All' && off.circle !== selectedCircle) return false;
      if (selectedDivision !== 'All' && off.division !== selectedDivision) return false;
      if (selectedOfficeFilter !== 'All' && off.officeName !== selectedOfficeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesOff =
          off.officeName.toLowerCase().includes(q) ||
          off.pincode.includes(q) ||
          off.division.toLowerCase().includes(q);

        const matchesBeat = off.beats.some(
          (b) =>
            b.beatNumber.toLowerCase().includes(q) ||
            (b.beatName && b.beatName.toLowerCase().includes(q)) ||
            (b.coverageColonies && b.coverageColonies.some((c) => c.toLowerCase().includes(q)))
        );

        const matchesStaff = off.beats.some((b) =>
          b.staffMembers.some(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              (s.employeeId || '').toLowerCase().includes(q) ||
              (s.role || '').toLowerCase().includes(q) ||
              (s.designationType || s.designation || '').toLowerCase().includes(q)
          )
        );

        return matchesOff || matchesBeat || matchesStaff;
      }

      return true;
    });
  }, [mappedOffices, selectedCircle, selectedDivision, selectedOfficeFilter, searchQuery]);

  const toggleOfficeExpand = (officeName: string) => {
    setExpandedOffices((prev) => ({
      ...prev,
      [officeName]: !prev[officeName],
    }));
  };

  const toggleBeatExpand = (key: string) => {
    setExpandedBeats((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetFilters = () => {
    setSelectedCircle('All');
    setSelectedDivision('All');
    setSelectedOfficeFilter('All');
    setSearchQuery('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs space-y-0">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-700 text-white flex items-center justify-center shrink-0">
            <Building2 size={16} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="px-2.5 py-1 rounded-full bg-slate-200/80 font-mono font-bold text-slate-700">
            {filteredOffices.length} Offices
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-100 font-mono font-bold text-red-900">
            {allStaff.length} Staff Mapped
          </span>
        </div>
      </div>

      {/* Universal Search & Filter Console (Circle ➔ Division ➔ Office ➔ Text Search) */}
      <div className="p-4 bg-slate-100/60 border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter size={13} className="text-red-700" />
            <span>Universal Search &amp; Filter Console (Circle ➔ Division ➔ Office)</span>
          </div>
          {(selectedCircle !== 'All' || selectedDivision !== 'All' || selectedOfficeFilter !== 'All' || searchQuery) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[11px] font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* Circle Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Circle
            </label>
            <select
              value={selectedCircle}
              onChange={(e) => {
                setSelectedCircle(e.target.value);
                setSelectedDivision('All');
                setSelectedOfficeFilter('All');
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-600"
            >
              {circleOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Division Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Division
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setSelectedOfficeFilter('All');
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-600"
            >
              {divisionOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Office Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Office / Hub
            </label>
            <select
              value={selectedOfficeFilter}
              onChange={(e) => setSelectedOfficeFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-600"
            >
              {officeDropdownOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          {/* Search Query Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Search Beat / Staff / Colony
            </label>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Beat 2, Mahendra, 324009..."
                className="w-full bg-white border border-slate-300 rounded-lg pl-7 pr-3 py-1.5 font-medium text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tree View */}
      <div className={`p-4 space-y-3 overflow-y-auto ${compact ? 'max-h-96' : 'max-h-[540px]'}`}>
        {filteredOffices.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No offices, beats, or staff members match the selected filters.
          </div>
        ) : (
          filteredOffices.map((off) => {
            const isOffExpanded = expandedOffices[off.officeName] ?? false;
            const isSelectedOff = selectedOfficeName === off.officeName;

            return (
              <div
                key={off.officeId || off.officeName}
                className={`rounded-xl border transition-all ${
                  isSelectedOff
                    ? 'border-red-600 ring-2 ring-red-100 bg-red-50/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Office Header Row */}
                <div
                  className="p-3 flex flex-wrap items-center justify-between gap-2 cursor-pointer hover:bg-slate-50/80 transition"
                  onClick={() => toggleOfficeExpand(off.officeName)}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400">
                      {isOffExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                        off.officeType === 'HO'
                          ? 'bg-amber-400 text-slate-950'
                          : off.officeType === 'BO'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-red-800 text-white'
                      }`}
                    >
                      {off.officeType}
                    </span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {off.officeName}
                    </span>
                    <span className="font-mono text-xs text-slate-500 font-bold">
                      PIN {off.pincode}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({off.division})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      {off.beats.length} Beats · {off.staffCount} Staff
                    </span>
                    {onSelectOffice && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOffice(off.officeName, off.pincode);
                        }}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-900 hover:text-white text-[10px] font-bold text-slate-700 transition cursor-pointer"
                      >
                        Select Office
                      </button>
                    )}
                  </div>
                </div>

                {/* Beats & Staff Children */}
                {isOffExpanded && (
                  <div className="p-3 pt-0 border-t border-slate-100 space-y-2.5">
                    {off.beats.map((beat) => {
                      const beatKey = `${off.officeName}-${beat.beatNumber}`;
                      const isBeatExpanded = expandedBeats[beatKey] ?? true;
                      const isSelectedBeat = selectedBeat === beat.beatNumber;

                      return (
                        <div
                          key={beatKey}
                          className={`rounded-lg border ml-2 sm:ml-5 p-2.5 transition-all ${
                            isSelectedBeat
                              ? 'border-red-500 bg-red-50/40 ring-1 ring-red-200'
                              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                          }`}
                        >
                          {/* Beat Row */}
                          <div
                            className="flex flex-wrap items-center justify-between gap-2 cursor-pointer"
                            onClick={() => toggleBeatExpand(beatKey)}
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-slate-400">
                                {isBeatExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-red-700 text-white font-black text-[10px] uppercase tracking-wider">
                                {beat.beatNumber}
                              </span>
                              <span className="font-bold text-xs text-slate-800">
                                {beat.beatName || beat.beatNumber}
                              </span>
                              {beat.coverageColonies && beat.coverageColonies.length > 0 && (
                                <span className="text-[10px] text-slate-500 max-w-xs truncate">
                                  ({beat.coverageColonies.slice(0, 3).join(', ')})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-slate-500 font-bold">
                                {beat.staffMembers.length} Staff
                              </span>
                              {onSelectBeat && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectBeat(beat.beatNumber, off.officeName, off.pincode);
                                  }}
                                  className="px-2 py-0.5 rounded bg-white hover:bg-red-700 hover:text-white border border-slate-300 text-[10px] font-bold text-slate-700 transition cursor-pointer"
                                >
                                  Select Beat
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Mapped Staff for Beat */}
                          {isBeatExpanded && (
                            <div className="mt-2 pt-2 border-t border-slate-200/60 pl-4 space-y-1.5">
                              {beat.staffMembers.length === 0 ? (
                                <div className="text-[11px] text-slate-400 italic">
                                  No dedicated staff assigned to this beat currently.
                                </div>
                              ) : (
                                beat.staffMembers.map((staff) => {
                                  const isSelectedStaff = selectedStaffId === staff.id;
                                  return (
                                    <div
                                      key={staff.id}
                                      onClick={() => {
                                        if (onSelectStaff) onSelectStaff(staff.id, staff);
                                      }}
                                      className={`p-2 rounded-lg border flex flex-wrap items-center justify-between gap-2 transition cursor-pointer ${
                                        isSelectedStaff
                                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-300'
                                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-900'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <Users size={13} className="text-slate-500" />
                                        <span className="font-bold text-xs">{staff.name}</span>
                                        <span className="font-mono text-[10px] text-slate-500">
                                          ({staff.employeeId || staff.id})
                                        </span>
                                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                                          {staff.designationType || staff.designation || staff.role}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {staff.contact && (
                                          <span className="font-mono text-[10px] text-slate-500">
                                            📞 {staff.contact}
                                          </span>
                                        )}
                                        {isSelectedStaff && (
                                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                                            <CheckCircle2 size={12} /> Active Form Target
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
