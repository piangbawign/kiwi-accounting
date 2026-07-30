import React, { useState } from 'react';
import {
  Building,
  Key,
  Download,
  UploadCloud,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  User,
  UserPlus,
  Trash2,
  Edit3,
  Mail,
  Phone,
  CreditCard,
  Users,
  Check,
  X,
  Landmark,
  Shield,
  Fingerprint,
  ScanFace,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { CompanySettings, UserProfile, Account } from '../types';
import {
  isWebAuthnSupported,
  isBiometricAvailable,
  isBiometricEnrolled,
  registerBiometrics,
  disableBiometrics,
} from '../services/webauthn';

interface SettingsViewProps {
  companySettings: CompanySettings;
  securityPin: string | null;
  userProfiles?: UserProfile[];
  accounts?: Account[];
  onUpdateCompanySettings: (settings: CompanySettings) => void;
  onSetSecurityPin: (pin: string | null) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonString: string) => void;
  onResetDemoData: () => void;
  onAddUserProfile?: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  onUpdateUserProfile?: (profile: UserProfile) => void;
  onDeleteUserProfile?: (profileId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  companySettings,
  securityPin,
  userProfiles = [],
  accounts = [],
  onUpdateCompanySettings,
  onSetSecurityPin,
  onExportBackup,
  onImportBackup,
  onResetDemoData,
  onAddUserProfile,
  onUpdateUserProfile,
  onDeleteUserProfile,
}) => {
  // Local Settings Form State
  const [legalName, setLegalName] = useState(companySettings.legalName);
  const [tradingName, setTradingName] = useState(companySettings.tradingName);
  const [aiProvider, setAiProvider] = useState(() => localStorage.getItem('kiwi_ai_provider') || 'GEMINI');
  const [aiApiKey, setAiApiKey] = useState(() => localStorage.getItem('kiwi_ai_api_key') || '');
  const [groqApiKey, setGroqApiKey] = useState(() => localStorage.getItem('kiwi_groq_api_key') || '');
  const [irdNumber, setIrdNumber] = useState(companySettings.irdNumber);
  const [nzbn, setNzbn] = useState(companySettings.nzbn || '9429041234567');
  const [ccNumber, setCcNumber] = useState(companySettings.ccNumber || 'CC58921');
  const [officialSignatoryName, setOfficialSignatoryName] = useState(companySettings.officialSignatoryName || 'Pastor David Miller');
  const [officialSignatoryTitle, setOfficialSignatoryTitle] = useState(companySettings.officialSignatoryTitle || 'Senior Pastor & Treasurer');
  const [entityType, setEntityType] = useState(companySettings.entityType || 'REGISTERED_CHARITY');
  const [companyDirector, setCompanyDirector] = useState(companySettings.companyDirector || 'Pastor David Miller (Trustee)');
  const [gstNumber, setGstNumber] = useState(companySettings.gstNumber);
  const [gstBasis, setGstBasis] = useState(companySettings.gstBasis);
  const [gstFrequency, setGstFrequency] = useState(companySettings.gstFilingFrequency);
  const [bankDetails, setBankDetails] = useState(companySettings.bankAccountDetails);
  const [address, setAddress] = useState(companySettings.businessAddress);

  const [pinInput, setPinInput] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [importError, setImportError] = useState('');

  // Biometric WebAuthn State
  const [biometricsSupported, setBiometricsSupported] = useState(false);
  const [biometricsEnrolled, setBiometricsEnrolled] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioMsg, setBioMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    async function checkBio() {
      const supported = isWebAuthnSupported();
      const available = await isBiometricAvailable();
      const enrolled = isBiometricEnrolled();
      setBiometricsSupported(supported && available);
      setBiometricsEnrolled(enrolled);
    }
    checkBio();
  }, []);

  const handleToggleBiometrics = async () => {
    setBioMsg(null);
    if (biometricsEnrolled) {
      disableBiometrics();
      setBiometricsEnrolled(false);
      setBioMsg({ type: 'success', text: 'Biometric unlock disabled.' });
    } else {
      setBioLoading(true);
      const res = await registerBiometrics('KiwiLedger User');
      setBioLoading(false);
      if (res.success) {
        setBiometricsEnrolled(true);
        setBioMsg({ type: 'success', text: 'Biometrics registered! You can now unlock using Fingerprint or Face ID.' });
      } else {
        setBioMsg({ type: 'error', text: res.error || 'Failed to register biometrics.' });
      }
    }
  };

  // User Profile Modal & Form State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);

  const [profName, setProfName] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profRole, setProfRole] = useState('Owner');
  const [profIrd, setProfIrd] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profAccountIds, setProfAccountIds] = useState<string[]>([]);

  // Open modal for new profile
  const handleOpenAddProfile = () => {
    setEditingProfile(null);
    setProfName('');
    setProfEmail('');
    setProfRole('Owner');
    setProfIrd('');
    setProfPhone('');
    setProfAccountIds([]);
    setShowProfileModal(true);
  };

  // Open modal for editing existing profile
  const handleOpenEditProfile = (profile: UserProfile) => {
    setEditingProfile(profile);
    setProfName(profile.name);
    setProfEmail(profile.email);
    setProfRole(profile.role);
    setProfIrd(profile.irdNumber || '');
    setProfPhone(profile.phone || '');
    setProfAccountIds(profile.associatedAccountIds || []);
    setShowProfileModal(true);
  };

  // Save profile submit
  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim() || !profEmail.trim()) return;

    if (editingProfile) {
      if (onUpdateUserProfile) {
        onUpdateUserProfile({
          ...editingProfile,
          name: profName.trim(),
          email: profEmail.trim(),
          role: profRole.trim(),
          irdNumber: profIrd.trim() || undefined,
          phone: profPhone.trim() || undefined,
          associatedAccountIds: profAccountIds,
        });
        setSaveSuccessMsg(`User profile "${profName.trim()}" updated successfully.`);
      }
    } else {
      if (onAddUserProfile) {
        onAddUserProfile({
          name: profName.trim(),
          email: profEmail.trim(),
          role: profRole.trim(),
          irdNumber: profIrd.trim() || undefined,
          phone: profPhone.trim() || undefined,
          associatedAccountIds: profAccountIds,
        });
        setSaveSuccessMsg(`New user profile "${profName.trim()}" created successfully.`);
      }
    }

    setShowProfileModal(false);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Delete profile confirm
  const handleConfirmDeleteProfile = (profileId: string) => {
    const target = userProfiles.find((p) => p.id === profileId);
    if (onDeleteUserProfile) {
      onDeleteUserProfile(profileId);
      setSaveSuccessMsg(`Profile "${target?.name || 'User'}" deleted. All attached bank accounts were automatically unbound.`);
    }
    setDeletingProfileId(null);
    setTimeout(() => setSaveSuccessMsg(''), 5000);
  };

  // Handle Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanySettings({
      ...companySettings,
      legalName,
      tradingName,
      irdNumber,
      nzbn,
      ccNumber,
      officialSignatoryName,
      officialSignatoryTitle,
      entityType,
      companyDirector,
      gstNumber,
      gstBasis,
      gstFilingFrequency: gstFrequency,
      bankAccountDetails: bankDetails,
      businessAddress: address,
    });

    setSaveSuccessMsg('Company & Charity IRD tax settings successfully updated.');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Handle PIN Save
  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim().length === 4 && /^\d+$/.test(pinInput)) {
      onSetSecurityPin(pinInput.trim());
      setPinInput('');
      setSaveSuccessMsg('4-digit PIN lock set successfully.');
    } else {
      onSetSecurityPin(null);
      setSaveSuccessMsg('PIN lock disabled.');
    }
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Handle File Backup Import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        onImportBackup(text);
        setSaveSuccessMsg('Backup restored successfully!');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } catch (err: any) {
        setImportError('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">App Settings, User Profiles & Storage</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage company IRD details, user profile access, PIN security & offline backups
          </p>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          {saveSuccessMsg}
        </div>
      )}

      {importError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          {importError}
        </div>
      )}

      {/* User Profiles Management Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between mb-6 shadow-sm border border-slate-800">
        <div>
          <h2 className="font-black text-sm">System Configuration</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Manage preferences, security, and AI integrations</p>
        </div>
      </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" /> User Profiles & Account Assignments
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Create, manage, and assign bank accounts to team members, accountants, and directors
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddProfile}
            className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0 hover:brightness-105 active:scale-95"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" /> Add User Profile
          </button>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userProfiles.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <User className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No user profiles created yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click "Add User Profile" to set up team members</p>
            </div>
          ) : (
            userProfiles.map((prof) => {
              const boundAccounts = accounts.filter(
                (a) => a.profileId === prof.id || prof.associatedAccountIds?.includes(a.id)
              );

              return (
                <div
                  key={prof.id}
                  className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/70 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm shrink-0">
                          {prof.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                            {prof.name}
                          </h4>
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-[10px] font-bold rounded-md">
                            {prof.role}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProfile(prof)}
                          title="Edit Profile"
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProfileId(prof.id)}
                          title="Delete Profile"
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{prof.email}</span>
                      </div>
                      {prof.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{prof.phone}</span>
                        </div>
                      )}
                      {prof.irdNumber && (
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono">IRD: {prof.irdNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Bound Accounts Section */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Landmark className="w-3 h-3 text-teal-600 dark:text-teal-400" /> Attached Bank Accounts ({boundAccounts.length})
                      </div>
                      {boundAccounts.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No bank accounts assigned</p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {boundAccounts.map((acc) => (
                            <span
                              key={acc.id}
                              className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-medium rounded-md flex items-center gap-1"
                            >
                              <CreditCard className="w-2.5 h-2.5 text-slate-400" />
                              {acc.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline Deletion Confirmation */}
                  {deletingProfileId === prof.id && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-lg space-y-2 mt-2">
                      <p className="text-[11px] font-bold text-rose-800 dark:text-rose-200">
                        Delete profile "{prof.name}"?
                      </p>
                      <p className="text-[10px] text-rose-600 dark:text-rose-300">
                        This cleans up profile data and automatically unbinds all attached bank accounts without breaking transactions.
                      </p>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setDeletingProfileId(null)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDeleteProfile(prof.id)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 text-white rounded-md hover:bg-rose-500 shadow"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Grid Layout for General Settings & Backup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Company & IRD Reporting Settings */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Company IRD Tax Parameters
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Legal Registered Name</label>
              <input
                type="text"
                required
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Trading Name</label>
              <input
                type="text"
                required
                value={tradingName}
                onChange={(e) => setTradingName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">NZBN (NZ Business Number)</label>
                <input
                  type="text"
                  placeholder="e.g. 9429041234567"
                  value={nzbn}
                  onChange={(e) => setNzbn(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Charities Registration CC#</label>
                <input
                  type="text"
                  placeholder="e.g. CC58921"
                  value={ccNumber}
                  onChange={(e) => setCcNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company IRD Number</label>
                <input
                  type="text"
                  required
                  value={irdNumber}
                  onChange={(e) => setIrdNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GST Number</label>
                <input
                  type="text"
                  required
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GST Accounting Basis</label>
                <select
                  value={gstBasis}
                  onChange={(e) => setGstBasis(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100"
                >
                  <option value="PAYMENTS">Payments Basis</option>
                  <option value="INVOICE">Invoice Basis</option>
                  <option value="HYBRID">Hybrid Basis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GST Filing Frequency</label>
                <select
                  value={gstFrequency}
                  onChange={(e) => setGstFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100"
                >
                  <option value="2_MONTHLY">2-Monthly (Standard)</option>
                  <option value="6_MONTHLY">6-Monthly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Business Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Bank Account for Invoices</label>
              <input
                type="text"
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-md transition-all mt-2"
            >
              Save IRD Company Settings
            </button>
          </form>
        </div>

        {/* Right Stack: Security PIN & Data Backup */}
        <div className="space-y-6">
          
          {/* Security PIN Box */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600 dark:text-amber-400" /> App Security & PIN Lock
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Protect your local accounting ledger with a 4-digit PIN modal on app launch
            </p>

            <form onSubmit={handleSavePin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {securityPin ? 'Current PIN set. Enter 4 digits to update or leave empty to disable:' : 'Set 4-Digit Security PIN:'}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="e.g., 2026"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-mono text-center tracking-widest font-bold"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-all"
                >
                  {pinInput ? 'Set / Update PIN' : 'Disable PIN Lock'}
                </button>
              </div>
            </form>

            {/* WebAuthn Mobile Biometrics Unlock */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Biometric & Touch/Face ID Unlock
                  </span>
                </div>
                {biometricsSupported ? (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    biometricsEnrolled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}>
                    {biometricsEnrolled ? 'Active' : 'Supported'}
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-400">Not Available</span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Use your device's native fingerprint scanner or face recognition (WebAuthn API) to quickly unlock KiwiLedger on mobile or desktop without typing your PIN.
              </p>

              {biometricsSupported && (
                <div>
                  <button
                    type="button"
                    onClick={handleToggleBiometrics}
                    disabled={bioLoading}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 ${
                      biometricsEnrolled
                        ? 'bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                        : 'bg-teal-600 hover:bg-teal-500 text-white'
                    }`}
                  >
                    {bioLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Registering Biometrics...
                      </>
                    ) : biometricsEnrolled ? (
                      <>
                        <X className="w-3.5 h-3.5" /> Disable Biometric Unlock
                      </>
                    ) : (
                      <>
                        <ScanFace className="w-3.5 h-3.5" /> Enable Fingerprint / Face ID
                      </>
                    )}
                  </button>
                </div>
              )}

              {bioMsg && (
                <div className={`p-2 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  bioMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                }`}>
                  {bioMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                  <span>{bioMsg.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Local Data Backup & Storage Info */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Local Storage & Data Backup
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              100% of your financial data is stored locally in your browser’s localStorage. Download a JSON file for safe offline backups.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="py-2.5 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download Backup (.json)
              </button>

              <label className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center">
                <UploadCloud className="w-4 h-4" /> Restore Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Need clean state?</span>
              <button
                type="button"
                onClick={onResetDemoData}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset to NZ Demo Data
              </button>
            </div>
          </div>

          {/* AI Settings Box */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" /> AI Tax Advisor Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Bring your own API Key to enable real-time generative AI tax gap analysis. Stored locally.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              localStorage.setItem('kiwi_ai_provider', aiProvider);
              
              if (aiProvider === 'GEMINI') {
                if (aiApiKey.trim()) {
                  localStorage.setItem('kiwi_ai_api_key', aiApiKey.trim());
                } else {
                  localStorage.removeItem('kiwi_ai_api_key');
                }
              } else if (aiProvider === 'GROQ') {
                if (groqApiKey.trim()) {
                  localStorage.setItem('kiwi_groq_api_key', groqApiKey.trim());
                } else {
                  localStorage.removeItem('kiwi_groq_api_key');
                }
              }
              alert('AI Provider settings saved securely to your browser!');
            }} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  AI Engine Provider:
                </label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 dark:text-slate-100 font-medium"
                >
                  <option value="GEMINI">Google Gemini (Gemini 3.6 Flash)</option>
                  <option value="GROQ">Groq (Llama 3 70B/8B)</option>
                </select>
              </div>

              {aiProvider === 'GEMINI' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Google Gemini API Key:
                  </label>
                  <input
                    type="password"
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 dark:text-slate-100 font-mono tracking-widest"
                  />
                </div>
              )}

              {aiProvider === 'GROQ' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Groq API Key:
                  </label>
                  <input
                    type="password"
                    value={groqApiKey}
                    onChange={(e) => setGroqApiKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 dark:text-slate-100 font-mono tracking-widest"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Save AI Settings
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* User Profile Create / Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                {editingProfile ? 'Edit User Profile' : 'Create New User Profile'}
              </h3>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aroha Taylor"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. aroha@company.co.nz"
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role / Position
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Owner, Accountant, Director"
                    value={profRole}
                    onChange={(e) => setProfRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 021 123 4567"
                    value={profPhone}
                    onChange={(e) => setProfPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  IRD Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123-456-789"
                  value={profIrd}
                  onChange={(e) => setProfIrd(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-600 dark:text-slate-100 font-mono font-bold"
                />
              </div>

              {/* Bind Bank Accounts Checkbox List */}
              {accounts.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Assign Bank Accounts to this User Profile:
                  </label>
                  <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    {accounts.map((acc) => {
                      const isChecked = profAccountIds.includes(acc.id);
                      return (
                        <label
                          key={acc.id}
                          className="flex items-center gap-2 p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProfAccountIds([...profAccountIds, acc.id]);
                              } else {
                                setProfAccountIds(profAccountIds.filter((id) => id !== acc.id));
                              }
                            }}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{acc.name}</span>
                          <span className="text-[11px] font-mono text-slate-400">({acc.accountNumber})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl shadow"
                >
                  {editingProfile ? 'Save Profile Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
