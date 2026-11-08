'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getStoredUser, User } from '@/lib/auth';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  PieChart,
  User as UserIcon,
  BookOpen,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Notes', href: '/notes', icon: FileText },
  { label: 'Posts Feed', href: '/posts', icon: MessageSquare },
];
const adminItems = [
  { label: 'User Management', href: '/admin/users', icon: Users },
  { label: 'Interest Analytics', href: '/admin/interests', icon: PieChart },
];
const accountItems = [{ label: 'Profile Settings', href: '/profile', icon: UserIcon }];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const isActive = (href: string) => (href === '/dashboard' ? pathname === href : pathname.startsWith(href));

  const group = (title: string, items: typeof mainItems) => (
    <div>
      <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">{title}</p>
      <nav className="space-y-0.5">
        {items.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-slate-900 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p className="font-heading font-bold text-white">CareGuide</p>
              <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Secure Notes</p>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 text-sidebar-foreground/70 hover:text-white" aria-label="Close sidebar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {group('Main', mainItems)}
          {user?.role === 'admin' && group('Admin', adminItems)}
          {group('Account', accountItems)}
        </div>

        {user && (
          <div className="p-3 border-t border-sidebar-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user.role}</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
