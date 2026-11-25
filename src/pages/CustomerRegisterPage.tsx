import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Lock, Shield, UserPlus, Building2 } from 'lucide-react';
import { customerService } from '../services/customerService';
import { useAuth } from '../components/auth/FirebaseAuthProvider';
import { OFFICIAL_BRAND_STORES } from '../services/brandDirectoryService';

export default function CustomerRegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBrandSlug, setSelectedBrandSlug] = useState('india-post');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('324009');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanName = fullName.trim();
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanName.length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (cleanMobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (cleanPass.length < 4) {
      setErrorMsg('Please enter a secure password (at least 4 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedBrand = OFFICIAL_BRAND_STORES.find((b) => b.slug === selectedBrandSlug) || {
        brandName: 'Department of Post',
        slug: 'india-post',
      };

      // Register customer record in customerService
      const newCustomer = customerService.submitCustomerInquiry({
        customerName: cleanName,
        mobile: cleanMobile,
        productInterested: `Customer Account Registered (${selectedBrand.brandName})`,
        requirement: `Customer Portal Self-Service Signup. Email: ${cleanEmail || 'N/A'}. PIN: ${pincode}`,
        preferredContact: 'Doorstep Visit',
        address: address.trim() || `Dadabari HPO, Kota PIN ${pincode}`,
        beatNo: 'Beat 2',
      });

      // Log in user profile as CUSTOMER
      const customerProfile = {
        uid: `cust-${Date.now()}`,
        name: cleanName,
        email: cleanEmail || `${cleanMobile}@customer.xpeedo.in`,
        mobile: cleanMobile,
        role: 'CUSTOMER' as const,
        brandId: selectedBrand.slug,
        brandName: selectedBrand.brandName,
        employeeId: `CUST-${cleanMobile}`,
        department: 'Customer Storefront',
        pincode,
      };

      login(customerProfile);
      setSuccessMsg('Customer registration successful! Redirecting to your customer portal...');
      setTimeout(() => {
        navigate('/customer-portal');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <div className="max-w-xl mx-w-xl w-full mx-auto flex items-center justify-between pb-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-800"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>
        <Link
          to="/login"
          className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
        >
          <Lock size={14} />
          <span>Single Login Portal</span>
        </Link>
      </div>

      {/* Register Card */}
      <div className="max-w-xl w-full mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-800 text-red-400 flex items-center justify-center mx-auto shadow-inner">
            <UserPlus size={24} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Customer Storefront Registration
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create your customer account to track Speed Post COD orders, manage delivery addresses, and book brand services.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-950/80 border border-red-800 text-red-200 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
            <Shield size={16} className="shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Mobile Number (10 Digits)</label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="e.g. 9829012345"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="e.g. rahul@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Secure Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Preferred Brand / Storefront</label>
              <select
                value={selectedBrandSlug}
                onChange={(e) => setSelectedBrandSlug(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500 font-medium cursor-pointer"
              >
                {OFFICIAL_BRAND_STORES.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.brandName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-300">Delivery Address / Colony</label>
              <input
                type="text"
                placeholder="e.g. Sector 3, Dadabari"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">PIN Code</label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-red-500 tabular-nums"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-red-700 hover:bg-red-600 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus size={16} />
              <span>{isSubmitting ? 'Creating Account...' : 'Complete Customer Registration'}</span>
            </button>
          </div>
        </form>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-[11px] text-slate-400 space-y-1">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <Building2 size={13} />
            <span>Customer-Only Self-Service Security</span>
          </div>
          <p>
            Self-service registration creates <strong>Customer</strong> accounts exclusively. Administrative, brand owner, and postal staff credentials must be provisioned through authorized master workflows.
          </p>
        </div>
      </div>

      <footer className="max-w-xl w-full mx-auto text-center text-xs text-slate-500 pt-4">
        Xpeedo Last Mile &amp; Department of Post Execution Engine · Secure OAuth &amp; RBAC Architecture
      </footer>
    </div>
  );
}
