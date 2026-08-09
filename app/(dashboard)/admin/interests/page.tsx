import { cookies } from 'next/headers';
import { fetchApi } from '@/lib/api-client';
import {
  PieChart,
  Tag,
  Users,
  Shield,
  Layers,
  Sparkles,
  User as UserIcon,
  Mail,
  CheckCircle2,
} from 'lucide-react';

export default async function AdminInterestsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const res = await fetchApi('/users/interests/group-by', { token });
  const groups: Array<{ interest: string; users: any[] }> = res.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-teal-500/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Layers className="w-3.5 h-3.5" />
              Single MongoDB aggregate() Pipeline
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Interest Groupings Analytics
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
              Visualizing users grouped by interest tags, directly aggregated via NestJS MongoDB single aggregation pipeline.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl glass-card border border-indigo-200 dark:border-indigo-800 text-center shrink-0">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{groups.length}</p>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Interest Groups</p>
          </div>
        </div>
      </div>

      {!res.success ? (
        <div className="glass-card rounded-2xl p-8 text-center border border-rose-200 text-rose-700 dark:text-rose-300 space-y-2">
          <PieChart className="w-8 h-8 mx-auto" />
          <h2 className="text-sm font-bold">Failed to load interest aggregations</h2>
          <p className="text-xs">{res.error?.message || 'Access restricted to admin users.'}</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-2">
          <PieChart className="w-8 h-8 text-slate-400 mx-auto" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">No interest groups registered</h2>
          <p className="text-xs text-slate-500">Users need to specify interest tags upon registration.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => (
            <div
              key={group.interest}
              className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-indigo-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Card Title & Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                      <Tag className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                      {group.interest}
                    </h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {group.users?.length || 0} {group.users?.length === 1 ? 'User' : 'Users'}
                  </span>
                </div>

                {/* Users List inside group */}
                <div className="space-y-2">
                  {group.users && group.users.length > 0 ? (
                    group.users.map((user: any) => (
                      <div
                        key={user._id || user.email}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {user.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>

                        {user.role === 'admin' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shrink-0">
                            ADMIN
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No users in group</p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Interest Category</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                  #{group.interest}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
