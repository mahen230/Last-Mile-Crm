import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Filter,
  IndianRupee,
  Layers,
  LayoutGrid,
  List,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  User,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  X,
  Calendar,
  AlertCircle,
  CheckSquare,
  Square,
  ArrowRight,
  Award,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { staffPermissionService } from '../../services/staffPermissionService';
import { customerService } from '../../services/customerService';
import { DynamicOfficeRecord, Lead, FollowUp, StaffProfile } from '../../types/models';
import { Link } from 'react-router-dom';

export interface PostalServiceOffering {
  id: string;
  code: string;
  name: string;
  category: 'Banking & FinTech' | 'Identity & Citizen Services' | 'Mail & Logistics' | 'Sovereign Savings & Insurance';
  description: string;
  commissionRate: string;
  commissionNumeric: number;
  isActive: boolean;
  minAmount?: string;
  sla: string;
  iconType: 'bank' | 'id' | 'mail' | 'shield' | 'rupee';
  highlights: string[];
}

const DEFAULT_POSTAL_OFFERINGS: PostalServiceOffering[] = [
  {
    id: 'offering-ippb-banking',
    code: 'IPPB_SB',
    name: 'IPPB Digital Savings & Current Account',
    category: 'Banking & FinTech',
    description: 'Instant zero-balance Aadhaar biometric account opening with virtual debit card & direct DBT linkage.',
    commissionRate: '₹50 per funded account',
    commissionNumeric: 50,
    isActive: true,
    minAmount: '₹200 initial funding',
    sla: 'Instant (5 minutes at doorstep)',
    iconType: 'bank',
    highlights: ['Zero Paperwork Biometric KYC', 'Direct DBT Subsidies Link', 'Virtual RuPay Debit Card'],
  },
  {
    id: 'offering-aadhaar-celc',
    code: 'CELC_AADHAAR',
    name: 'Aadhaar / CELC Mobile Update & Enrolment',
    category: 'Identity & Citizen Services',
    description: 'Child Aadhaar enrolment (0-5 yrs) and mandatory mobile number linking/updating via micro-biometrics.',
    commissionRate: '₹20 per mobile update / enrolment',
    commissionNumeric: 20,
    isActive: true,
    minAmount: '₹50 official UIDAI fee',
    sla: 'Same day (24-48 hrs UIDAI sync)',
    iconType: 'id',
    highlights: ['Child Enrolment (0-5 yrs)', 'Mobile Number Linkage', 'Doorstep Biometric Device'],
  },
  {
    id: 'offering-aeps-cash',
    code: 'AEPS_CASH',
    name: 'AePS Doorstep Cash Withdrawal & Balance',
    category: 'Banking & FinTech',
    description: 'Inter-bank cash withdrawal from any bank account using Aadhaar fingerprint authentication.',
    commissionRate: '₹10 per transaction (min ₹1,000)',
    commissionNumeric: 10,
    isActive: true,
    minAmount: '₹100 to ₹10,000 per day',
    sla: 'Instant cash hand-over',
    iconType: 'rupee',
    highlights: ['Works with 120+ Banks', 'Elderly & Sick Citizen Friendly', 'Instant Receipt via SMS'],
  },
  {
    id: 'offering-jeevan-pramaan',
    code: 'DLC_PENSION',
    name: 'Jeevan Pramaan (Digital Life Certificate - DLC)',
    category: 'Identity & Citizen Services',
    description: 'Doorstep biometric digital life certificate generation for central, state, and defense pensioners.',
    commissionRate: '₹30 per generated DLC',
    commissionNumeric: 30,
    isActive: true,
    minAmount: '₹70 statutory fee',
    sla: 'Instant DLC Pramaan ID',
    iconType: 'shield',
    highlights: ['Govt & Defense Pensioners', 'Biometric / Iris Matching', 'Auto-submission to Pension Disbursing Agency'],
  },
  {
    id: 'offering-speed-post-parcel',
    code: 'DNK_PARCEL',
    name: 'Speed Post, Priority Parcel & Dak Ghar Niryat Kendra',
    category: 'Mail & Logistics',
    description: 'Express domestic speed post, priority parcels, and local merchant parcel pickup with end-to-end tracking.',
    commissionRate: '₹15 per article booking',
    commissionNumeric: 15,
    isActive: true,
    minAmount: 'Varies by weight (from ₹41)',
    sla: '24-48 hours delivery SLA',
    iconType: 'mail',
    highlights: ['Real-time Track & Trace', 'Doorstep Bulk Pickup for Stores', 'Domestic & Export Customs Clearance'],
  },
  {
    id: 'offering-my-stamp',
    code: 'MY_STAMP',
    name: 'My Stamp & Customized Philately Sheets',
    category: 'Identity & Citizen Services',
    description: 'Personalized postage stamps featuring photos of individuals, family milestones, or corporate branding.',
    commissionRate: '₹60 per sheet',
    commissionNumeric: 60,
    isActive: true,
    minAmount: '₹300 per sheet (12 stamps)',
    sla: '3 working days delivery',
    iconType: 'mail',
    highlights: ['Valid Indian Postage', 'Custom Photo & Milestones', 'Official Collector Memorabilia'],
  },
  {
    id: 'offering-ssa',
    code: 'SSA_GIRL_CHILD',
    name: 'Sukanya Samriddhi Yojana (SSA)',
    category: 'Sovereign Savings & Insurance',
    description: 'Premier sovereign-guaranteed 8.2% tax-free savings dedicated to girl children with EEE tax exemption.',
    commissionRate: '₹75 per account opened',
    commissionNumeric: 75,
    isActive: true,
    minAmount: '₹250 minimum deposit',
    sla: 'Passbook within 2 days',
    iconType: 'shield',
    highlights: ['8.2% Sovereign Annual Return', '100% Tax Free (Section 80C)', 'Higher Education & Marriage Corpus'],
  },
  {
    id: 'offering-pli-rpli',
    code: 'PLI_SURAKSHA',
    name: 'Postal Life Insurance (PLI / RPLI)',
    category: 'Sovereign Savings & Insurance',
    description: 'Oldest & highest-bonus life insurance in India with lowest premium rates for govt, semi-govt & rural citizens.',
    commissionRate: '10% of 1st year premium (~₹200 - ₹1,200)',
    commissionNumeric: 250,
    isActive: true,
    minAmount: 'Sum Assured ₹20,000 to ₹50 Lakh',
    sla: 'Medical/Non-medical fast approval',
    iconType: 'shield',
    highlights: ['Highest Bonus Rate in Industry', 'Sovereign Govt of India Guarantee', 'Suraksha, Santosh & Suvidha Plans'],
  },
  {
    id: 'offering-scss-mahila',
    code: 'SCSS_MSSC',
    name: 'Senior Citizen Savings (SCSS) & Mahila Samman',
    category: 'Sovereign Savings & Insurance',
    description: 'High-yield central government savings schemes tailored for retirees (8.2%) and women empowerment (7.5%).',
    commissionRate: '₹50 per certificate account',
    commissionNumeric: 50,
    isActive: true,
    minAmount: '₹1,000 to ₹30 Lakh',
    sla: '2 working days',
    iconType: 'rupee',
    highlights: ['Quarterly Interest Payouts', 'Senior Citizen 8.2% Interest', '2-Year Mahila Samman 7.5%'],
  },
];

