import React, { useState } from 'react';
import { UserProfile, UserIntent } from '../types';
import { User, MapPin, Briefcase, Landmark, CreditCard, ShieldAlert, CheckCircle2, XCircle, Edit3, Check } from 'lucide-react';

interface ProfileCardProps {
  profile: UserProfile;
  intent: UserIntent;
  onUpdateProfile: (updatedProfile: UserProfile, updatedIntent: UserIntent) => void;
  parsedBy?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  intent,
  onUpdateProfile,
  parsedBy
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [editedIntent, setEditedIntent] = useState<UserIntent>(intent);

  const handleSave = () => {
    onUpdateProfile(editedProfile, editedIntent);
    setIsEditing(false);
  };

  const renderBadge = (label: string, value: string | number | boolean | null, format?: 'currency' | 'land' | 'boolean') => {
    let displayValue = 'Unspecified (null)';
    let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';

    if (value !== null && value !== undefined) {
      if (format === 'currency' && typeof value === 'number') {
        displayValue = `₹${value.toLocaleString('en-IN')}/year`;
        badgeStyle = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold';
      } else if (format === 'land' && typeof value === 'number') {
        displayValue = `${value} Acres`;
        badgeStyle = 'bg-orange-100 dark:bg-orange-950/80 text-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800 font-bold';
      } else if (format === 'boolean') {
        displayValue = value ? 'YES' : 'NO';
        badgeStyle = value
          ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-bold'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      } else {
        displayValue = String(value).toUpperCase();
        badgeStyle = 'bg-slate-800 dark:bg-slate-950 text-orange-300 border-slate-700 dark:border-slate-800 font-semibold';
      }
    }

    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        <span className={`text-xs px-2.5 py-0.5 rounded border ${badgeStyle}`}>
          {displayValue}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      
      {/* Header Bar */}
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" /> Extracted Socio-Economic Profile (JSON Schema)
            </h2>
            {parsedBy && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono font-bold border border-blue-200 dark:border-blue-800">
                {parsedBy}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isEditing
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
          <span>{isEditing ? 'Save Attributes' : 'Edit Attributes'}</span>
        </button>
      </div>

      <div className="p-5">
        {!isEditing ? (
          /* Readonly Display Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Demographic */}
            <div className="space-y-3 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-500" /> Demographics
              </h3>
              {renderBadge('Age', profile.age)}
              {renderBadge('Gender', profile.gender)}
              {renderBadge('Category', profile.category)}
            </div>

            {/* Location & Area */}
            <div className="space-y-3 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Location
              </h3>
              {renderBadge('State', profile.state)}
              {renderBadge('District', profile.district)}
              {renderBadge('Area Type', profile.area_type)}
            </div>

            {/* Economic & Occupation */}
            <div className="space-y-3 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Occupation & Assets
              </h3>
              {renderBadge('Occupation', profile.occupation)}
              {renderBadge('Annual Income', profile.annual_income_inr, 'currency')}
              {renderBadge('Landholding', profile.landholding_acres, 'land')}
            </div>

            {/* Special Status */}
            <div className="space-y-3 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 md:col-span-2 lg:col-span-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" /> Vulnerability & Special Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {renderBadge('BPL Card Holder', profile.is_bpl, 'boolean')}
                {renderBadge('Disabled / Divyang', profile.is_disabled, 'boolean')}
                {renderBadge('Minority Status', profile.minority_status, 'boolean')}
              </div>
            </div>

            {/* Intent */}
            <div className="space-y-3 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-purple-500" /> Detected Intent
              </h3>
              {renderBadge('Query Type', intent.query_type)}
              {renderBadge('Target Sector', intent.target_sector)}
            </div>

          </div>
        ) : (
          /* Edit Form Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-medium">
            
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase text-[10px] tracking-wider">Age (Years)</label>
              <input
                type="number"
                value={editedProfile.age ?? ''}
                onChange={e => setEditedProfile({ ...editedProfile, age: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. 32"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase text-[10px] tracking-wider">Gender</label>
              <select
                value={editedProfile.gender ?? ''}
                onChange={e => setEditedProfile({ ...editedProfile, gender: (e.target.value || null) as any })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">null (Unspecified)</option>
                <option value="male">male</option>
                <option value="female">female</option>
                <option value="transgender">transgender</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase text-[10px] tracking-wider">Category</label>
              <select
                value={editedProfile.category ?? ''}
                onChange={e => setEditedProfile({ ...editedProfile, category: (e.target.value || null) as any })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">null (Unspecified)</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase text-[10px] tracking-wider">State</label>
              <input
                type="text"
                value={editedProfile.state ?? ''}
                onChange={e => setEditedProfile({ ...editedProfile, state: e.target.value || null })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. Bihar"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase text-[10px] tracking-wider">District</label>
              <input
                type="text"
                value={editedProfile.district ?? ''}
                onChange={e => setEditedProfile({ ...editedProfile, district: e.target.value || null })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. Samastipur"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase text-[10px] tracking-wider">Area Type</label>
              <select
                value={editedProfile.area_type ?? ''}
                onChange={e => setEditedProfile({ ...editedProfile, area_type: (e.target.value || null) as any })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">null (Unspecified)</option>
                <option value="rural">rural</option>
                <option value="urban">urban</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase text-[10px] tracking-wider">Occupation</label>
              <select
                value={editedProfile.occupation ?? ''}
                onChange={e => setEditedProfile({ ...editedProfile, occupation: (e.target.value || null) as any })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">null (Unspecified)</option>
                <option value="farmer">farmer</option>
                <option value="student">student</option>
                <option value="unemployed">unemployed</option>
                <option value="artisan">artisan</option>
                <option value="entrepreneur">entrepreneur</option>
                <option value="other">other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase text-[10px] tracking-wider">Annual Income (INR)</label>
              <input
                type="number"
                value={editedProfile.annual_income_inr ?? ''}
                onChange={e => setEditedProfile({ ...editedProfile, annual_income_inr: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. 75000"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase text-[10px] tracking-wider">Landholding (Acres)</label>
              <input
                type="number"
                step="0.1"
                value={editedProfile.landholding_acres ?? ''}
                onChange={e => setEditedProfile({ ...editedProfile, landholding_acres: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. 1.5"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase text-[10px] tracking-wider">Is BPL Card Holder?</label>
              <select
                value={editedProfile.is_bpl === null ? '' : editedProfile.is_bpl ? 'true' : 'false'}
                onChange={e => setEditedProfile({ ...editedProfile, is_bpl: e.target.value === '' ? null : e.target.value === 'true' })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">null (Unspecified)</option>
                <option value="true">true (Yes)</option>
                <option value="false">false (No)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase text-[10px] tracking-wider">Is Disabled / Divyang?</label>
              <select
                value={editedProfile.is_disabled === null ? '' : editedProfile.is_disabled ? 'true' : 'false'}
                onChange={e => setEditedProfile({ ...editedProfile, is_disabled: e.target.value === '' ? null : e.target.value === 'true' })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">null (Unspecified)</option>
                <option value="true">true (Yes)</option>
                <option value="false">false (No)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase text-[10px] tracking-wider">Target Sector</label>
              <select
                value={editedIntent.target_sector}
                onChange={e => setEditedIntent({ ...editedIntent, target_sector: e.target.value as any })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">all</option>
                <option value="agriculture">agriculture</option>
                <option value="education">education</option>
                <option value="housing">housing</option>
                <option value="health">health</option>
                <option value="finance">finance</option>
              </select>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};

