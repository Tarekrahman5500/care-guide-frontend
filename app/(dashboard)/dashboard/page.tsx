import Link from 'next/link';
import { cookies } from 'next/headers';
import { fetchApi } from '@/lib/api-client';
import {
  FileText,
  MessageSquare,
  Users,
  PieChart,
  Shield,
  User as UserIcon,
  Plus,
  ArrowUpRight,
  Tag,
} from 'lucide-react';

const TONES = {
  emerald: { bar: 'border-t-emerald-500', tile: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' },
  blue: { bar: 'border-t-sky-500', tile: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400' },
  gold: { bar: 'border-t-amber-400', tile: 'bg-amber-50 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400' },
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof TONES;
}) {
  const t = TONES[tone];
  return (
    <div className={`bg-card rounded-xl border border-border border-t-[3px] ${t.bar} p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground pt-0.5">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.tile}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="font-heading text-2xl font-bold tracking-tight mt-2">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const userRole = cookieStore.get('userRole')?.value || 'user';

  // Fetch current user details
  const [userRes, notesRes, postsRes] = await Promise.all([
    fetchApi('/users/me', { token }),
    fetchApi('/notes', { token }),
    fetchApi('/posts', { token }),
  ]);
  const user = userRes.data;

  const notes = notesRes.data || [];

  const posts = postsRes.data || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {user?.name || 'User'}. Overview of your notes, posts and account.
          </p>
        </div>
        <Link
          href="/notes?action=new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-sm rounded-lg transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Note
        </Link>
      </div>

      {/* Stats */}
      <section className="space-y-3">
        <h2 className="section-title">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Notes" value={notes.length} hint="Secure encrypted notes" icon={FileText} tone="emerald" />
          <StatCard label="Total Posts" value={posts.length} hint="Community discussions" icon={MessageSquare} tone="blue" />
          <StatCard
            label="Role Access"
            value={<span className="capitalize">{userRole}</span>}
            hint={userRole === 'admin' ? 'Full system privileges' : 'Standard user access'}
            icon={userRole === 'admin' ? Shield : UserIcon}
            tone="gold"
          />
          <StatCard label="Interests" value={user?.interests?.length || 0} hint="Aggregated categories" icon={Tag} tone="blue" />
        </div>

        {user?.interests && user.interests.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-medium text-muted-foreground mr-1">Your interests:</span>
            {user.interests.map((interest: string) => (
              <span
                key={interest}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border capitalize"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Admin Quick Action Portal (Visible only to Admin role) */}
      {userRole === 'admin' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Admin Management Hub</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/users"
              className="bg-white dark:bg-[#161d1a] rounded-xl p-6 border border-amber-200/80 dark:border-amber-900/40 hover:border-amber-500 transition-all group shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                    User Management & Roles
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Create new users, list all system users, update roles, or remove accounts.
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

            <Link
              href="/admin/interests"
              className="bg-white dark:bg-[#161d1a] rounded-xl p-6 border border-indigo-200/80 dark:border-indigo-900/40 hover:border-indigo-500 transition-all group shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    Interest Aggregation Pipeline
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    View users grouped by interests powered by NestJS MongoDB single aggregate pipeline.
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Preview Section: Recent Notes & Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notes Card */}
        <div className="bg-white dark:bg-[#161d1a] rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Notes</h2>
            </div>
            <Link
              href="/notes"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {notes.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No notes found</p>
              <p className="text-[11px] text-slate-400">Create your first note to start organizing ideas.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notes.slice(0, 4).map((note: any) => (
                <div
                  key={note.id || note._id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {note.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                      {note.content}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Posts Card */}
        <div className="bg-white dark:bg-[#161d1a] rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Community Posts</h2>
            </div>
            <Link
              href="/posts"
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              View Feed <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No posts published yet</p>
              <p className="text-[11px] text-slate-400">Share your thoughts with community posts.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {posts.slice(0, 4).map((post: any) => (
                <div
                  key={post.id || post._id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {post.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                      {post.content}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