const LOCAL_STORAGE_OFFERINGS_KEY = 'kota_division_os_postal_offerings_v1';

export default function IndiaPostStorefrontView() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'OFFERINGS_FUNNEL' | 'MEMBER_DASHBOARD'>('OFFERINGS_FUNNEL');

  // Dynamic Offices
  const [offices, setOffices] = useState<DynamicOfficeRecord[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('DADABARI_SO');

  // Postal Offerings State
  const [offerings, setOfferings] = useState<PostalServiceOffering[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_OFFERINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_POSTAL_OFFERINGS;
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Leads & CRM data from customerService
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  // Notifications
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Lead Funnel Modal State
  const [leadModalOffering, setLeadModalOffering] = useState<PostalServiceOffering | null>(null);
  const [lfCitizenName, setLfCitizenName] = useState('');
  const [lfMobile, setLfMobile] = useState('');
  const [lfAddress, setLfAddress] = useState('');
  const [lfColony, setLfColony] = useState('');
  const [lfBeat, setLfBeat] = useState('Beat 1');
  const [lfPincode, setLfPincode] = useState('324009');
  const [lfPreferredDate, setLfPreferredDate] = useState('');
  const [lfInitialAmount, setLfInitialAmount] = useState('');
  const [lfNotes, setLfNotes] = useState('');

  // Add / Custom Offering Modal State
  const [showAddOfferingModal, setShowAddOfferingModal] = useState(false);
  const [newOffName, setNewOffName] = useState('');
  const [newOffCategory, setNewOffCategory] = useState<PostalServiceOffering['category']>('Banking & FinTech');
  const [newOffDesc, setNewOffDesc] = useState('');
  const [newOffCommission, setNewOffCommission] = useState('₹35 per transaction');
  const [newOffCommissionNum, setNewOffCommissionNum] = useState(35);
  const [newOffSla, setNewOffSla] = useState('Within 24 hours');
  const [newOffMin, setNewOffMin] = useState('₹100');

  // Edit Offering Modal State
  const [editingOffering, setEditingOffering] = useState<PostalServiceOffering | null>(null);

  const refreshAllData = () => {
    const allOffices = staffPermissionService.getDynamicOffices();
    setOffices(allOffices);
    setLeads(customerService.getLeads());
    setFollowUps(customerService.getFollowUps());
    setTasks(customerService.getTasks());
  };

  useEffect(() => {
    refreshAllData();
    const unsubPerms = staffPermissionService.subscribe(refreshAllData);
    const unsubCust = customerService.subscribe(refreshAllData);
    return () => {
      unsubPerms();
      unsubCust();
    };
  }, []);

  const saveOfferingsToStorage = (updated: PostalServiceOffering[]) => {
    setOfferings(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_OFFERINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist offerings:', e);
    }
  };

  const showSuccessNotice = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => setBannerMessage(null), 5000);
  };

  // Selected office record
  const currentOffice = useMemo(() => {
    return (
      offices.find(
        (o) =>
          o.id === selectedOfficeId ||
          o.officeId === selectedOfficeId ||
          o.officeName.toLowerCase().includes(selectedOfficeId.toLowerCase())
      ) ||
      offices[0] ||
      null
    );
  }, [offices, selectedOfficeId]);

  // Keep PIN & Beat in sync with office
  useEffect(() => {
    if (currentOffice) {
      setLfPincode(currentOffice.pincode || '324009');
      if (currentOffice.mappedBeats?.length) {
        setLfBeat(currentOffice.mappedBeats[0]);
      }
      if (currentOffice.mappedColonies?.length) {
        setLfColony(currentOffice.mappedColonies[0]);
      }
    }
  }, [currentOffice]);

  // Filtered offerings
  const filteredOfferings = useMemo(() => {
    return offerings.filter((off) => {
      if (categoryFilter !== 'ALL' && off.category !== categoryFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        off.name.toLowerCase().includes(q) ||
        off.description.toLowerCase().includes(q) ||
        off.code.toLowerCase().includes(q) ||
        off.category.toLowerCase().includes(q)
      );
    });
  }, [offerings, categoryFilter, searchQuery]);

  // Toggle Offering Visibility
  const handleToggleOfferingVisibility = (id: string) => {
    const updated = offerings.map((off) => (off.id === id ? { ...off, isActive: !off.isActive } : off));
    saveOfferingsToStorage(updated);
    showSuccessNotice('Offering visibility updated.');
  };

  // Open Lead Funnel Modal
  const openLeadFunnel = (offering: PostalServiceOffering) => {
    setLeadModalOffering(offering);
    setLfCitizenName('');
    setLfMobile('');
    setLfAddress('');
    setLfInitialAmount(offering.minAmount || '');
    setLfNotes('');
    setLfPreferredDate(new Date().toISOString().split('T')[0]);
  };

  // Submit Lead Funnel Form
  const handleSubmitLeadFunnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadModalOffering) return;
    if (!lfCitizenName.trim() || !lfMobile.trim()) {
      alert('Please provide customer name and mobile contact.');
      return;
    }

    const newLead = customerService.createLead({
      customerId: `CITIZEN-${Date.now().toString().slice(-6)}`,
      customerName: lfCitizenName.trim(),
      mobile: lfMobile.trim(),
      phone: lfMobile.trim(),
      productOrService: leadModalOffering.name,
      category: leadModalOffering.category,
      serviceName: leadModalOffering.name,
      beat: lfBeat || currentOffice?.mappedBeats?.[0] || 'Beat 1',
      beatNo: lfBeat || currentOffice?.mappedBeats?.[0] || 'Beat 1',
      pincode: lfPincode || currentOffice?.pincode || '324009',
      colony: lfColony || currentOffice?.mappedColonies?.[0] || 'Local Beat Area',
      area: lfColony || currentOffice?.mappedColonies?.[0] || 'Local Beat Area',
      address: lfAddress.trim() || currentOffice?.completeAddress || 'Doorstep Citizen Visit',
      status: 'NEW',
      potentialValue: Number(lfInitialAmount.replace(/[^0-9]/g, '')) || 500,
      notes: `India Post Storefront Lead: ${lfNotes || 'Direct doorstep lead from field application'}. Preferred Date: ${lfPreferredDate}`,
      assignedTo: userProfile?.name || 'Assigned Beat Staff',
      source: 'INDIA_POST_STOREFRONT',
    } as any);

    // Also auto-create a CRM follow-up so it appears immediately on Member Dashboard
    try {
      customerService.scheduleFollowUp({
        customerId: newLead.customerId || `CITIZEN-${Date.now().toString().slice(-6)}`,
        customerName: lfCitizenName.trim(),
        customerMobile: lfMobile.trim(),
        scheduledDate: lfPreferredDate || new Date().toISOString().split('T')[0],
        currentStatus: 'Pending',
        priority: 'High',
        nextAction: `Doorstep verification for ${leadModalOffering.name}`,
        assignedStaffName: userProfile?.name || 'Assigned Staff',
        remarks: `Follow-up for ${leadModalOffering.name}. Contact: ${lfMobile}. Location: ${lfColony || lfAddress}`,
      });
    } catch {
      // ignore
    }

    showSuccessNotice(
      `✓ Lead captured successfully for "${lfCitizenName}" (${leadModalOffering.name})! Logged in CRM pipeline.`
    );
    setLeadModalOffering(null);
    refreshAllData();
  };

  // Create Custom Offering
  const handleCreateOffering = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffName.trim()) return;

    const newOff: PostalServiceOffering = {
      id: `offering-${Date.now().toString().slice(-6)}`,
      code: `POST_${Date.now().toString().slice(-4)}`,
      name: newOffName.trim(),
      category: newOffCategory,
      description: newOffDesc.trim() || 'Custom localized India Post initiative.',
      commissionRate: newOffCommission.trim(),
      commissionNumeric: Number(newOffCommissionNum) || 30,
      isActive: true,
      minAmount: newOffMin.trim(),
      sla: newOffSla.trim(),
      iconType: newOffCategory === 'Banking & FinTech' ? 'bank' : newOffCategory === 'Mail & Logistics' ? 'mail' : 'shield',
      highlights: ['Local Beat Driven', 'Direct CRM Integration', 'Fast Turnaround'],
    };

    saveOfferingsToStorage([newOff, ...offerings]);
    showSuccessNotice(`Added new offering "${newOffName}".`);
    setShowAddOfferingModal(false);
    setNewOffName('');
    setNewOffDesc('');
  };

  // Save Edited Offering
  const handleSaveEditedOffering = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffering) return;

    const updated = offerings.map((off) => (off.id === editingOffering.id ? editingOffering : off));
    saveOfferingsToStorage(updated);
    showSuccessNotice(`Updated details for "${editingOffering.name}".`);
    setEditingOffering(null);
  };

  // Member Dashboard Metrics Calculations
  const stats = useMemo(() => {
    const totalLeadsCount = leads.length;
    // Calculate commission earned based on captured leads and offerings
    let estimatedEarnings = 0;
    const categoryBreakdown: Record<string, number> = {
      'Banking & FinTech': 0,
      'Identity & Citizen Services': 0,
      'Mail & Logistics': 0,
      'Sovereign Savings & Insurance': 0,
    };

    leads.forEach((l) => {
      const matched = offerings.find(
        (o) =>
          o.name.toLowerCase() === (l.productOrService || '').toLowerCase() ||
          o.name.toLowerCase() === ((l as any).serviceName || '').toLowerCase()
      );
      const earned = matched ? matched.commissionNumeric : 35;
      estimatedEarnings += earned;
      const cat = matched ? matched.category : 'Banking & FinTech';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + earned;
    });

    const activeFollowUps = followUps.filter((f) => f.currentStatus !== 'Completed' && f.currentStatus !== 'Cancelled');
    const completedFollowUps = followUps.filter((f) => f.currentStatus === 'Completed');

    return {
      totalLeadsCount,
      estimatedEarnings,
      categoryBreakdown,
      activeFollowUpsCount: activeFollowUps.length,
      completedFollowUpsCount: completedFollowUps.length,
    };
  }, [leads, followUps, offerings]);

  // Update Follow Up Status inline
  const handleUpdateFollowUpStatus = (followUpId: string, nextStatus: 'Pending' | 'Completed' | 'Overdue' | 'Rescheduled' | 'Cancelled') => {
    try {
      customerService.updateFollowUp(followUpId, { currentStatus: nextStatus });
      showSuccessNotice(`Follow-up status marked as "${nextStatus}".`);
      refreshAllData();
    } catch (e) {
      console.warn('Update failed', e);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = (task: any) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      customerService.updateTask(task.id, { status: nextStatus });
      showSuccessNotice(`Task "${task.title}" marked as ${nextStatus}.`);
      refreshAllData();
    } catch (e) {
      console.warn('Task update failed', e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ==================================================================== */}
      {/* 1. TOP HEADER & IDENTITY BAR                                         */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-r from-[#0A1628] via-[#0F1E36] to-[#1E3A8A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/40 relative overflow-hidden">
        {/* Subtle decorative background watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 pointer-events-none flex items-center justify-center">
          <Building2 size={240} className="text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs">
                Department of Posts · India Post
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                Kota Division OS
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                Rajasthan Circle (Ajmer Region)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>India Post Official Storefront &amp; Citizen Services</span>
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Unified citizen services hub for IPPB Banking, Aadhaar CELC, AePS Doorstep Cash, Digital Life
              Certificates (DLC), Speed Post / Priority Parcels, and Sovereign Government Savings.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className="flex items-center gap-1.5 text-blue-200">
                <UserCheck size={14} className="text-amber-300" />
                <span>
                  Staff on Duty: <strong>{userProfile?.name || 'Mahendra Kumar Meena'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-200">
                <MapPin size={14} className="text-emerald-300" />
                <span>
                  Active Beat: <strong>{userProfile?.beat || 'Beat 2'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Office / BO Selector & Key Counter */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-3 shrink-0 lg:w-80">
            <div>
              <label className="block text-[11px] uppercase font-bold text-blue-200 mb-1 flex items-center gap-1">
                <Building2 size={13} />
                <span>Current Operating Office / BO</span>
              </label>
              <select
                value={selectedOfficeId}
                onChange={(e) => setSelectedOfficeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-blue-400/40 rounded-xl text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {offices.map((off) => (
                  <option key={off.id} value={off.id} className="bg-slate-900 text-white">
                    {off.officeName} ({off.pincode}) [{off.officeType}]
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-white/10">
              <div className="p-2 bg-white/5 rounded-xl">
                <span className="block text-[10px] text-blue-200 uppercase font-bold">Active Offerings</span>
                <span className="font-mono font-black text-lg text-amber-300">
                  {offerings.filter((o) => o.isActive).length}
                </span>
              </div>
              <div className="p-2 bg-white/5 rounded-xl">
                <span className="block text-[10px] text-blue-200 uppercase font-bold">Total CRM Leads</span>
                <span className="font-mono font-black text-lg text-emerald-300">{leads.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Notice Banner */}
        {bannerMessage && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-100 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
            <span>{bannerMessage}</span>
          </div>
        )}

        {/* 2-Tab Navigation Switcher */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('OFFERINGS_FUNNEL')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'OFFERINGS_FUNNEL'
                ? 'bg-white text-slate-950 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <LayoutGrid size={15} />
            <span>01. Product &amp; Service Management + Lead Funnel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MEMBER_DASHBOARD')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'MEMBER_DASHBOARD'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <TrendingUp size={15} />
            <span>02. Member Dashboard (Profit, CRM &amp; Tasks)</span>
            {stats.activeFollowUpsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-mono">
                {stats.activeFollowUpsCount} Follow-ups
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1: PRODUCT & SERVICE MANAGEMENT + LEAD FUNNEL                */}
      {/* ==================================================================== */}
      {activeTab === 'OFFERINGS_FUNNEL' && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Category Filter, and Add Custom Offering */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search postal offerings, IPPB, Aadhaar, Speed Post, PLI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-700"
              >
                <option value="ALL">All Categories</option>
                <option value="Banking & FinTech">Banking &amp; FinTech (IPPB / AePS)</option>
                <option value="Identity & Citizen Services">Identity &amp; Citizen Services (Aadhaar / DLC)</option>
                <option value="Mail & Logistics">Mail &amp; Logistics (Speed Post / Parcel)</option>
                <option value="Sovereign Savings & Insurance">Sovereign Savings &amp; Insurance (SSA / PLI)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddOfferingModal(true)}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>+ Custom Postal Campaign</span>
              </button>
            </div>
          </div>

          {/* Offerings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOfferings.map((off) => (
              <div
                key={off.id}
                className={`rounded-2xl border bg-white p-5 flex flex-col justify-between transition shadow-xs hover:shadow-md ${
                  off.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Category & Status Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-blue-50 text-blue-800 border border-blue-200">
                      {off.category}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleOfferingVisibility(off.id)}
                      title={off.isActive ? 'Click to deactivate in beat' : 'Click to activate in beat'}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 border cursor-pointer ${
                        off.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {off.isActive ? <Eye size={11} /> : <EyeOff size={11} />}
                      <span>{off.isActive ? 'Live in Beat' : 'Hidden'}</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">{off.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{off.description}</p>
                  </div>

                  {/* Highlights Bullet Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {off.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold"
                      >
                        ✓ {h}
                      </span>
                    ))}
                  </div>

                  {/* Commission Rate & Turnaround */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-amber-800">Member Commission</span>
                      <span className="font-bold text-emerald-800 text-xs">{off.commissionRate}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Delivery / Execution SLA:</span>
                      <strong className="text-slate-800">{off.sla}</strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar: Open Lead Funnel & Edit */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOffering(off)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-bold cursor-pointer"
                    title="Edit Offering Details"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => openLeadFunnel(off)}
                    className="flex-1 py-2 px-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
                  >
                    <UserPlus size={14} />
                    <span>Open Lead Funnel →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 2: MEMBER DASHBOARD (PROFIT, CRM & TASKS)                    */}
      {/* ==================================================================== */}
      {activeTab === 'MEMBER_DASHBOARD' && (
        <div className="space-y-6">
          {/* Member Commission & Earnings Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Commission Earned</div>
              <div className="text-2xl font-black text-slate-900 font-mono">₹{stats.estimatedEarnings.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-emerald-600 font-bold">From {stats.totalLeadsCount} captured CRM leads</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active CRM Follow-ups</div>
              <div className="text-2xl font-black text-amber-600 font-mono">{stats.activeFollowUpsCount}</div>
              <p className="text-[11px] text-slate-500 font-medium">Scheduled citizen doorstep visits</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Achievement</div>
              <div className="text-2xl font-black text-blue-700 font-mono">84%</div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84%' }} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Projected Monthly Payout</div>
              <div className="text-2xl font-black text-emerald-700 font-mono">
                ₹{(stats.estimatedEarnings + 2400).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Auto-credited with monthly CSI cycle</p>
            </div>
          </div>

          {/* Earnings Breakdown by Vertical */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Wallet size={16} className="text-emerald-600" />
              <span>Category-Wise Commission Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(stats.categoryBreakdown).map(([cat, amount]) => (
                <div key={cat} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">{cat}</span>
                  <span className="text-base font-black text-slate-900 font-mono">₹{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active CRM Follow-ups Table & Daily Tasks Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active CRM Follow-ups (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Clock size={16} className="text-amber-600" />
                    <span>Active CRM Follow-Ups &amp; Doorstep Visits ({followUps.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500">Citizen leads requiring field callback, biometric KYC, or cash collection</p>
                </div>
                <Link
                  to="/follow-ups"
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                >
                  <span>Open Full CRM →</span>
                </Link>
              </div>

              <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[500px]">
                {followUps.map((fu) => {
                  const isDone = fu.currentStatus === 'Completed';
                  return (
                    <div
                      key={fu.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                        isDone ? 'bg-slate-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{fu.customerName}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : fu.currentStatus === 'Rescheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {fu.currentStatus}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {fu.priority || 'Normal'} Priority
                          </span>
                        </div>

                        <div className="text-slate-600 font-medium">
                          Next Action: <strong className="text-slate-900">{fu.nextAction || fu.remarks}</strong> · Due:{' '}
                          <span className="font-mono font-bold text-slate-800">{fu.scheduledDate}</span>
                        </div>

                        {fu.remarks && <p className="text-[11px] text-slate-500 italic">"{fu.remarks}"</p>}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {fu.currentStatus !== 'Completed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateFollowUpStatus(fu.id, 'Completed')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}
                        {fu.currentStatus === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateFollowUpStatus(fu.id, 'Rescheduled')}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            Reschedule
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {followUps.length === 0 && (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
                    <p className="font-bold text-slate-700">All follow-ups clear!</p>
                    <p className="text-xs">Open the lead funnel on any product to capture new citizen requests.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Beat Tasks (1 col) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col space-y-4">
              <div>
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <CheckSquare size={16} className="text-blue-600" />
                  <span>Today's Field Tasks ({tasks.length})</span>
                </h3>
                <p className="text-xs text-slate-500">Assigned beat checklist &amp; campaigns</p>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[460px]">
                {tasks.map((t) => {
                  const isDone = t.status === 'Completed';
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTask(t)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                        isDone
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-blue-300 shadow-2xs'
                      }`}
                    >
                      <button type="button" className="mt-0.5 text-blue-600 shrink-0">
                        {isDone ? <CheckSquare size={16} className="text-emerald-600" /> : <Square size={16} />}
                      </button>
                      <div className="space-y-1">
                        <div className={`font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {t.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {t.colony || t.area ? `${t.colony || t.area} · ` : ''}Target: {t.householdsTarget || 5} HHs
                        </div>
                      </div>
                    </div>
                  );
                })}

                {tasks.length === 0 && (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    <p>No active tasks assigned for today.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: STRUCTURED LEAD FUNNEL MODAL                                */}
      {/* ==================================================================== */}
      {leadModalOffering && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-red-700 via-red-800 to-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-400 text-slate-950">
                  Direct CRM Lead Funnel
                </span>
                <h3 className="text-lg font-black mt-1">{leadModalOffering.name}</h3>
                <p className="text-xs text-red-100">
                  Capture citizen demand into CRM pipeline with immediate beat dispatch
                </p>
              </div>
              <button
                onClick={() => setLeadModalOffering(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitLeadFunnel} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between">
                <span>Commission on Conversion:</span>
                <strong className="text-emerald-700 font-bold">{leadModalOffering.commissionRate}</strong>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Citizen Full Name *</label>
                  <input
                    required
                    placeholder="e.g. Ramesh Kumar Sharma"
                    value={lfCitizenName}
                    onChange={(e) => setLfCitizenName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Contact *</label>
                  <input
                    required
                    placeholder="e.g. 9829012345"
                    value={lfMobile}
                    onChange={(e) => setLfMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-blue-700 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Colony / Locality *</label>
                  <input
                    required
                    placeholder="e.g. Keshavpura Sector 6"
                    value={lfColony}
                    onChange={(e) => setLfColony(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIN Code *</label>
                  <input
                    required
                    value={lfPincode}
                    onChange={(e) => setLfPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Beat *</label>
                  <input
                    required
                    value={lfBeat}
                    onChange={(e) => setLfBeat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Visit Date</label>
                  <input
                    type="date"
                    value={lfPreferredDate}
                    onChange={(e) => setLfPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">House / Doorstep Address Details</label>
                <input
                  placeholder="e.g. Plot 42, Near CAD Circle"
                  value={lfAddress}
                  onChange={(e) => setLfAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deposit / Booking Requirement (optional)</label>
                <input
                  placeholder="e.g. ₹500 initial deposit / 2 parcel boxes"
                  value={lfInitialAmount}
                  onChange={(e) => setLfInitialAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Field Notes / Special Requirements</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Elderly citizen needs doorstep fingerprint scanner on Sunday morning"
                  value={lfNotes}
                  onChange={(e) => setLfNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setLeadModalOffering(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black cursor-pointer shadow-md"
                >
                  Submit &amp; Capture Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: ADD CUSTOM POSTAL CAMPAIGN                                  */}
      {/* ==================================================================== */}
      {showAddOfferingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-500 text-white">
                  Postal Service Registry
                </span>
                <h3 className="text-lg font-black mt-1">Register New Postal Offering / Campaign</h3>
              </div>
              <button
                onClick={() => setShowAddOfferingModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOffering} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Offering Name *</label>
                <input
                  required
                  placeholder="e.g. Mahila Samman Festival Drive"
                  value={newOffName}
                  onChange={(e) => setNewOffName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newOffCategory}
                    onChange={(e) => setNewOffCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    <option value="Banking & FinTech">Banking &amp; FinTech</option>
                    <option value="Identity & Citizen Services">Identity &amp; Citizen Services</option>
                    <option value="Mail & Logistics">Mail &amp; Logistics</option>
                    <option value="Sovereign Savings & Insurance">Sovereign Savings &amp; Insurance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Execution SLA</label>
                  <input
                    value={newOffSla}
                    onChange={(e) => setNewOffSla(e.target.value)}
                    placeholder="e.g. Within 24 hours"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of service, citizen benefits, and eligibility..."
                  value={newOffDesc}
                  onChange={(e) => setNewOffDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Member Commission (Label)</label>
                  <input
                    value={newOffCommission}
                    onChange={(e) => setNewOffCommission(e.target.value)}
                    placeholder="e.g. ₹40 per account"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Numeric Amount (₹ for dashboard)</label>
                  <input
                    type="number"
                    value={newOffCommissionNum}
                    onChange={(e) => setNewOffCommissionNum(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddOfferingModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-black cursor-pointer shadow-md"
                >
                  Save Offering
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: EDIT OFFERING                                               */}
      {/* ==================================================================== */}
      {editingOffering && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-amber-700 to-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-400 text-slate-950">
                  Offering Editor
                </span>
                <h3 className="text-lg font-black mt-1">Edit {editingOffering.name}</h3>
              </div>
              <button
                onClick={() => setEditingOffering(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedOffering} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Offering Name</label>
                <input
                  required
                  value={editingOffering.name}
                  onChange={(e) => setEditingOffering({ ...editingOffering, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingOffering.description}
                  onChange={(e) => setEditingOffering({ ...editingOffering, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Commission Rate</label>
                  <input
                    value={editingOffering.commissionRate}
                    onChange={(e) => setEditingOffering({ ...editingOffering, commissionRate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Numeric Amount (₹)</label>
                  <input
                    type="number"
                    value={editingOffering.commissionNumeric}
                    onChange={(e) =>
                      setEditingOffering({ ...editingOffering, commissionNumeric: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingOffering(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
