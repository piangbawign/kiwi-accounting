import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  Plus,
  Check,
  Layers,
  Sparkles,
  X,
  Briefcase,
  ShieldCheck,
  Home,
  Tag,
  User,
  Users,
  Trash2,
} from 'lucide-react';
import { BusinessEntity, UserProfile } from '../types';

interface MultiEntitySelectorProps {
  entities: BusinessEntity[];
  userProfiles?: UserProfile[];
  activeEntityId: string;
  onSelectEntity: (entityId: string) => void;
  onAddEntity: (newEntity: BusinessEntity) => void;
  onDeleteEntity?: (entityId: string) => void;
  onDeleteUserProfile?: (profileId: string) => void;
}

export const MultiEntitySelector: React.FC<MultiEntitySelectorProps> = ({
  entities,
  userProfiles = [],
  activeEntityId,
  onSelectEntity,
  onAddEntity,
  onDeleteEntity,
  onDeleteUserProfile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form state for adding new entity
  const [name, setName] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [irdNumber, setIrdNumber] = useState('');
  const [nzbn, setNzbn] = useState('');
  const [entityType, setEntityType] = useState<BusinessEntity['entityType']>('NZ_COMPANY');
  const [colorBadge, setColorBadge] = useState('bg-indigo-600');

  const activeEntity = entities.find((e) => e.id === activeEntityId);
  const activeProfile = userProfiles.find((p) => p.id === activeEntityId);

  const activeDisplayName =
    activeEntityId === 'ALL'
      ? 'Consolidated (All Accounts)'
      : activeProfile
        ? activeProfile.name
        : activeEntity
          ? activeEntity.tradingName || activeEntity.name
          : 'Select Profile / Entity';

  const handleCreateEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newEnt: BusinessEntity = {
      id: `ent-${Date.now()}`,
      name,
      tradingName: tradingName || name,
      irdNumber: irdNumber || '123-456-789',
      nzbn: nzbn || '9429000000000',
      entityType,
      colorBadge,
      isDefault: false,
    };

    onAddEntity(newEnt);
    onSelectEntity(newEnt.id);
    setShowAddModal(false);
    setName('');
    setTradingName('');
    setIrdNumber('');
    setNzbn('');
  };

  return (
    <div className="relative inline-block text-left w-full md:w-auto">
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full md:w-auto justify-between gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all shadow-2xs"
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${activeEntityId === 'ALL'
                ? 'bg-amber-500'
                : activeProfile
                  ? 'bg-emerald-500'
                  : activeEntity?.colorBadge || 'bg-teal-600'
              }`}
          />
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-normal uppercase tracking-wider leading-none hidden sm:block">
              {activeProfile ? 'User Profile' : 'Active Entity'}
            </span>
            <span className="hidden sm:inline text-xs font-extrabold max-w-[120px] truncate leading-tight">
              {activeDisplayName}
            </span>
            <span className="sm:hidden text-xs font-extrabold truncate leading-tight">
              {activeDisplayName}
            </span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0 ml-1" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 md:left-auto md:right-0 mt-2 w-full md:w-80 min-w-[280px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Entity & User Profile Switcher
            </span>
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
              {entities.length + userProfiles.length} Total
            </span>
          </div>

          <div className="py-1 space-y-1 max-h-72 overflow-y-auto">
            {/* Consolidated Option */}
            <button
              type="button"
              onClick={() => {
                onSelectEntity('ALL');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold transition-all ${activeEntityId === 'ALL'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div>Consolidated Overview</div>
                  <div className="text-[10px] font-normal text-slate-400">All Entities & Profiles</div>
                </div>
              </div>
              {activeEntityId === 'ALL' && <Check className="w-4 h-4 text-amber-600" />}
            </button>

            {/* User Profiles Section */}
            {userProfiles.length > 0 && (
              <div className="pt-2">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-emerald-500" />
                  User Profiles (Bound Accounts)
                </div>
                {userProfiles.map((prof) => (
                  <div
                    key={prof.id}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all group ${activeEntityId === prof.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectEntity(prof.id);
                        setIsOpen(false);
                      }}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate max-w-[150px]">
                        <div className="truncate">{prof.name}</div>
                        <div className="text-[10px] font-normal text-slate-400">
                          {prof.role} • {prof.associatedAccountIds?.length || 0} account(s)
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {activeEntityId === prof.id && <Check className="w-4 h-4 text-emerald-600" />}
                      {onDeleteUserProfile && (
                        confirmDeleteId === prof.id ? (
                          <div className="flex items-center gap-1 animate-in fade-in duration-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteUserProfile(prof.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold rounded shadow-xs transition-all"
                            >
                              Delete?
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(null);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(prof.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 opacity-60 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-all"
                            title="Remove this profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Business Entities Section */}
            {entities.length > 0 && (
              <div className="pt-2">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-teal-500" />
                  Business Entities & Trusts
                </div>
                {entities.map((ent) => (
                  <div
                    key={ent.id}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all group ${activeEntityId === ent.id
                        ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectEntity(ent.id);
                        setIsOpen(false);
                      }}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      <div
                        className={`w-6 h-6 rounded-lg text-white flex items-center justify-center font-black shrink-0 ${ent.colorBadge || 'bg-teal-600'
                          }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate max-w-[150px]">
                        <div className="truncate">{ent.tradingName || ent.name}</div>
                        <div className="text-[10px] font-mono font-normal text-slate-400">
                          IRD: {ent.irdNumber || 'N/A'}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {activeEntityId === ent.id && <Check className="w-4 h-4 text-teal-600" />}
                      {onDeleteEntity && (
                        confirmDeleteId === ent.id ? (
                          <div className="flex items-center gap-1 animate-in fade-in duration-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteEntity(ent.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold rounded shadow-xs transition-all"
                            >
                              Delete?
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(null);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(ent.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 opacity-60 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-all"
                            title="Remove this business profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                setShowAddModal(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-bold text-xs rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-teal-600" />
              Add Business / Trust Profile
            </button>
          </div>
        </div>
      )}

      {/* Modal for Creating New Entity */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Add Business Entity / Trust
                  </h3>
                  <p className="text-xs text-slate-500">Multi-entity isolation & GST separation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntity} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Legal Entity Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kiwi Tech Solutions NZ Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Trading Name / Brand
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kiwi Cloud"
                  value={tradingName}
                  onChange={(e) => setTradingName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    IRD Tax Number
                  </label>
                  <input
                    type="text"
                    placeholder="123-456-789"
                    value={irdNumber}
                    onChange={(e) => setIrdNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NZBN Number
                  </label>
                  <input
                    type="text"
                    placeholder="9429000000000"
                    value={nzbn}
                    onChange={(e) => setNzbn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Structure Type
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="NZ_COMPANY">NZ Registered Company (IR4 28%)</option>
                  <option value="SOLE_TRADER">Sole Trader / Self-Employed (IR3)</option>
                  <option value="REGISTERED_CHARITY">Registered Charity (Charities Services CC)</option>
                  <option value="CHURCH_ORGANISATION">Church Organisation / Religious Body</option>
                  <option value="TRUST">Family / Investment Trust (IR6)</option>
                  <option value="PARTNERSHIP">Partnership (IR7)</option>
                  <option value="LOOK_THROUGH_COMPANY">Look-Through Company (LTC)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Profile Badge Color
                </label>
                <div className="flex gap-2">
                  {['bg-teal-600', 'bg-indigo-600', 'bg-amber-600', 'bg-emerald-600', 'bg-rose-600', 'bg-sky-600'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setColorBadge(color)}
                      className={`w-7 h-7 rounded-full ${color} ${colorBadge === color ? 'ring-2 ring-offset-2 ring-slate-800' : ''
                        }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  Save Entity Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
