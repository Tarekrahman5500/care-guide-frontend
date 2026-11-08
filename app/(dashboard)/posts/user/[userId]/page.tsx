import Link from 'next/link';
import { cookies } from 'next/headers';
import { fetchApi } from '@/lib/api-client';
import {
  User as UserIcon,
  MessageSquare,
  ArrowLeft,
  Mail,
  Shield,
  Tag,
  Clock,
  Layers,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserPostsPage({ params }: PageProps) {
  const { userId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const res = await fetchApi(`/posts/user/${userId}`, { token });
  
  // Backend $lookup aggregation returns array [ { id, name, email, posts: [...] } ]
  const userData = Array.isArray(res.data) ? res.data[0] : res.data;

  if (!res.success || !userData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link
          href="/posts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Posts Feed
        </Link>
        <div className="glass-card rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-3 max-w-md mx-auto">
          <MessageSquare className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">User posts not found</h2>
          <p className="text-xs text-slate-500">
            {res.error?.message || 'Could not retrieve user posts using aggregation lookup.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href="/posts"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Posts Feed
      </Link>

      {/* User Info Header Card */}
      <div className="glass-card rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xl flex items-center justify-center border border-indigo-200 dark:border-indigo-700">
              {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{userData.name}</h1>
                {userData.role && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      userData.role === 'admin'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    {userData.role}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {userData.email}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900/50 text-teal-800 dark:text-teal-300 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Layers className="w-4 h-4 text-teal-500" />
              MongoDB $lookup Aggregation
            </div>
            <p className="text-[11px] opacity-90">
              User profile & posts fetched via single `$lookup` pipeline.
            </p>
          </div>
        </div>

        {/* Interests */}
        {userData.interests && userData.interests.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-indigo-500" /> Interests:
            </span>
            {userData.interests.map((interest: string) => (
              <span
                key={interest}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* User's Aggregated Posts */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-500" />
          Published Posts ({userData.posts?.length || 0})
        </h2>

        {!userData.posts || userData.posts.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              No posts found for this user.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {userData.posts.map((post: any) => (
              <div
                key={post.id || post._id}
                className="glass-card rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{post.title}</h3>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line">
                  {post.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
