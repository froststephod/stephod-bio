'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  Users,
  Megaphone,
  UserCheck,
  UserX,
  Search,
  Edit3,
  Award,
  Trash2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Heart,
  TrendingUp,
  X,
  Crown,
  ChevronRight,
} from 'lucide-react';
import AnnouncementBanner from '@/components/AnnouncementBanner';

interface AdminSession {
  role: 'owner' | 'admin';
  name: string;
  exp: number;
}

interface UserRow {
  username: string;
  displayName: string;
  owner: string;
  views: number;
  likes: number;
  banned: boolean;
  updatedAt: string;
}

interface BadgePreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

interface FullProfile {
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  occupation?: string;
  location?: string;
  banned?: boolean;
  banReason?: string;
  badges?: { id: string; name: string; icon: string; color: string }[];
}

interface AnnouncementState {
  text: string;
  type: 'info' | 'warn' | 'success';
  on: boolean;
  by?: string;
  t?: number;
}

interface AuditItem {
  t: number;
  a: string;
  x: string;
  g: string;
}

interface AdminAccount {
  name: string;
  createdAt: number;
  by: string;
}

export default function AdminPage() {
  // Authentication & session state
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [session, setSession] = useState<AdminSession | null>(null);

  // Login form state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'announcement' | 'admins' | 'audit'>('overview');

  // Users data
  const [users, setUsers] = useState<UserRow[]>([]);
  const [badgePresets, setBadgePresets] = useState<BadgePreset[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    bannedUsers: 0,
    totalViews: 0,
    totalLikes: 0,
    top: [] as { username: string; displayName: string; views: number }[],
  });
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [dataLoading, setDataLoading] = useState(false);

  // Announcement state
  const [announcement, setAnnouncement] = useState<AnnouncementState>({
    text: '',
    type: 'info',
    on: false,
  });
  const [announceSaving, setAnnounceSaving] = useState(false);
  const [announceMsg, setAnnounceMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Sub-admins state (Owner only)
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Audit log state
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Modals state
  const [editingUser, setEditingUser] = useState<FullProfile | null>(null);
  const [editForm, setEditForm] = useState({ displayName: '', bio: '', occupation: '', location: '' });
  const [editSaving, setEditSaving] = useState(false);

  const [banningUser, setBanningUser] = useState<UserRow | null>(null);
  const [banReasonInput, setBanReasonInput] = useState('');
  const [banSaving, setBanSaving] = useState(false);

  const [badgeModalUser, setBadgeModalUser] = useState<FullProfile | null>(null);
  const [badgeActionLoading, setBadgeActionLoading] = useState<string | null>(null);

  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  // Check login session on load
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login');
      const data = await res.json();
      setConfigured(data.configured !== false);
      if (data.loggedIn && data.session) {
        setSession(data.session);
        fetchUsers();
        fetchAnnouncement();
        if (data.session.role === 'owner') {
          fetchAdmins();
        }
        fetchAudit();
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSession(data.session);
        setPassword('');
        fetchUsers();
        fetchAnnouncement();
        if (data.session.role === 'owner') {
          fetchAdmins();
        }
        fetchAudit();
      } else {
        setLoginError(data.error || 'รหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      setLoginError('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
    } catch {
      // ignore
    }
    setSession(null);
    setActiveTab('overview');
  }

  async function fetchUsers() {
    setDataLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setBadgePresets(data.badgePresets || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch {
      // ignore
    } finally {
      setDataLoading(false);
    }
  }

  async function fetchAnnouncement() {
    try {
      const res = await fetch('/api/admin/announcement');
      const data = await res.json();
      if (data.success && data.announcement) {
        setAnnouncement(data.announcement);
      }
    } catch {
      // ignore
    }
  }

  async function handleSaveAnnouncement() {
    setAnnounceSaving(true);
    setAnnounceMsg(null);
    try {
      const res = await fetch('/api/admin/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement),
      });
      const data = await res.json();
      if (data.success) {
        setAnnounceMsg({ type: 'ok', text: 'บันทึกประกาศสำเร็จและมีผลทันที' });
        fetchAudit();
      } else {
        setAnnounceMsg({ type: 'err', text: data.error || 'บันทึกไม่สำเร็จ' });
      }
    } catch {
      setAnnounceMsg({ type: 'err', text: 'เชื่อมต่อล้มเหลว กรุณาลองใหม่' });
    } finally {
      setAnnounceSaving(false);
    }
  }

  async function fetchAdmins() {
    try {
      const res = await fetch('/api/admin/admins');
      const data = await res.json();
      if (data.success) {
        setAdmins(data.admins || []);
      }
    } catch {
      // ignore
    }
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!newAdminName || !newAdminPass) return;
    setAdminSaving(true);
    setAdminError('');

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAdminName, password: newAdminPass }),
      });
      const data = await res.json();
      if (data.success) {
        setAdmins(data.admins || []);
        setNewAdminName('');
        setNewAdminPass('');
        fetchAudit();
      } else {
        setAdminError(data.error || 'เพิ่มแอดมินไม่สำเร็จ');
      }
    } catch {
      setAdminError('เชื่อมต่อล้มเหลว กรุณาลองใหม่');
    } finally {
      setAdminSaving(false);
    }
  }

  async function handleRemoveAdmin(name: string) {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสิทธิ์แอดมิน "${name}"?`)) return;
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        setAdmins(data.admins || []);
        fetchAudit();
      } else {
        alert(data.error || 'ลบไม่สำเร็จ');
      }
    } catch {
      alert('เชื่อมต่อล้มเหลว');
    }
  }

  async function fetchAudit() {
    setAuditLoading(true);
    try {
      const res = await fetch('/api/admin/audit');
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.entries || []);
      }
    } catch {
      // ignore
    } finally {
      setAuditLoading(false);
    }
  }

  // Open edit user modal
  async function openEditUser(username: string) {
    try {
      const res = await fetch(`/api/admin/users/${username}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setEditingUser(data.profile);
        setEditForm({
          displayName: data.profile.displayName || '',
          bio: data.profile.bio || '',
          occupation: data.profile.occupation || '',
          location: data.profile.location || '',
        });
      }
    } catch {
      alert('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
    }
  }

  async function handleSaveEditUser() {
    if (!editingUser) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.username}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setEditingUser(null);
        fetchUsers();
        fetchAudit();
      } else {
        alert(data.error || 'บันทึกไม่สำเร็จ');
      }
    } catch {
      alert('เชื่อมต่อล้มเหลว');
    } finally {
      setEditSaving(false);
    }
  }

  // Handle Ban / Unban
  async function handleToggleBan() {
    if (!banningUser) return;
    setBanSaving(true);
    const willBan = !banningUser.banned;
    try {
      const res = await fetch(`/api/admin/users/${banningUser.username}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banned: willBan,
          banReason: willBan ? banReasonInput.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBanningUser(null);
        setBanReasonInput('');
        fetchUsers();
        fetchAudit();
      } else {
        alert(data.error || 'ดำเนินการไม่สำเร็จ');
      }
    } catch {
      alert('เชื่อมต่อล้มเหลว');
    } finally {
      setBanSaving(false);
    }
  }

  // Open Badge Modal
  async function openBadgeModal(username: string) {
    try {
      const res = await fetch(`/api/admin/users/${username}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setBadgeModalUser(data.profile);
      }
    } catch {
      alert('ไม่สามารถโหลดข้อมูลตราได้');
    }
  }

  async function handleToggleBadge(presetId: string, hasBadge: boolean) {
    if (!badgeModalUser) return;
    setBadgeActionLoading(presetId);
    try {
      const res = await fetch(`/api/admin/users/${badgeModalUser.username}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          hasBadge ? { removeBadge: presetId } : { addBadge: presetId }
        ),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setBadgeModalUser(data.profile);
        fetchUsers();
        fetchAudit();
      } else {
        alert(data.error || 'ดำเนินการไม่สำเร็จ');
      }
    } catch {
      alert('เชื่อมต่อล้มเหลว');
    } finally {
      setBadgeActionLoading(null);
    }
  }

  // Delete User
  async function handleDeleteUser() {
    if (!deletingUser) return;
    setDeleteSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.username}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDeletingUser(null);
        fetchUsers();
        fetchAudit();
      } else {
        alert(data.error || 'ลบโปรไฟล์ไม่สำเร็จ');
      }
    } catch {
      alert('เชื่อมต่อล้มเหลว');
    } finally {
      setDeleteSaving(false);
    }
  }

  // Filtered users for search
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.displayName.toLowerCase().includes(userSearch.toLowerCase());
      if (!matchSearch) return false;
      if (statusFilter === 'active') return !u.banned;
      if (statusFilter === 'banned') return u.banned;
      return true;
    });
  }, [users, userSearch, statusFilter]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080e] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-white/60">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------------------
  if (!session) {
    return (
      <div className="min-h-screen bg-[#07080e] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Ambient Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="w-full max-w-md bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-3xl p-8 relative z-10 shadow-2xl">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-950/80 to-blue-900/40 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4 overflow-hidden">
              <img src="/logo.png" alt="STEPHOD" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_#00d2ff]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">STEPHOD Back-Office</h1>
            <p className="text-xs text-white/50 mt-1">ระบบจัดการแอดมินและผู้ใช้งาน</p>
          </div>

          {!configured && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">ยังไม่ได้ตั้งค่า Owner Password</span>
                กรุณาตั้งค่า <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200">ADMIN_OWNER_PASSWORD</code> ใน Environment Variables บน Vercel หรือเซิร์ฟเวอร์
              </div>
            </div>
          )}

          {loginError && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                รหัสผ่านแอดมิน (Admin Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ใส่รหัสผ่านผู้ดูแลระบบ..."
                  className="w-full px-4 py-3.5 pr-11 rounded-2xl bg-black/40 border border-white/10 focus:border-cyan-400 focus:outline-none text-white text-sm placeholder:text-white/30 transition-colors"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading || !configured}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>เข้าสู่ระบบหลังบ้าน</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <Link
              href="/"
              className="text-xs text-white/40 hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <span>← กลับหน้าหลัก STEPHOD Bio</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // MAIN ADMIN DASHBOARD
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#07080e] text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/30 p-1 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <img src="/logo.png" alt="STEPHOD" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide font-mono">
                STEP<span className="text-cyan-400">HOD</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Back-Office
              </span>
            </div>
          </div>
        </div>

        {/* User Role Badge & Actions */}
        <div className="flex items-center gap-3">
          {session.role === 'owner' ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>เจ้าของระบบ (Owner)</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>แอดมิน ({session.name})</span>
            </div>
          )}

          <Link
            href="/"
            target="_blank"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>ดูหน้าเว็บ</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-300 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>ภาพรวม (Overview)</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>จัดการผู้ใช้ ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('announcement')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'announcement'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>ประกาศระบบ {announcement.on && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />}</span>
          </button>

          {session.role === 'owner' && (
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'admins'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>ทีมแอดมิน ({admins.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>ประวัติการกระทำ</span>
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between text-white/50 text-xs mb-2">
                  <span>ผู้ใช้ทั้งหมด</span>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                  {stats.totalUsers}
                </div>
                <div className="text-[11px] text-white/40 mt-1">
                  ใช้งานปกติ {stats.totalUsers - stats.bannedUsers} คน
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white/[0.03] border border-red-500/20 backdrop-blur-md">
                <div className="flex items-center justify-between text-white/50 text-xs mb-2">
                  <span>บัญชีถูกระงับ</span>
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-red-400">
                  {stats.bannedUsers}
                </div>
                <div className="text-[11px] text-red-400/60 mt-1">
                  สถานะ Banned
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between text-white/50 text-xs mb-2">
                  <span>ยอดวิวรวมทั้งหมด</span>
                  <Eye className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                  {stats.totalViews.toLocaleString()}
                </div>
                <div className="text-[11px] text-white/40 mt-1">
                  การเปิดชมโปรไฟล์
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between text-white/50 text-xs mb-2">
                  <span>ยอดถูกใจรวม</span>
                  <Heart className="w-4 h-4 text-pink-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                  {stats.totalLikes.toLocaleString()}
                </div>
                <div className="text-[11px] text-white/40 mt-1">
                  หัวใจสะสมทั้งหมด
                </div>
              </div>
            </div>

            {/* Top 5 Profiles & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Profiles Card */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h2 className="font-semibold text-base">5 อันดับโปรไฟล์ยอดนิยม</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>ดูทั้งหมด</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {stats.top.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-sm">ยังไม่มีข้อมูล</div>
                  ) : (
                    stats.top.map((item, idx) => (
                      <div
                        key={item.username}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs font-mono text-white/70">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                          </span>
                          <div>
                            <div className="font-medium text-sm text-white">{item.displayName}</div>
                            <div className="text-xs text-white/40 font-mono">@{item.username}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{item.views.toLocaleString()}</span>
                          </div>
                          <Link
                            href={`/${item.username}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            title="เปิดดูโปรไฟล์"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* System & KV Status Card */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>สถานะระบบ (System Info)</span>
                  </h2>

                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <span className="text-white/50">ฐานข้อมูล KV Store</span>
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Online (echovalue)
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <span className="text-white/50">ความปลอดภัยของเซสชัน</span>
                      <span className="text-white/80 font-mono">HMAC-SHA256 (12 ชม.)</span>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <span className="text-white/50">สิทธิ์ปัจจุบัน</span>
                      <span className="text-cyan-400 font-semibold uppercase">{session.role}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white/50">ประกาศระบบ</span>
                      <span className={announcement.on ? 'text-emerald-400 font-medium' : 'text-white/40'}>
                        {announcement.on ? 'กำลังเปิดใช้งาน' : 'ปิดอยู่'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      fetchUsers();
                      fetchAnnouncement();
                      fetchAudit();
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>รีเฟรชข้อมูลภาพรวม</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 2: USER MANAGEMENT */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="ค้นหาชื่อผู้ใช้ หรือ DisplayName..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none transition-colors"
                />
                {userSearch && (
                  <button
                    onClick={() => setUserSearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 self-start sm:self-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-colors ${
                    statusFilter === 'all' ? 'bg-white/15 text-white font-medium' : 'text-white/50 hover:text-white'
                  }`}
                >
                  ทั้งหมด ({users.length})
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-colors ${
                    statusFilter === 'active' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-white/50 hover:text-white'
                  }`}
                >
                  ปกติ ({users.filter((u) => !u.banned).length})
                </button>
                <button
                  onClick={() => setStatusFilter('banned')}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-colors ${
                    statusFilter === 'banned' ? 'bg-red-500/20 text-red-300 font-medium' : 'text-white/50 hover:text-white'
                  }`}
                >
                  ถูกระงับ ({users.filter((u) => u.banned).length})
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-white/[0.02] border-b border-white/10 text-white/50 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">ผู้ใช้งาน</th>
                      <th className="py-3.5 px-4">สถานะ</th>
                      <th className="py-3.5 px-4 text-center">ยอดวิว / ไลก์</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-white/40">
                          {dataLoading ? 'กำลังโหลดข้อมูลผู้ใช้...' : 'ไม่พบข้อมูลผู้ใช้ที่ตรงกับการค้นหา'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.username} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-900/40 to-blue-900/30 border border-white/10 flex items-center justify-center font-bold text-sm text-cyan-300 overflow-hidden shrink-0">
                                {u.username.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-white flex items-center gap-1.5">
                                  <span>{u.displayName}</span>
                                </div>
                                <div className="text-xs text-white/40 font-mono flex items-center gap-2">
                                  <span>@{u.username}</span>
                                  {u.owner && (
                                    <span className="text-[10px] text-white/30 hidden sm:inline">
                                      ({u.owner})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {u.banned ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-medium">
                                <ShieldAlert className="w-3 h-3" />
                                <span>ถูกระงับ</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
                                <UserCheck className="w-3 h-3" />
                                <span>ปกติ</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-3 font-mono text-xs">
                              <span className="flex items-center gap-1 text-cyan-400" title="ยอดวิว">
                                <Eye className="w-3.5 h-3.5" />
                                {u.views.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1 text-pink-400" title="ยอดไลก์">
                                <Heart className="w-3.5 h-3.5" />
                                {u.likes.toLocaleString()}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Profile */}
                              <Link
                                href={`/${u.username}`}
                                target="_blank"
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                title="เปิดดูหน้าโปรไฟล์"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              {/* Edit Profile */}
                              <button
                                onClick={() => openEditUser(u.username)}
                                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-colors"
                                title="แก้ไขข้อมูลโปรไฟล์"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Badge Management */}
                              <button
                                onClick={() => openBadgeModal(u.username)}
                                className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-colors"
                                title="จัดการตราสัญลักษณ์"
                              >
                                <Award className="w-4 h-4" />
                              </button>

                              {/* Ban / Unban */}
                              <button
                                onClick={() => {
                                  setBanningUser(u);
                                  setBanReasonInput('');
                                }}
                                className={`p-2 rounded-xl transition-colors ${
                                  u.banned
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
                                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300'
                                }`}
                                title={u.banned ? 'ปลดการระงับ' : 'ระงับบัญชี'}
                              >
                                {u.banned ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                              </button>

                              {/* Delete Profile */}
                              <button
                                onClick={() => setDeletingUser(u)}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                title="ลบโปรไฟล์"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 3: SITE ANNOUNCEMENT */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'announcement' && (
          <div className="max-w-3xl space-y-6">
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-cyan-400" />
                    <span>แถบประกาศทั้งระบบ (Site-wide Announcement)</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">
                    ข้อความประกาศจะแสดงที่ด้านบนสุดของหน้าหลักและหน้าโปรไฟล์ทุกหน้า
                  </p>
                </div>

                {/* ON / OFF Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcement.on}
                    onChange={(e) => setAnnouncement({ ...announcement, on: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  <span className="ml-3 text-xs font-semibold text-white/80">
                    {announcement.on ? 'เปิดใช้งาน' : 'ปิดอยู่'}
                  </span>
                </label>
              </div>

              {/* Type Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                  รูปแบบประกาศ (Type)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setAnnouncement({ ...announcement, type: 'info' })}
                    className={`p-3 rounded-2xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      announcement.type === 'info'
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-lg shadow-blue-500/10'
                        : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <Info className="w-4 h-4 text-blue-400" />
                    <span>ข้อมูล (Info)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAnnouncement({ ...announcement, type: 'warn' })}
                    className={`p-3 rounded-2xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      announcement.type === 'warn'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/10'
                        : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>แจ้งเตือน (Warn)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAnnouncement({ ...announcement, type: 'success' })}
                    className={`p-3 rounded-2xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      announcement.type === 'success'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10'
                        : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>สำเร็จ (Success)</span>
                  </button>
                </div>
              </div>

              {/* Text Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    ข้อความประกาศ (Announcement Message)
                  </label>
                  <span className="text-[11px] font-mono text-white/40">
                    {announcement.text.length} / 160
                  </span>
                </div>
                <textarea
                  value={announcement.text}
                  onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value.slice(0, 160) })}
                  rows={3}
                  placeholder="เช่น ยินดีต้อนรับสู่ระบบ STEPHOD Bio เวอร์ชั่นใหม่!"
                  className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none resize-none transition-colors"
                />
              </div>

              {/* Live Preview */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                  ตัวอย่างการแสดงผลจริง (Live Preview)
                </label>
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <AnnouncementBanner announcement={announcement} />
                </div>
              </div>

              {announceMsg && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                    announceMsg.type === 'ok'
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/15 border border-red-500/30 text-red-300'
                  }`}
                >
                  {announceMsg.type === 'ok' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <span>{announceMsg.text}</span>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSaveAnnouncement}
                disabled={announceSaving}
                className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                {announceSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังบันทึกประกาศ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>บันทึกการตั้งค่าประกาศ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 4: ADMIN TEAM (OWNER ONLY) */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'admins' && session.role === 'owner' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Admin Form */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md h-fit">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <span>เพิ่มแอดมินใหม่ (Add Admin)</span>
              </h2>

              {adminError && (
                <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">
                    ชื่อแอดมิน (Username)
                  </label>
                  <input
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value.toLowerCase())}
                    placeholder="เช่น mod_john (a-z, 0-9, _)"
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">
                    รหัสผ่าน (Password)
                  </label>
                  <input
                    type="password"
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>

                <p className="text-[11px] text-white/40 leading-relaxed">
                  * แอดมินสามารถจัดการผู้ใช้, ตราสัญลักษณ์, และประกาศได้ แต่ไม่สามารถเพิ่มหรือลบแอดมินคนอื่นได้
                </p>

                <button
                  type="submit"
                  disabled={adminSaving}
                  className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs sm:text-sm transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {adminSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>สร้างบัญชีแอดมิน</span>
                </button>
              </form>
            </div>

            {/* Admin List */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span>รายชื่อผู้มีสิทธิ์ดูแลระบบ ({admins.length + 1})</span>
                </h2>
              </div>

              <div className="space-y-3">
                {/* Owner Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 to-pink-950/20 border border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-amber-400">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm flex items-center gap-2">
                        <span>เจ้าของระบบ (System Owner)</span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                          OWNER
                        </span>
                      </div>
                      <div className="text-xs text-white/40">
                        ควบคุมผ่าน <code className="text-purple-300 font-mono">ADMIN_OWNER_PASSWORD</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub Admins */}
                {admins.map((adm) => (
                  <div
                    key={adm.name}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm flex items-center gap-2">
                          <span>{adm.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-bold">
                            ADMIN
                          </span>
                        </div>
                        <div className="text-xs text-white/40">
                          สร้างเมื่อ {new Date(adm.createdAt).toLocaleDateString('th-TH')} โดย {adm.by}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveAdmin(adm.name)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="ลบสิทธิ์แอดมิน"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 5: AUDIT LOG */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span>บันทึกการกระทำของผู้ดูแลระบบ (Audit Log)</span>
                </h2>
                <p className="text-xs text-white/50 mt-0.5">
                  เก็บบันทึกประวัติการกระทำล่าสุดของแอดมินทุกคน เพื่อความโปร่งใสและตรวจสอบได้
                </p>
              </div>

              <button
                onClick={fetchAudit}
                disabled={auditLoading}
                className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
                <span>รีเฟรช Log</span>
              </button>
            </div>

            <div className="rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md overflow-hidden">
              <div className="divide-y divide-white/5">
                {auditLogs.length === 0 ? (
                  <div className="py-12 text-center text-white/40 text-xs">ยังไม่มีประวัติการกระทำ</div>
                ) : (
                  auditLogs.map((log, idx) => {
                    const actionConfig: Record<string, { label: string; color: string }> = {
                      edit: { label: 'แก้ไขข้อมูล', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
                      ban: { label: 'ระงับบัญชี', color: 'bg-red-500/15 text-red-300 border-red-500/30' },
                      unban: { label: 'ปลดการระงับ', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
                      'badge+': { label: 'มอบตรา', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
                      'badge-': { label: 'ถอดตรา', color: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
                      delete: { label: 'ลบโปรไฟล์', color: 'bg-red-600/20 text-red-200 border-red-600/40' },
                      announce: { label: 'เปิดประกาศ', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
                      'announce-off': { label: 'ปิดประกาศ', color: 'bg-white/10 text-white/60 border-white/20' },
                      'admin+': { label: 'เพิ่มแอดมิน', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
                      'admin-': { label: 'ลบแอดมิน', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
                    };
                    const cfg = actionConfig[log.x] || { label: log.x, color: 'bg-white/10 text-white/60 border-white/20' };

                    return (
                      <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-white/[0.01] transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          <span className="font-semibold text-white/90">โดย {log.a}</span>
                          {log.g && (
                            <span className="text-white/50">
                              เป้าหมาย: <code className="text-cyan-300 font-mono">@{log.g}</code>
                            </span>
                          )}
                        </div>

                        <div className="text-white/40 font-mono text-[11px]">
                          {new Date(log.t * 1000).toLocaleString('th-TH', {
                            dateStyle: 'short',
                            timeStyle: 'medium',
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 1: EDIT USER */}
      {/* --------------------------------------------------------------------- */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e111a] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>แก้ไขโปรไฟล์ @{editingUser.username}</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">ชื่อที่แสดง (Display Name)</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  maxLength={40}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">ประวัติย่อ (Bio)</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  maxLength={300}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs sm:text-sm focus:border-cyan-400 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">อาชีพ (Occupation)</label>
                  <input
                    type="text"
                    value={editForm.occupation}
                    onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                    maxLength={60}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">สถานที่ (Location)</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    maxLength={60}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs text-white/70 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveEditUser}
                disabled={editSaving}
                className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                {editSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>บันทึกการเปลี่ยนแปลง</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 2: BAN / UNBAN */}
      {/* --------------------------------------------------------------------- */}
      {banningUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e111a] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                {banningUser.banned ? (
                  <>
                    <Unlock className="w-4 h-4 text-emerald-400" />
                    <span>ปลดการระงับบัญชี @{banningUser.username}</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>ระงับบัญชี @{banningUser.username}</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setBanningUser(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!banningUser.banned ? (
              <div className="space-y-4">
                <p className="text-xs text-white/70 leading-relaxed">
                  เมื่อระงับบัญชี ผู้เข้าชมโปรไฟล์จะเห็นหน้าแจ้งเตือนการระงับบัญชี และเจ้าของบัญชีจะไม่สามารถแก้ไขโปรไฟล์ได้
                </p>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">
                    เหตุผลในการระงับ (จะแสดงให้ผู้ใช้เห็น)
                  </label>
                  <input
                    type="text"
                    value={banReasonInput}
                    onChange={(e) => setBanReasonInput(e.target.value)}
                    placeholder="เช่น ละเมิดข้อกำหนดการใช้งาน, เนื้อหาไม่เหมาะสม"
                    maxLength={80}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs sm:text-sm focus:border-red-400 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/70 leading-relaxed">
                คุณต้องการปลดการระงับบัญชี @{banningUser.username} เพื่อให้สามารถกลับมาใช้งานและเข้าชมโปรไฟล์ได้ตามปกติหรือไม่?
              </p>
            )}

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setBanningUser(null)}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs text-white/70 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleToggleBan}
                disabled={banSaving}
                className={`px-5 py-2.5 rounded-2xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
                  banningUser.banned
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                    : 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20'
                }`}
              >
                {banSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : banningUser.banned ? (
                  <Unlock className="w-3.5 h-3.5" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5" />
                )}
                <span>{banningUser.banned ? 'ยืนยันปลดการระงับ' : 'ยืนยันการระงับบัญชี'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 3: BADGES MANAGEMENT */}
      {/* --------------------------------------------------------------------- */}
      {badgeModalUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e111a] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>จัดการตราสัญลักษณ์ @{badgeModalUser.username}</span>
                </h3>
                <p className="text-[11px] text-white/50 mt-0.5">
                  ตราที่มอบโดยแอดมินจะไม่ถูกลบหรือเขียนทับเมื่อผู้ใช้กดบันทึกโปรไฟล์เอง
                </p>
              </div>
              <button
                onClick={() => setBadgeModalUser(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {badgePresets.map((preset) => {
                const hasBadge = (badgeModalUser.badges || []).some(
                  (b) => b.id === preset.id || b.name === preset.name
                );
                const isWorking = badgeActionLoading === preset.id;

                return (
                  <div
                    key={preset.id}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                        style={{ backgroundColor: `${preset.color}20`, border: `1px solid ${preset.color}40` }}
                      >
                        <Award className="w-4 h-4" style={{ color: preset.color }} />
                      </div>
                      <div>
                        <div className="font-medium text-xs sm:text-sm text-white flex items-center gap-1.5">
                          <span>{preset.name}</span>
                        </div>
                        <div className="text-[11px] text-white/40">{preset.description}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleBadge(preset.id, hasBadge)}
                      disabled={isWorking}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                        hasBadge
                          ? 'bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30'
                          : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isWorking ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : hasBadge ? (
                        <>
                          <X className="w-3.5 h-3.5" />
                          <span>ถอดตรา</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>มอบตรา</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setBadgeModalUser(null)}
                className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-xs text-white font-medium transition-colors"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 4: DELETE USER */}
      {/* --------------------------------------------------------------------- */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e111a] border border-red-500/30 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">ยืนยันการลบโปรไฟล์</h3>
                <p className="text-xs text-red-400">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed mb-6">
              คุณแน่ใจหรือไม่ว่าต้องการลบโปรไฟล์ <span className="text-white font-semibold font-mono">@{deletingUser.username}</span> ({deletingUser.displayName}) ออกจากระบบอย่างถาวร?
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs text-white/70 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleteSaving}
                className="px-5 py-2.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold text-xs transition-all shadow-lg shadow-red-500/25 flex items-center gap-1.5"
              >
                {deleteSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>ยืนยันการลบถาวร</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
