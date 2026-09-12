import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  PlusCircle, 
  Search, 
  Layers, 
  Bell, 
  User as UserIcon, 
  HelpCircle, 
  LogOut, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Lock, 
  Phone,
  Inbox,
  RefreshCw
} from 'lucide-react';
import { Report, EnrichedMatch, NotificationItem } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { MatchDetailModal } from './MatchDetailModal';

interface DashboardProps {
  initialSubView?: 'overview' | 'lost' | 'found' | 'matches' | 'notifications' | 'profile' | 'help';
  onReportLostClick: () => void;
  onReportFoundClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  initialSubView = 'overview',
  onReportLostClick,
  onReportFoundClick,
}) => {
  const { user, logout, isProfileComplete, updateProfile } = useAuth();
  const [subView, setSubView] = useState<'overview' | 'lost' | 'found' | 'matches' | 'notifications' | 'profile' | 'help'>(initialSubView);

  const [reports, setReports] = useState<Report[]>([]);
  const [matches, setMatches] = useState<EnrichedMatch[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Match Modal State
  const [selectedMatch, setSelectedMatch] = useState<EnrichedMatch | null>(null);

  // Profile Edit State within Profile Tab
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    mobile: user?.mobile || '',
    studentId: user?.studentId || '',
    department: user?.department || '',
    year: user?.year || '',
    email: user?.email || '',
  });
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [repsRes, matchesRes, notifsRes] = await Promise.all([
        api.getMyReports(),
        api.getMyMatches(),
        api.getNotifications(),
      ]);
      setReports(repsRes.reports || []);
      setMatches(matchesRes.matches || []);
      setNotifications(notifsRes.notifications || []);
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const lostReports = reports.filter(r => r.type === 'LOST');
  const foundReports = reports.filter(r => r.type === 'FOUND');
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const handleMarkNotifRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner Header */}
      <div className="border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-widest text-indigo-600">
                CAMPUSFIND AI
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-500 font-medium">Verified Student Portal</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 mt-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Welcome, <span className="text-indigo-600">{user?.fullName || 'Student'}</span>
              </h1>
              {user?.department && (
                <span className="inline-flex items-center rounded-lg bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 text-xs font-bold text-indigo-700">
                  {user.department} {user.year ? `• ${user.year}` : ''}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="dash-report-lost-btn"
              onClick={onReportLostClick}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-rose-700 active:scale-[0.98] transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>REPORT LOST ITEM</span>
            </button>

            <button
              id="dash-report-found-btn"
              onClick={onReportFoundClick}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition"
            >
              <Search className="h-4 w-4" />
              <span>REPORT FOUND ITEM</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Bar */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex border-t border-slate-100 overflow-x-auto">
          <button
            id="dash-tab-overview"
            onClick={() => setSubView('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition shrink-0 ${
              subView === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard Overview
          </button>
          <button
            id="dash-tab-lost"
            onClick={() => setSubView('lost')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition shrink-0 flex items-center gap-1.5 ${
              subView === 'lost' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>My Lost Items</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 font-mono">
              {lostReports.length}
            </span>
          </button>
          <button
            id="dash-tab-found"
            onClick={() => setSubView('found')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition shrink-0 flex items-center gap-1.5 ${
              subView === 'found' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>My Found Items</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 font-mono">
              {foundReports.length}
            </span>
          </button>
          <button
            id="dash-tab-matches"
            onClick={() => setSubView('matches')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition shrink-0 flex items-center gap-1.5 ${
              subView === 'matches' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Matches</span>
            {matches.length > 0 && (
              <span className="rounded-full bg-indigo-100 text-indigo-700 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                {matches.length}
              </span>
            )}
          </button>
          <button
            id="dash-tab-notifs"
            onClick={() => setSubView('notifications')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition shrink-0 flex items-center gap-1.5 ${
              subView === 'notifications' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Notifications</span>
            {unreadNotifs > 0 && (
              <span className="rounded-full bg-rose-500 text-white px-1.5 py-0.2 text-[10px] font-mono font-bold">
                {unreadNotifs}
              </span>
            )}
          </button>
          <button
            id="dash-tab-profile"
            onClick={() => setSubView('profile')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition shrink-0 ${
              subView === 'profile' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Profile
          </button>
          <button
            id="dash-tab-help"
            onClick={() => setSubView('help')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition shrink-0 ${
              subView === 'help' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Help
          </button>
          <button
            id="dash-tab-logout"
            onClick={logout}
            className="py-3 px-4 text-xs font-bold text-slate-500 hover:text-rose-600 transition shrink-0 ml-auto"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Real Database Statistics (0 for new user as required by Section 10) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Lost Items</span>
            <span className="font-['Space_Grotesk'] text-3xl font-extrabold text-slate-900 mt-1 block">
              {lostReports.length}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Active claims</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Found Items</span>
            <span className="font-['Space_Grotesk'] text-3xl font-extrabold text-slate-900 mt-1 block">
              {foundReports.length}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Reported by you</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Matches</span>
            <span className="font-['Space_Grotesk'] text-3xl font-extrabold text-indigo-600 mt-1 block">
              {matches.length}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Computed correlations</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Notifications</span>
            <span className="font-['Space_Grotesk'] text-3xl font-extrabold text-slate-900 mt-1 block">
              {unreadNotifs}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Unread alerts</span>
          </div>
        </div>

        {/* SUBVIEW: OVERVIEW */}
        {subView === 'overview' && (
          <div className="space-y-8">
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                onClick={onReportLostClick}
                className="group relative cursor-pointer rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/70 via-white to-white p-6 shadow-xs transition hover:shadow-md hover:border-rose-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/20">
                    <PlusCircle className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Lost Something?</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">REPORT LOST ITEM</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Provide item details, brand, model, and campus location. CampusFind AI immediately scans active found records for matches.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-rose-600">
                  <span>Start AI conversational intake</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              <div 
                onClick={onReportFoundClick}
                className="group relative cursor-pointer rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-white p-6 shadow-xs transition hover:shadow-md hover:border-indigo-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                    <Search className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Found Something?</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">REPORT FOUND ITEM</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Help a fellow student by submitting items you picked up in classrooms, labs, or cafeterias. Keep contact safe until qualified.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                  <span>Submit item details</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>

            {/* Recent Matches Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Active Matches</h3>
                  <p className="text-xs text-slate-500">Items correlated by deterministic formula</p>
                </div>
                {matches.length > 0 && (
                  <button 
                    onClick={() => setSubView('matches')} 
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View All ({matches.length}) →
                  </button>
                )}
              </div>

              {matches.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No active matches yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    When another student registers a corresponding report, CampusFind AI will automatically score and link them here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMatch(m)}
                      className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-300 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="font-mono text-xs font-bold text-indigo-600">
                          {m.score}% {m.level}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {m.lostCaseId} ↔ {m.foundCaseId}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm">
                        {m.myReport?.itemType} ({m.myReport?.brand})
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Matched with {m.otherReport?.itemType} found at {m.otherReport?.location}
                      </p>

                      <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        <span className={m.contactAvailable ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                          {m.contactAvailable ? '✓ Contact Unlocked' : '🔒 Contact Hidden (<50%)'}
                        </span>
                        <span className="text-indigo-600 font-bold group-hover:underline">
                          Inspect Details →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBVIEW: MY LOST ITEMS */}
        {subView === 'lost' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">My Lost Item Reports</h3>
                <p className="text-xs text-slate-500">Real records created under your authenticated account</p>
              </div>
              <button
                onClick={onReportLostClick}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>REPORT LOST ITEM</span>
              </button>
            </div>

            {lostReports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No lost items reported yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Did you misplace a gadget, book, or personal item on campus? Report it to initiate automatic scanning.
                </p>
                <button
                  onClick={onReportLostClick}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition"
                >
                  Report Lost Item Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lostReports.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="font-mono text-xs font-bold text-slate-900">{r.caseId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        r.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'ADMIN_REVIEW_REQUIRED' ? 'bg-red-100 text-red-800' :
                        r.isTheftSuspicious ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{r.itemType}</h4>
                      <p className="text-xs text-slate-600">{r.brand} — {r.model} • {r.colour}</p>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{r.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{r.dateLostFound} — {r.approxTime}</span>
                      </div>
                    </div>

                    {r.isTheftSuspicious && (
                      <div className="rounded-lg bg-amber-50 p-2 text-[11px] text-amber-800 font-medium">
                        ⚠ Flagged as suspicious / suspected theft
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-400">
                      Reported on {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBVIEW: MY FOUND ITEMS */}
        {subView === 'found' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">My Found Item Reports</h3>
                <p className="text-xs text-slate-500">Items you discovered and reported for peer safe handover</p>
              </div>
              <button
                onClick={onReportFoundClick}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
              >
                <Search className="h-4 w-4" />
                <span>REPORT FOUND ITEM</span>
              </button>
            </div>

            {foundReports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No found items reported yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Did you find someone's belongings on campus? Register them to reunite the item with its rightful owner safely.
                </p>
                <button
                  onClick={onReportFoundClick}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
                >
                  Report Found Item Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {foundReports.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="font-mono text-xs font-bold text-slate-900">{r.caseId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        r.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{r.itemType}</h4>
                      <p className="text-xs text-slate-600">{r.brand} — {r.model} • {r.colour}</p>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>Found at: {r.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{r.dateLostFound} — {r.approxTime}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-400">
                      Reported on {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBVIEW: MATCHES */}
        {subView === 'matches' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">All Correlated Matches</h3>
                <p className="text-xs text-slate-500">Deterministic scoring comparisons across real active cases</p>
              </div>
              <button
                onClick={loadData}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {matches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No matches found currently</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  When matching items are reported by campus peers, they will appear here with full factor breakdowns.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-indigo-300 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                          {m.score}%
                        </div>
                        <div>
                          <span className="font-mono text-xs font-bold text-slate-900 block">
                            {m.level}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {m.lostCaseId} (Lost) ↔ {m.foundCaseId} (Found)
                          </span>
                        </div>
                      </div>

                      <div>
                        {m.score < 50 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            <Lock className="h-3.5 w-3.5" />
                            <span>Contact Hidden (&lt;50%)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                            <Phone className="h-3.5 w-3.5" />
                            <span>Contact Unlocked</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <strong className="block text-slate-700 mb-1">My Item:</strong>
                        <p className="text-slate-900 font-medium">
                          {m.myReport?.itemType} ({m.myReport?.brand} {m.myReport?.model})
                        </p>
                        <p className="text-slate-500">{m.myReport?.location} • {m.myReport?.colour}</p>
                      </div>

                      <div>
                        <strong className="block text-slate-700 mb-1">Matched Candidate:</strong>
                        <p className="text-slate-900 font-medium">
                          {m.otherReport?.itemType} ({m.otherReport?.brand} {m.otherReport?.model})
                        </p>
                        <p className="text-slate-500">{m.otherReport?.location} • {m.otherReport?.colour}</p>
                      </div>
                    </div>

                    {/* Matched reasons pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.reasons.slice(0, 3).map((r, i) => (
                        <span key={i} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 font-medium">
                          {r}
                        </span>
                      ))}
                      {m.reasons.length > 3 && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 font-medium">
                          +{m.reasons.length - 3} more factors
                        </span>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                      <button
                        onClick={() => setSelectedMatch(m)}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                      >
                        OPEN FULL MATCH WORKFLOW →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBVIEW: NOTIFICATIONS */}
        {subView === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">Real updates for reports, matches, and handover schedules</p>
            </div>

            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Bell className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No notifications yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  You're all caught up! New case events will trigger notifications here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkNotifRead(n.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition ${
                      n.read
                        ? 'border-slate-200 bg-white text-slate-700'
                        : 'border-indigo-200 bg-indigo-50/50 text-slate-900 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-xs font-bold">{n.title}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBVIEW: PROFILE */}
        {subView === 'profile' && (
          <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Student Profile</h3>
              <p className="text-xs text-slate-500">
                Manage your registered contact and academic credentials for verified matching.
              </p>
            </div>

            {profileSavedMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Profile updated successfully.</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={profileForm.mobile}
                    onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Student ID</label>
                  <input
                    type="text"
                    value={profileForm.studentId}
                    onChange={(e) => setProfileForm({ ...profileForm, studentId: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="dash-dept" className="block text-xs font-semibold uppercase text-slate-600 mb-1">DEPARTMENT *</label>
                  <select
                    id="dash-dept"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 outline-hidden"
                  >
                    <option value="" disabled>Select Department</option>
                    <option value="AI&DS">AI&DS</option>
                    <option value="CSE">CSE</option>
                    <option value="AI&ML">AI&ML</option>
                    <option value="ECE">ECE</option>
                    <option value="MECHATRONICS">MECHATRONICS</option>
                    <option value="BIO TECH">BIO TECH</option>
                    <option value="AGRI">AGRI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Year</label>
                  <select
                    value={profileForm.year}
                    onChange={(e) => setProfileForm({ ...profileForm, year: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 outline-hidden"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="Final Year">Final Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                >
                  SAVE CHANGES
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUBVIEW: HELP */}
        {subView === 'help' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">CampusFind AI Guidelines &amp; FAQs</h3>
              <p className="text-xs text-slate-500">Everything you need to know about safe item recovery</p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h4 className="font-bold text-slate-900">How does the 50% Contact Rule work?</h4>
                <p className="mt-1.5 text-slate-600 leading-relaxed">
                  To protect student privacy and prevent spam, registered student phone numbers and names remain locked if a match score is below 50%. Once the deterministic score reaches 50% or higher, verified contact details become accessible.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h4 className="font-bold text-slate-900">What is the 3-Attempt Ownership Verification limit?</h4>
                <p className="mt-1.5 text-slate-600 leading-relaxed">
                  Before handing over an item, the claimant must answer a challenge question based on unique characteristics (lock configuration, stickers, unique scratches). If a claimant fails 3 consecutive times, the case is automatically escalated to Campus Security for manual review.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h4 className="font-bold text-slate-900">What is the 24-Hour Theft Auto-Escalation?</h4>
                <p className="mt-1.5 text-slate-600 leading-relaxed">
                  When a report is flagged as suspected theft or taken under suspicious circumstances, the Campus Control Room monitors it on high priority. If unresolved after 24 hours, the case is automatically escalated directly inside the Campus Control Room for prioritized security review.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          isOpen={Boolean(selectedMatch)}
          onClose={() => setSelectedMatch(null)}
          onRefreshMatches={loadData}
        />
      )}
    </div>
  );
};
