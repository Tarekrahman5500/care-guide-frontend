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
  Sparkles,
  Tag,
} from 'lucide-react';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const userRole = cookieStore.get('userRole')?.value || 'user';

  // Fetch current user details
  const userRes = await fetchApi('/users/me', { token });
  const user = userRes.data;

  // Fetch notes count
  const notesRes = await fetchApi('/notes', { token });
  const notes = notesRes.data || [];

  // Fetch posts count
  const postsRes = await fetchApi('/posts', { token });
  const posts = postsRes.data || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-teal-500/10 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-teal-950/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3.5 h-3.5" />
              Welcome to CareGuide Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Hello, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              You are logged in as an{' '}
              <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                {userRole}
              </span>
              . Manage your secure notes, write posts, or explore interest aggregations.
            </p>

            {/* Interest Badges */}
            {user?.interests && user.interests.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-indigo-500" /> Your Interests:
                </span>
                {user.interests.map((interest: string) => (
                  <span
                    key={interest}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 capitalize"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/notes?action=new"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Note
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Notes Stat */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Notes</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{notes.length}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Secure encrypted notes</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Posts Stat */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Posts</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{posts.length}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Community discussions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/50">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* User Role Stat */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role Access</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white capitalize">{userRole}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {userRole === 'admin' ? 'Full System Privileges' : 'Standard User Access'}
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
              userRole === 'admin'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {userRole === 'admin' ? <Shield className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
          </div>
        </div>

        {/* Interests Count Stat */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Interests</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {user?.interests?.length || 0}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Aggregated categories</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/50">
            <Tag className="w-6 h-6" />
          </div>
        </div>
      </div>

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
              className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-amber-200/80 dark:border-amber-900/40 hover:border-amber-500 transition-all group shadow-xs"
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
              className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-indigo-200/80 dark:border-indigo-900/40 hover:border-indigo-500 transition-all group shadow-xs"
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
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
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
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
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
