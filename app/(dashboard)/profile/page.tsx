'use client';

import { useState, useEffect, FormEvent, startTransition } from 'react';
import { updateProfile } from '@/app/actions';
import { getStoredUser, User } from '@/lib/auth';
import {
  User as UserIcon,
  Mail,
  Shield,
  Tag,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Save,
  Clock,
} from 'lucide-react';

const SUGGESTED_INTERESTS = ['chess', 'reading', 'coding', 'music', 'fitness', 'gaming', 'art', 'travel', 'cooking', 'ai'];

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = getStoredUser();
    if (u) {
      setUser(u);
      setName(u.name);
      setInterests(u.interests || []);
    }
  }, []);

  const toggleInterest = (tag: string) => {
    const trimmed = tag.toLowerCase().trim();
    if (!trimmed) return;
    if (interests.includes(trimmed)) {
      setInterests(interests.filter((i) => i !== trimmed));
    } else {
      setInterests([...interests, trimmed]);
    }
  };

  const handleAddCustomInterest = (e: FormEvent) => {
    e.preventDefault();
    if (!customInterest.trim()) return;
    toggleInterest(customInterest);
    setCustomInterest('');
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccessMsg(null);
    setError(null);

    const userId = user._id || user.id || '';
    if (!userId) return;

    startTransition(async () => {
      const res = await updateProfile(userId, { name, interests });

      setLoading(false);

      if (!res.success || !res.data) {
        setError(res.error?.message || 'Failed to update profile.');
        return;
      }

      const updatedUser = { ...user, name: res.data.name, interests: res.data.interests };
      setUser(updatedUser);

      // Update stored session cookies
      if (typeof window !== 'undefined') {
        const Cookies = (await import('js-cookie')).default;
        Cookies.set('user', JSON.stringify(updatedUser), { expires: 7, path: '/' });
      }

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    });
  };

  if (!user) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading profile information...
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-indigo-500" />
          My Profile & Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details and interest preferences.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </p>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${
                user.role === 'admin'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              }`}
            >
              {user.role === 'admin' ? <Shield className="w-3 h-3 text-amber-500" /> : <UserIcon className="w-3 h-3" />}
              {user.role} Account
            </span>
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-teal-700 dark:text-teal-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address (Immutable)</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Interests Preference Section */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              Manage Interest Tags
            </label>

            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_INTERESTS.map((tag) => {
                const isSelected = interests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tag} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                placeholder="Add custom interest tag..."
                className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddCustomInterest}
                className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Tag
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
