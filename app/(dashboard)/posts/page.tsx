'use client';

import { useState, useEffect, useRef, useCallback, FormEvent, startTransition } from 'react';
import { Spinner } from '@/components/spinner';
import Link from 'next/link';
import { listPosts, createPost, updatePost, deletePost } from '@/app/actions';
import { getStoredUser, User } from '@/lib/auth';
import {
  MessageSquare,
  Plus,
  Search,
  User as UserIcon,
  Clock,
  ExternalLink,
  X,
  AlertCircle,
  Trash2,
  Edit2,
} from 'lucide-react';

interface Post {
  _id: string;
  id?: string;
  title: string;
  content: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser] = useState<User | null>(() => getStoredUser());

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasLoaded = useRef(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    startTransition(async () => {
      const res = await listPosts();
      setLoading(false);
      if (res.success && res.data) {
        setPosts(res.data.map((p: any) => ({ ...p, _id: p._id ?? p.id })));
      }
    });
  }, []);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadPosts();
  }, [loadPosts]);

  const handleOpenCreateModal = () => {
    setEditingPost(null);
    setTitle('');
    setContent('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSavePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    setError(null);

    startTransition(async () => {
      let res;
      if (editingPost) {
        res = await updatePost(editingPost._id, title, content);
      } else {
        res = await createPost(title, content);
      }

      setSaving(false);

      if (!res.success) {
        setError(res.error?.message || 'Failed to save post.');
        return;
      }

      setIsModalOpen(false);
      loadPosts();
    });
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setDeletingId(id);
    const res = await deletePost(id);
    setDeletingId(null);
    if (res.success) {
      loadPosts();
    } else {
      alert(res.error?.message || 'Failed to delete post');
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-teal-500" />
            Community Posts Feed
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse and publish community discussions. Click author tags to view MongoDB $lookup aggregations.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-teal-600/30 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Publish Post
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search posts by topic or content..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm"
        />
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3"
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-500 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No posts found</h3>
          <p className="text-xs text-slate-500">
            {searchQuery ? 'No posts matched your query.' : 'Be the first to publish a community post!'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5 mt-2"
            >
              <Plus className="w-3.5 h-3.5" /> Publish Post
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isAuthorOrAdmin =
              currentUser?.role === 'admin' || (post.userId && (currentUser?._id ?? currentUser?.id) === post.userId);

            return (
              <div
                key={post._id || post.id}
                className="glass-card rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all space-y-3 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent'}
                      </span>

                      {post.userId && (
                        <Link
                          href={`/posts/user/${post.userId}`}
                          className="inline-flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400 hover:underline bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-100 dark:border-teal-900/50"
                        >
                          <UserIcon className="w-3 h-3" />
                          View Author&apos;s Aggregated Posts ($lookup)
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {isAuthorOrAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(post)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Post"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        disabled={deletingId === post._id}
                        className="disabled:opacity-50 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Post"
                      >
                        {deletingId === post._id ? <Spinner className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg glass-card rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-500" />
                {editingPost ? 'Edit Post' : 'Publish New Post'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSavePost} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Content</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-teal-600/30 transition-all"
                >
                  {saving && <Spinner className="w-3.5 h-3.5" />}
                  {saving ? 'Publishing...' : editingPost ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
